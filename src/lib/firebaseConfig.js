import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase
let fireBaseApp;
export let db;
export let auth;
export const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';
if(USE_FIREBASE) {
  if(!getApps().length) {
    fireBaseApp = initializeApp(firebaseConfig);
  } else {
    fireBaseApp = getApp();
    deleteApp(fireBaseApp);
    fireBaseApp = initializeApp(firebaseConfig);
  }
  db = getFirestore(fireBaseApp);
  auth = getAuth(fireBaseApp);
}


const envMode = import.meta.env.VITE_MODE;
const envDBBreakingLogsV = import.meta.env.VITE_APP_BREAKING_LOGS_VERSION;
export const dbLogsCollectionName = 'inca-pop' + (envMode === 'development' ? '-dev' : '') + '-' + envDBBreakingLogsV;
export const dbUsersCollectionName = envMode === 'development' ? ('inca-pop-users-dev-' + envDBBreakingLogsV) : 'users';
export const dbExitEndCollectionName = 'inca-pop-exit-end' + (envMode === 'development' ? '-dev' : '') + '-' + envDBBreakingLogsV;
