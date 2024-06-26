import { USE_FIREBASE, db, dbExitEndCollectionName, dbLogsCollectionName } from "$lib/firebaseConfig";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRemoteDb } from "../stores";

const MAX_LOG_SIZE = 4 * 1024 * 1024; // 4MB, 1MB reserved for other data
let localLogs = [];

function getStringSize(str) {
  return new Blob([str]).size;
}

export function getTotalLocalStorageSize() {
  let totalSize = 0;
  for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
          totalSize += getStringSize(localStorage[key]);
      }
  }
  return totalSize;
}

function getLocalLogs(){
  localStorage.getItem('localLogs') ? localLogs = JSON.parse(localStorage.getItem('localLogs')) : localLogs = [];
}

function saveLocalLogs() {
  localStorage.setItem('localLogs', JSON.stringify(localLogs));
}

function addLocalLog(logs) {
  getLocalLogs();
  localLogs.push(logs);

  // Check if logs exceed the maximum size
  let logsSize = getStringSize(JSON.stringify(localLogs));
  let currentStorageSize = getTotalLocalStorageSize();

  // Delete oldest logs until the size is less than the maximum
  while (logsSize + currentStorageSize >= MAX_LOG_SIZE) {
    logs.shift(); // Delete oldest logs
    logsSize = getStringSize(JSON.stringify(logs));
    currentStorageSize = getTotalLocalStorageSize();
  }

  saveLocalLogs();
  localLogs = []; // Clear local logs variable
}

// Function for send log to Firestore
const addRemoteLog = async (dataLogs, {isExitEndLog = false} = {}) => {
  if(!USE_FIREBASE) return;

  try {
    const collectionName = isExitEndLog ? dbExitEndCollectionName : dbLogsCollectionName;
    const logsCollection = collection(db, collectionName);
    const docRef = await addDoc(logsCollection, dataLogs);
  } catch (error) {
    console.error('Error at saving log: ', error);
  }
};

// Function to add a log
export const addLog = async (dataLogs, {isExitEndLog = false} = {}) => {
  let useRemoteDb_value;
  const unsubscribeUseRemoteDb = useRemoteDb.subscribe((value) => useRemoteDb_value = value);

  const logEntry = dataLogs;
  addLocalLog(logEntry);// Add log to local storage
  if(useRemoteDb_value) addRemoteLog(logEntry, {isExitEndLog: isExitEndLog});
  unsubscribeUseRemoteDb();
};

// Function to get logs (remote: Firestore)
export const getRemoteLogs = async (userUid) => {
  if(!USE_FIREBASE) return null;

  let useRemoteDb_value;
  const unsubscribeUseRemoteDb = useRemoteDb.subscribe((value) => useRemoteDb_value = value);
  if(!useRemoteDb_value){
    unsubscribeUseRemoteDb();
    return null;
  }

  try {
    const qId = query(collection(db, dbLogsCollectionName), where('userId', '==', userUid));
    const idQuerySnapshot = await getDocs(qId);
    const qIdExitEnd = query(collection(db, dbExitEndCollectionName), where('userId', '==', userUid));
    const idQuerySnapshotExitEnd = await getDocs(qIdExitEnd);
    let remoteLogs = [];

    idQuerySnapshot.forEach((doc) => {
      remoteLogs.push({...doc.data(), id: doc.id});
    });
    idQuerySnapshotExitEnd.forEach((doc) => {
      remoteLogs.push({...doc.data(), id: doc.id});
    });

    unsubscribeUseRemoteDb();
    return remoteLogs;

  } catch (error) {
    console.error('Error at obtain user logs: ', error);
    unsubscribeUseRemoteDb();
    return null;
  }
};

// Function to convert logs to CSV
export function convertToCSV(data) {
  data = data.map(log => {
    const {details, ...rest} = log;
    return {...rest, ...details};
  });
  
  const csvRows = [];

  // Obtain all unique keys
  const allKeys = data.reduce((acc, log) => {
      return acc.concat(Object.keys(log));
  }, []);

  // Delete duplicates
  const uniqueKeys = [...new Set(allKeys)];

  // Add unique keys as csv headers
  csvRows.push(uniqueKeys.join(','));

  // Iterate on logs and create rows
  for (const row of data) {
      const values = uniqueKeys.map(key => {
        const value = row[key];
        // Convert arrays to JSON string
        if (Array.isArray(value)){
            return '"' + JSON.stringify(value).replace(/"/g, '""') + '"';
        }
        else if (typeof value === 'object' && value !== null) {
            // Convert object in an array of one element
            return '"[' + JSON.stringify(value).replace(/"/g, '""') + ']"';
        }
        else if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`; // In double quotes if have quotes
        } else if (typeof value === 'boolean') {
            return value.toString(); // Convert to text
        } else{
            return value;
        }
      });
      csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Function to download logs in JSON or CSV format and from local or remote (Firestore)
export async function downloadLogs(format = 'json', userUid, {local = false} = {}) {
  if(local){
    getLocalLogs();
  }
  const logs = local ? localLogs : (await getRemoteLogs(userUid) || []);
  if(logs.length === 0) {
    if(local) alert('No logs to download from local storage.');
    else alert('No logs to download for user ID: ' + userUid + '.');
    return;
  }
  let data;
  let filename;
  let mimeType;
  if(format === 'json'){
      data = JSON.stringify(logs, null, 2);
      filename = 'logs.json';
      mimeType = 'application/json';
  } else if(format === 'csv'){
      data = convertToCSV(logs);
      filename = 'logs.csv';
      mimeType = 'text/csv';
  } else{
      throw new Error('Not valid format. Must be "json" or "csv".');
  }

  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
