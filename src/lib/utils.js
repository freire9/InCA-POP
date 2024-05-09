import { availableColorsNames, availableColorsOpts, isFullScreen } from "../stores";

// Function to calculate the interpolated colors between two colors
export function calculateInterpolatedColors(steps, color1, color2) {
    const colors = [];

    for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const interpolatedColor = interpolateColor(color1, color2, ratio);
        colors.push(interpolatedColor);
    }
    return colors;
}

// Function to interpolate colors, return HEX color
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

// Function to get a random hex color
export function getRandomHexColor(){
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);

    const rgbColor = {r: red, g: green, b: blue};
    const rgbToHex = rgb => `#${Math.round(rgb.r).toString(16).padStart(2, '0')}${Math.round(rgb.g).toString(16).padStart(2, '0')}${Math.round(rgb.b).toString(16).padStart(2, '0')}`;
    return rgbToHex(rgbColor);
}

// Function to get a random color from palette
export function getRandomColorFromPalette(){
    const randomColorName = getRandomFrom(Object.values(availableColorsNames));
    return availableColorsOpts[randomColorName];
}

// Function to deep copy an object
export function deepCopy(obj){
    return JSON.parse(JSON.stringify(obj));
}

// Function to toggle fullscreen mode
export function toogleFullscreen(fullscreenEvent){
    fullscreenEvent();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

// Function to handle the fullscreen change event
function handleFullscreenChange(){
    isFullScreen.update(currentValue => !currentValue);
}

// Function to get a random element from an array
export function getRandomFrom(array){
    return array[Math.floor(Math.random() * array.length)];
}

// Function to capitalize the first letter of a string
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to convert a string to camelCase
export function toCamelCase(str) {
    return str.replace(/([-_ ])([a-z])/ig, (_, sep, char) => {
        return char.toUpperCase();
    }).replace(/[\s_-]+/g, '');
}

// Function to get a random integer between two values
export function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
