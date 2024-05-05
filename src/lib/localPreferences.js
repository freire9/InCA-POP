import { appSettings, appSettingsDEFAULT, availableModes, gameSettings, gameSettingsDEFAULT, localUserId, menuSettings, menuSettingsDEFAULT, modifyingConfig, subjectName } from "../stores";
import { updateSettingsWithDefault } from "./preferences";
import lodash from 'lodash';
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
    modifyingConfig.set(true);
    const incaPopPreferencesLocal = getLocalPreferences();
    if(!incaPopPreferencesLocal) {
        updateLocalPreferences();
        modifyingConfig.set(false);
        return;
    }
    const { settings: updatedLocalAppSettings, hasChanged: appSettingsHasChanged } = updateSettingsWithDefault(appSettingsDEFAULT, incaPopPreferencesLocal.appSettings || {});
    const { settings: updatedLocalMenuSettings, hasChanged: menuSettingsHasChanged } = updateSettingsWithDefault(menuSettingsDEFAULT, incaPopPreferencesLocal.menuSettings || {});
    appSettings.set(updatedLocalAppSettings);
    menuSettings.set(updatedLocalMenuSettings);
    
    let updatedLocalGameSettings = {};
    let gameSettingsHasChanged = false;
    //for each mode settings, update settings with default
    Object.keys(availableModes).forEach((mode) => {
        const { settings: updatedGameSettingsMode, hasChanged: modeSettingsHasChanged } = updateSettingsWithDefault(gameSettingsDEFAULT[mode], incaPopPreferencesLocal.gameSettings[mode] || {});
        updatedLocalGameSettings[mode] = updatedGameSettingsMode;
        if(modeSettingsHasChanged) {
            gameSettingsHasChanged = true;
            console.log('cambio detectado en modo', mode)
        }
     });
    gameSettings.set(updatedLocalGameSettings);
    
    if(appSettingsHasChanged || gameSettingsHasChanged || menuSettingsHasChanged) {
        updateLocalPreferences();
    }
    console.log('Preferences set from local storage');
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
