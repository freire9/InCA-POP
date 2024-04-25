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
if(!getApps().length) {
  fireBaseApp = initializeApp(firebaseConfig);
} else {
  fireBaseApp = getApp();
  deleteApp(fireBaseApp);
  fireBaseApp = initializeApp(firebaseConfig);
}

export const db = getFirestore(fireBaseApp);
export const auth = getAuth(fireBaseApp);
export const dbLogsCollectionName = 'inca-pop' + (import.meta.env.VITE_MODE === 'development' ? '-dev' : '') + '-' + import.meta.env.VITE_APP_BREAKING_LOGS_VERSION;
export const dbUsersCollectionName = 'inca-pop-users-' + import.meta.env.VITE_APP_BREAKING_LOGS_VERSION;
