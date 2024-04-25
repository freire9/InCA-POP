import { doc, updateDoc } from "firebase/firestore";
import { appSettings, gameSettings, isLoggedIn, menuSettings, user } from "../stores";
import { deepCopy } from "./utils";
import lodash from 'lodash';
import { db } from "./firebaseConfig";

const { debounce } = lodash;

// Function to update app settings with data from Firestore
export async function updateRemotePreferences(){
    let isLoggedIn_value, user_value, gameSettings_value, appSettings_value, menuSettings_value;
    const unsubscribeLoggedIn = isLoggedIn.subscribe((value) => isLoggedIn_value = value);
    const unsubscribeUser = user.subscribe((value) => user_value = value);
    const unsubscribAappSettings = appSettings.subscribe((value) => appSettings_value = value);
    const unsubscribeMenuSettings = menuSettings.subscribe((value) => menuSettings_value = value);
    const unsubscribeGameSettings = gameSettings.subscribe((value) => gameSettings_value = value);

    if (!isLoggedIn_value || !user_value) return;
        const userDocRef = doc(db, 'users', user_value.uid);
        await updateDoc(userDocRef, {
            preferences: { 
                gameSettings: deepCopy(gameSettings_value),
                appSettings: deepCopy(appSettings_value),
                menuSettings: deepCopy(menuSettings_value)},
        });
        console.log('Settings updated');

    unsubscribeLoggedIn();
    unsubscribeUser();
    unsubscribAappSettings();
    unsubscribeMenuSettings();
    unsubscribeGameSettings();
}

// Debounce the function to avoid multiple calls
export const handleUpdateRemotePreferences = debounce(updateRemotePreferences, 500);
