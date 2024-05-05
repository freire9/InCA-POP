import { doc, updateDoc } from "firebase/firestore";
import { appSettings, appSettingsDEFAULT, availableModes, gameSettings, gameSettingsDEFAULT, isLoggedIn, menuSettings, menuSettingsDEFAULT, user } from "../stores";
import { deepCopy } from "./utils";
import lodash from 'lodash';
import { db, dbUsersCollectionName } from "./firebaseConfig";
import { updateSettingsWithDefault } from "./preferences";

const { debounce } = lodash;

// Function to update app settings with data from Firestore
export async function updateRemotePreferences(){
    let isLoggedIn_value, user_value, gameSettings_value, appSettings_value, menuSettings_value;
    const unsubscribeLoggedIn = isLoggedIn.subscribe((value) => isLoggedIn_value = value);
    const unsubscribeUser = user.subscribe((value) => user_value = value);
    
    if (!isLoggedIn_value || !user_value) {
        unsubscribeLoggedIn();
        unsubscribeUser();
        return;
    }
    const unsubscribAappSettings = appSettings.subscribe((value) => appSettings_value = value);
    const unsubscribeMenuSettings = menuSettings.subscribe((value) => menuSettings_value = value);
    const unsubscribeGameSettings = gameSettings.subscribe((value) => gameSettings_value = value);

    const userDocRef = doc(db, dbUsersCollectionName, user_value.uid);
    await updateDoc(userDocRef, {
        incaPopPreferences: { 
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

export function syncPreferencesToStores(userData) {
    if (userData && userData.incaPopPreferences) {
        const { settings: updatedAppSettings, hasChanged: appSettingsHasChanged } = updateSettingsWithDefault(appSettingsDEFAULT, userData.incaPopPreferences.appSettings || {});
        const { settings: updatedMenuSettings, hasChanged: menuSettingsHasChanged } = updateSettingsWithDefault(menuSettingsDEFAULT, userData.incaPopPreferences.menuSettings || {});

        let updatedGameSettings = {};
        let gameSettingsHasChanged = false;
        //for each mode settings, update settings with default
        Object.keys(availableModes).forEach((mode) => {
            const { settings: updatedGameSettingsMode, hasChanged: modeSettingsHasChanged } = updateSettingsWithDefault(gameSettingsDEFAULT[mode], userData.incaPopPreferences.gameSettings[mode] || {});
            updatedGameSettings[mode] = updatedGameSettingsMode;
            if(modeSettingsHasChanged) {
                gameSettingsHasChanged = true;
                console.log('cambio remoto detectado en modo', mode)
            }
        });
        
        gameSettings.set(updatedGameSettings);
        menuSettings.set(updatedMenuSettings);
        appSettings.set(updatedAppSettings);
        
        console.log('User preferences loaded');

        if(appSettingsHasChanged || gameSettingsHasChanged || menuSettingsHasChanged) updateRemotePreferences();
    } else{ //if user has no preferences, update database with default settings
        updateRemotePreferences();
    }
}

// Debounce the function to avoid multiple calls
export const handleUpdateRemotePreferences = debounce(updateRemotePreferences, 1000);
