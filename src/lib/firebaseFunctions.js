import { doc, setDoc, updateDoc } from "firebase/firestore";
import { appSettings, appSettingsDEFAULT, availableGameModes, gameSettings, gameSettingsDEFAULT, isLoggedIn, menuSettings, menuSettingsDEFAULT, syncAppSettingsToRemote, syncGameSettingsToRemote, syncMenuSettingsToRemote, user } from "../stores";
import { deepCopy } from "./utils";
import lodash from 'lodash';
import { db, dbUsersCollectionName } from "./firebaseConfig";
import { updateSettingsWithDefault } from "./preferences";

const { debounce } = lodash;

// Function to update app settings with data from Firestore
export async function updateRemotePreferences(){
    let isLoggedIn_value, user_value, gameSettings_value, appSettings_value, menuSettings_value, syncAppSettings_value, syncGameSettings_value, syncMenuSettings_value;
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

    const unsuscribeSyncAppToRemote = syncAppSettingsToRemote.subscribe((value) => syncAppSettings_value = value);
    const unsuscribeSyncGameToRemote = syncGameSettingsToRemote.subscribe((value) => syncGameSettings_value = value);
    const unsuscribeSyncMenuToRemote = syncMenuSettingsToRemote.subscribe((value) => syncMenuSettings_value = value);

    let updatedPreferences = {};
    if(syncAppSettings_value) updatedPreferences.appSettings = deepCopy(appSettings_value);
    if(syncGameSettings_value) updatedPreferences.gameSettings = deepCopy(gameSettings_value);
    if(syncMenuSettings_value) updatedPreferences.menuSettings = deepCopy(menuSettings_value);
    
    const userDocRef = doc(db, dbUsersCollectionName, user_value.uid);
    await setDoc(userDocRef, {
        incaPopPreferences: { ...updatedPreferences }
    }, {merge: true});
    console.log('Settings updated');
    unsubscribeLoggedIn();
    unsubscribeUser();
    unsubscribAappSettings();
    unsubscribeMenuSettings();
    unsubscribeGameSettings();
    unsuscribeSyncAppToRemote();
    unsuscribeSyncGameToRemote();
    unsuscribeSyncMenuToRemote();
}

export function syncPreferencesToStores(userData) {
    if (userData && userData.incaPopPreferences) {
        const { settings: updatedAppSettings, hasChanged: appSettingsHasChanged } = updateSettingsWithDefault(appSettingsDEFAULT, userData.incaPopPreferences.appSettings || {});
        const { settings: updatedMenuSettings, hasChanged: menuSettingsHasChanged } = updateSettingsWithDefault(menuSettingsDEFAULT, userData.incaPopPreferences.menuSettings || {});

        let updatedGameSettings = {};
        let gameSettingsHasChanged = false;
        //for each mode settings, update settings with default
        Object.keys(availableGameModes).forEach((mode) => {
            const { settings: updatedGameSettingsMode, hasChanged: modeSettingsHasChanged } = updateSettingsWithDefault(gameSettingsDEFAULT[mode], userData.incaPopPreferences.gameSettings[mode] || {});
            updatedGameSettings[mode] = updatedGameSettingsMode;
            if(modeSettingsHasChanged) {
                gameSettingsHasChanged = true;
            }
        });
        
        gameSettings.set(deepCopy(updatedGameSettings));
        menuSettings.set(deepCopy(updatedMenuSettings));
        appSettings.set(deepCopy(updatedAppSettings));
        
        console.log('User preferences loaded');

        if(appSettingsHasChanged || gameSettingsHasChanged || menuSettingsHasChanged) updateRemotePreferences();
    } else{ //if user has no preferences, update database with default settings
        updateRemotePreferences();
    }
}

// Debounce the function to avoid multiple calls
export const handleUpdateRemotePreferences = debounce(updateRemotePreferences, 1000);
