import { isLoggedIn, syncPreferencesFromRemote, user } from "../stores";
import { handleUpdateRemotePreferences } from "./firebaseFunctions";
import { handleUpdateLocalPreferences } from "./localPreferences";

export function updateSettingsWithDefault(settingsDEFAULT, userPreferences) {
    const updatedSettings = { ...settingsDEFAULT };
    let hasChanged = false;

    for (const key in userPreferences) {
        if (updatedSettings.hasOwnProperty(key)) {
            updatedSettings[key] = userPreferences[key];
        } else{ //if preferences has a key that is not in the default settings, mark for update
            hasChanged = true;
        }
    }

    //if preferences has less keys than the default settings, mark for update
    if(Object.keys(userPreferences).length !== Object.keys(updatedSettings).length){
        hasChanged = true;
    }

    return { settings: updatedSettings, hasChanged };
}

export function updatePreferences(){
    let syncPreferencesFromRemote_value, isLoggedIn_value, user_value;
    const unsubscribeSyncPreferencesFromRemote = syncPreferencesFromRemote.subscribe((value) => syncPreferencesFromRemote_value = value);
    const unsubscribeIsLoggedIn = isLoggedIn.subscribe((value) => isLoggedIn_value = value);
    const unsubscribeUser = user.subscribe((value) => user_value = value);
    if(syncPreferencesFromRemote_value && isLoggedIn_value && user_value) handleUpdateRemotePreferences();
    else handleUpdateLocalPreferences();
    unsubscribeSyncPreferencesFromRemote();
    unsubscribeIsLoggedIn();
    unsubscribeUser();
}