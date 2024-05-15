import { db, dbExitEndCollectionName, dbLogsCollectionName } from "$lib/firebaseConfig";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";

// Function for send log to Firestore
const addRemoteLog = async (dataLogs, {isExitEndLog = false} = {}) => {
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
  const logEntry = dataLogs;
  addRemoteLog(logEntry, {isExitEndLog: isExitEndLog});
};

// Function to get logs (remote: Firestore)
export const getRemoteLogs = async (userUid) => {
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

    return remoteLogs;

  } catch (error) {
    console.error('Error at obtain user logs: ', error);
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
export async function downloadLogs(format = 'json', userUid) {
  const logs = await getRemoteLogs(userUid) || [];
  if(logs.length === 0) {
    alert('No logs to download for user ID: ' + userUid + '.');
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
