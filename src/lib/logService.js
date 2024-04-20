import { db } from "$lib/firebaseConfig";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { deepCopy } from "./utils";

// Logs array
let logs = [];

// Check if is client side
const isClient = !import.meta.env.SSR;
if (isClient) logs = JSON.parse(sessionStorage.getItem('logs')) || [];

// Function for send log to Firestore
const addRemoteLog = async (dataLogs) => {
  try {
    const logsCollection = collection(db, 'usageLogs');
    const docRef = await addDoc(logsCollection, dataLogs);
    console.log('Log save with ID: ', docRef.id);
  } catch (error) {
    console.error('Error at saving log: ', error);
  }
};

// Function to add a log
export const addLog = (dataLogs) => {
  const logEntry = deepCopy(dataLogs);
  logs.push(logEntry);
  console.log('Data saved in logs: ', logEntry);
  if (isClient) sessionStorage.setItem('logs', JSON.stringify(logs));
  if (dataLogs.userId != null) addRemoteLog(dataLogs);
};

// Function to get logs (local)
export const getLogs = () => {
  if (isClient) return JSON.parse(sessionStorage.getItem('logs')) || [];

  return logs;
};

// Function to get logs (remote: Firestore)
export const getRemoteLogs = async (userUid) => {
  try {
    const qUid = query(collection(db, 'usageLogs'), where('userUid', '==', userUid));
    const qId = query(collection(db, 'usageLogs'), where('userId', '==', userUid));
    const uidQuerySnapshot = await getDocs(qUid);
    const idQuerySnapshot = await getDocs(qId);
    let remoteLogs = [];
    uidQuerySnapshot.forEach((doc) => {
      remoteLogs.push({...doc.data(), id: doc.id});
    });
    idQuerySnapshot.forEach((doc) => {
      const exist = remoteLogs.some(log => log.id === doc.id);
      if(!exist) remoteLogs.push({...doc.data(), id: doc.id});
    });
    console.log('User logs: ', remoteLogs);
    return remoteLogs;

  } catch (error) {
    console.error('Error at obtain user logs: ', error);
    return null;
  }
};

// Function to convert logs to CSV
export function convertToCSV(data) {
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
export async function downloadLogs(format = 'json', userUid = null) {
  const logs = userUid ? (await getRemoteLogs(userUid) || []) : getLogs();
  let data;
  let filename;
  let mimeType;
  if(!logs) return;
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

// Handler for download local logs in JSON format
export function downloadJsonLocal(){
  return downloadLogs('json');
}

// Handler for download local logs in CSV format
export function downloadCsvLocal(){
  return downloadLogs('csv');
}

// Handler for download remote(Firestore) logs in JSON format
export function downloadJsonRemote(userUid){
  return downloadLogs('json', userUid);
}

// Handler for download remote(Firestore) logs in CSV format
export function downloadCsvRemote(userUid){
  return downloadLogs('csv', userUid);
}
