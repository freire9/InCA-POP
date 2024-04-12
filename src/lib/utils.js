import { getLogs, getRemoteLogs, convertToCSV} from "$lib/logService";
import { doc, updateDoc } from "firebase/firestore";
import { isFullScreen, isLoggedIn, user, appSettings, menuSettings, gameSettings } from "../stores";
import { db } from "./firebaseConfig";
import lodash from 'lodash';

const { debounce } = lodash;

// Function to calculate intermediate colors
export function calculateInterpolatedColors(steps, color1, color2) {
    const colors = [];

    for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const interpolatedColor = interpolateColor(color1, color2, ratio);
    colors.push(interpolatedColor);
    }
    return colors;
}

// Function for interpolating between two colors in RGB space
function interpolateColor(color1, color2, ratio) {
    const hexToRgb = hex => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
    });

    const rgbToHex = rgb => `#${Math.round(rgb.r).toString(16).padStart(2, '0')}${Math.round(rgb.g).toString(16).padStart(2, '0')}${Math.round(rgb.b).toString(16).padStart(2, '0')}`;

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const rgb = {
    r: rgb1.r + (rgb2.r - rgb1.r) * ratio,
    g: rgb1.g + (rgb2.g - rgb1.g) * ratio,
    b: rgb1.b + (rgb2.b - rgb1.b) * ratio,
    };

    return rgbToHex(rgb);
}

export function getRandomHexColor(){
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);

    const rgbColor = {r: red, g: green, b: blue};
    const rgbToHex = rgb => `#${Math.round(rgb.r).toString(16).padStart(2, '0')}${Math.round(rgb.g).toString(16).padStart(2, '0')}${Math.round(rgb.b).toString(16).padStart(2, '0')}`;
    return rgbToHex(rgbColor);
}

export async function downloadLogs(format = 'json', userUid = null) {
    const logs = userUid ? await getRemoteLogs(userUid) : getLogs();
    let data;
    let filename;
    let mimeType;

    if(format === 'json'){
        data = JSON.stringify(logs, null, 2);
        filename = 'logs.json';
        mimeType = 'application/json';
    } else if(format === 'csv'){
        data = convertToCSV(logs);
        filename = 'logs.csv';
        mimeType = 'text/csv';
    } else{
        throw new Error('Not valid format. Must be "json" or "csv".');
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export function downloadJsonLocal(){
    return downloadLogs('json');
}
export function downloadCsvLocal(){
    return downloadLogs('csv');
}

export function downloadJsonRemote(userUid){
    return downloadLogs('json', userUid);
}
export function downloadCsvRemote(userUid){
    return downloadLogs('csv', userUid);
}

export function deepCopy(obj){
    return JSON.parse(JSON.stringify(obj));
}

export function toogleFullscreen(fullscreenEvent){
    fullscreenEvent();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

function handleFullscreenChange(){
    isFullScreen.update(currentValue => !currentValue);
}

export function getRandomFrom(array){
    return array[Math.floor(Math.random() * array.length)];
}

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

export const handleUpdateRemotePreferences = debounce(updateRemotePreferences, 500);
