import { db } from "$lib/firebaseConfig";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";

let logs = [];
const isClient = !import.meta.env.SSR;
if (isClient) logs = JSON.parse(sessionStorage.getItem('logs')) || [];

// Function for send log to Firestore
const addRemoteLog = async (userUid, eventType, eventDetails) => {
  try {
    const logsCollection = collection(db, 'usageLogs');

    const docRef = await addDoc(logsCollection, {
      userUid: userUid,
      eventType,
      ...eventDetails,
      timestamp: new Date(),
    });

    console.log('Log save with ID: ', docRef.id);
  } catch (error) {
    console.error('Error at saving log: ', error);
  }
};


export const addLog = (eventType, eventDetails, userUid = null) => {
  const logEntry = { eventType, ...eventDetails, timestamp: new Date() };
  logs.push(logEntry);

  // Check if running on the client side before accessing sessionStorage
  if (isClient) {
    sessionStorage.setItem('logs', JSON.stringify(logs));
  }

  if (userUid){
    addRemoteLog(userUid, eventType, eventDetails);
  }
};

export const getLogs = () => {
  // Check if running on the client side before accessing sessionStorage
  if (isClient) {
    return JSON.parse(sessionStorage.getItem('logs')) || [];
  }

  return logs;
};

export const getRemoteLogs = async (userUid) => {
  try {
    const q = query(collection(db, 'usageLogs'), where('userUid', '==', userUid));
    const querySnapshot = await getDocs(q);

    let remoteLogs = [];

    querySnapshot.forEach((doc) => {
      remoteLogs.push({...doc.data(), id: doc.id});
    });

    console.log('User logs: ', remoteLogs);
    return remoteLogs;
  } catch (error) {
    console.error('Error at obtain user logs: ', error);
    return null;
  }
};

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
