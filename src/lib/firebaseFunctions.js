import { doc, getDoc, setDoc } from "firebase/firestore";
import { appSettings, appSettingsDEFAULT, availableGameModes, gameSettings, gameSettingsDEFAULT, isLoggedIn, menuSettings, menuSettingsDEFAULT, modifyingConfig, syncAppSettingsFromRemote, syncAppSettingsToRemote, syncGameSettingsFromRemote, syncGameSettingsToRemote, syncMenuSettingsFromRemote, syncMenuSettingsToRemote, useRemoteDb, user } from "../stores";
import { deepCopy } from "./utils";
import lodash from 'lodash';
import { USE_FIREBASE, db, dbUsersCollectionName } from "./firebaseConfig";
import { updateSettingsWithDefault } from "./preferences";

const { debounce } = lodash;

// Function to update app settings with data from Firestore
export async function updateRemotePreferences({defaultSettings = false} = {}){
    if(!USE_FIREBASE) return;

    let isLoggedIn_value, user_value, gameSettings_value, appSettings_value, menuSettings_value, syncAppSettings_value, syncGameSettings_value, syncMenuSettings_value, useRemoteDb_value;
    const unsubscribeLoggedIn = isLoggedIn.subscribe((value) => isLoggedIn_value = value);
    const unsubscribeUser = user.subscribe((value) => user_value = value);
    const unsubscribeUseRemoteDb = useRemoteDb.subscribe((value) => useRemoteDb_value = value);

    if (!isLoggedIn_value || !user_value) {
        unsubscribeLoggedIn();
        unsubscribeUser();
        unsubscribeUseRemoteDb();
        return;
    }
    if(!useRemoteDb_value){
        unsubscribeLoggedIn();
        unsubscribeUser();
        unsubscribeUseRemoteDb();
        console.log('Remote db disabled, not updating settings')
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
    
    if(defaultSettings) updatedPreferences = {
                            appSettings: deepCopy(appSettingsDEFAULT),
                            gameSettings: deepCopy(gameSettingsDEFAULT),
                            menuSettings: deepCopy(menuSettingsDEFAULT),
                        }

    const userDocRef = doc(db, dbUsersCollectionName, user_value.uid);
    
    unsubscribeLoggedIn();
    unsubscribeUser();
    unsubscribAappSettings();
    unsubscribeMenuSettings();
    unsubscribeGameSettings();
    unsuscribeSyncAppToRemote();
    unsuscribeSyncGameToRemote();
    unsuscribeSyncMenuToRemote();

    console.log('Updating settings')
    
    const docSnapshot = await getDoc(userDocRef);
    const userData = docSnapshot.data();

    //if user has no preferences, update database with default settings
    if (!userData || !userData.hasOwnProperty('incaPopPreferences') || !userData.incaPopPreferences.hasOwnProperty('appSettings') || !userData.incaPopPreferences.hasOwnProperty('menuSettings') || !userData.incaPopPreferences.hasOwnProperty('gameSettings')){
        updatedPreferences.appSettings = syncAppSettings_value ? deepCopy(appSettings_value) : deepCopy(appSettingsDEFAULT);
        updatedPreferences.gameSettings = syncGameSettings_value ? deepCopy(gameSettings_value) : deepCopy(gameSettingsDEFAULT);
        updatedPreferences.menuSettings = syncMenuSettings_value ? deepCopy(menuSettings_value) : deepCopy(menuSettingsDEFAULT);
    }
    if(Object.keys(updatedPreferences).length === 0) return;
    
    await setDoc(userDocRef, {
        incaPopPreferences: { ...updatedPreferences }
    }, {merge: true});

    console.log('Settings updated');
}

export function syncPreferencesToStores(userData) {
    if(!USE_FIREBASE) return;

    if (userData && userData.incaPopPreferences.hasOwnProperty('appSettings') && userData.incaPopPreferences.hasOwnProperty('menuSettings') && userData.incaPopPreferences.hasOwnProperty('gameSettings')){
        let syncGameSettingsFromRemote_value, syncMenuSettingsFromRemote_value, syncAppSettingsFromRemote_value;
        const unsubscribeSyncGameSettingsFromRemote = syncGameSettingsFromRemote.subscribe((value) => syncGameSettingsFromRemote_value = value);
        const unsubscribeSyncMenuSettingsFromRemote = syncMenuSettingsFromRemote.subscribe((value) => syncMenuSettingsFromRemote_value = value);
        const unsubscribeSyncAppSettingsFromRemote = syncAppSettingsFromRemote.subscribe((value) => syncAppSettingsFromRemote_value = value);
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

        if(syncGameSettingsFromRemote_value) gameSettings.set(deepCopy(updatedGameSettings));
        if(syncMenuSettingsFromRemote_value) menuSettings.set(deepCopy(updatedMenuSettings));
        if(syncAppSettingsFromRemote_value) appSettings.set(deepCopy(updatedAppSettings));
        
        unsubscribeSyncGameSettingsFromRemote();
        unsubscribeSyncMenuSettingsFromRemote();
        unsubscribeSyncAppSettingsFromRemote();
        console.log('User preferences loaded');

        if(appSettingsHasChanged || gameSettingsHasChanged || menuSettingsHasChanged) updateRemotePreferences();
    } else{ //if user has no preferences, update database with default settings
        updateRemotePreferences({defaultSettings: true});
    }
}

export async function syncPreferencesFromFirestore(){
    if(!USE_FIREBASE) return;

    let isLoggedIn_value, user_value, useRemoteDb_value;
    const unsubscribeLoggedIn = isLoggedIn.subscribe((value) => isLoggedIn_value = value);
    const unsubscribeUser = user.subscribe((value) => user_value = value);
    const unsubscribeUseRemoteDb = useRemoteDb.subscribe((value) => useRemoteDb_value = value);

    if (user_value && isLoggedIn_value) {
        if(!useRemoteDb_value){
            unsubscribeLoggedIn();
            unsubscribeUser();
            unsubscribeUseRemoteDb();
            console.log('Remote db disabled, not syncing preferences from remote')
            return;
        } 

        modifyingConfig.set(true);
        const userDocRef = doc(db, dbUsersCollectionName, user_value.uid);
        const docSnapshot = await getDoc(userDocRef);
        const userData = docSnapshot.data();
        
        if(!userData) return;

        syncPreferencesToStores(userData);
    }
    unsubscribeLoggedIn();
    unsubscribeUser();
    unsubscribeUseRemoteDb();
}

// Debounce the function to avoid multiple calls
export const handleUpdateRemotePreferences = debounce(updateRemotePreferences, 1000);
