import { appSettings, appSettingsDEFAULT, availableGameModes, gameSettings, gameSettingsDEFAULT, localUserId, menuSettings, menuSettingsDEFAULT, modifyingConfig, subjectName, syncGameSettingsFromRemote, syncMenuSettingsFromRemote } from "../stores";
import { updateSettingsWithDefault } from "./preferences";
import lodash from 'lodash';
import { deepCopy } from "./utils";
const { debounce } = lodash;

function getLocalPreferences(){
    const isClient = !import.meta.env.SSR;
    let incaPopPreferencesLocal = {
        appSettings: appSettingsDEFAULT,
        menuSettings: menuSettingsDEFAULT,
        gameSettings: gameSettingsDEFAULT,
    }
    if (isClient){
        const loadedPreferences = localStorage.getItem('incaPopPreferences');
        if(!loadedPreferences){
            localStorage.setItem('incaPopPreferences', JSON.stringify(incaPopPreferencesLocal));
        } else {
            incaPopPreferencesLocal = JSON.parse(loadedPreferences);
        }
    }
    return incaPopPreferencesLocal;
}

export function setLocalPreferencesToStores(){
    let syncGameSettingsFromRemote_value, syncMenuSettingsFromRemote_value;
    const unsubscribeSyncGameSettingsFromRemote = syncGameSettingsFromRemote.subscribe((value) => syncGameSettingsFromRemote_value = value);
    const unsubscribeSyncMenuSettingsFromRemote = syncMenuSettingsFromRemote.subscribe((value) => syncMenuSettingsFromRemote_value = value);
    modifyingConfig.set(true);
    const incaPopPreferencesLocal = getLocalPreferences();
    if(!incaPopPreferencesLocal) {
        updateLocalPreferences();
        modifyingConfig.set(false);
        unsubscribeSyncGameSettingsFromRemote();
        unsubscribeSyncMenuSettingsFromRemote();
        return;
    }
    const { settings: updatedLocalAppSettings, hasChanged: appSettingsHasChanged } = updateSettingsWithDefault(appSettingsDEFAULT, incaPopPreferencesLocal.appSettings || {});
    const { settings: updatedLocalMenuSettings, hasChanged: menuSettingsHasChanged } = updateSettingsWithDefault(menuSettingsDEFAULT, incaPopPreferencesLocal.menuSettings || {});
    appSettings.set(deepCopy(updatedLocalAppSettings));
    if(!syncMenuSettingsFromRemote_value) menuSettings.set(deepCopy(updatedLocalMenuSettings));
    
    let gameSettingsHasChanged = false;
    if(!syncGameSettingsFromRemote_value) {
        let updatedLocalGameSettings = {};
        //for each mode settings, update settings with default
        Object.keys(availableGameModes).forEach((mode) => {
            const { settings: updatedGameSettingsMode, hasChanged: modeSettingsHasChanged } = updateSettingsWithDefault(gameSettingsDEFAULT[mode], incaPopPreferencesLocal.gameSettings[mode] || {});
            updatedLocalGameSettings[mode] = updatedGameSettingsMode;
            if(modeSettingsHasChanged) {
                gameSettingsHasChanged = true;
            }
         });
        gameSettings.set(deepCopy(updatedLocalGameSettings));
    }
    
    if(appSettingsHasChanged || gameSettingsHasChanged || menuSettingsHasChanged) {
        updateLocalPreferences();
    }
    console.log('Preferences set from local storage');
    unsubscribeSyncGameSettingsFromRemote();
    unsubscribeSyncMenuSettingsFromRemote();
    modifyingConfig.set(false);
}

export function updateLocalPreferences(){
    let appSettings_value, gameSettings_value, menuSettings_value;
    const unsubscribeAppSettings = appSettings.subscribe((value) => appSettings_value = value);
    const unsubscribeMenuSettings = menuSettings.subscribe((value) => menuSettings_value = value);
    const unsubscribeGameSettings = gameSettings.subscribe((value) => gameSettings_value = value);
   
    const newPreferences = {
        appSettings: appSettings_value,
        gameSettings: gameSettings_value,
        menuSettings: menuSettings_value,
    }

    const isClient = !import.meta.env.SSR;
    if(isClient){
        localStorage.setItem('incaPopPreferences', JSON.stringify(newPreferences));
    }
    unsubscribeAppSettings();
    unsubscribeMenuSettings();
    unsubscribeGameSettings();
    console.log('Local preferences updated');
}

export function loadSubjectNameLocal(){
    const name = localStorage.getItem('subjectName');
    if(name){
        subjectName.set(name);
    }
    console.log('Subject name loaded from local storage')
}

export function setLocalUserId(){
    let id = localStorage.getItem('localUserId');
    if(!id){
        const new_id = crypto.randomUUID();
        localStorage.setItem('localUserId', new_id);
        localUserId.set(new_id);
    } else {
        localUserId.set(id);
    }
}

export const handleUpdateLocalPreferences = debounce(updateLocalPreferences, 1000)
