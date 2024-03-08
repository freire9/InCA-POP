import { db } from "$lib/firebaseConfig";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";

let logs = [];
const isClient = !import.meta.env.SSR;
if (isClient) logs = JSON.parse(sessionStorage.getItem('logs')) || [];

// Función para guardar un log en Firestore
const addRemoteLog = async (userUid, eventType, eventDetails) => {
  try {
    // Referencia a la colección 'usageLogs'
    const logsCollection = collection(db, 'usageLogs');

    // Añade un nuevo documento con los detalles del log
    const docRef = await addDoc(logsCollection, {
      userUid: userUid,
      eventType,
      eventDetails,
      timestamp: new Date(),
    });

    console.log('Log guardado con ID: ', docRef.id);
  } catch (error) {
    console.error('Error al guardar el log: ', error);
  }
};


export const addLog = (eventType, eventDetails, userUid = null) => {
  const logEntry = { eventType, eventDetails, timestamp: new Date() };
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

    console.log('Logs del usuario:', remoteLogs);
    return remoteLogs;
  } catch (error) {
    console.error('Error al obtener los logs del usuario: ', error);
    return null;
  }
};
