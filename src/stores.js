import { deepCopy } from '$lib/utils';
import { writable} from 'svelte/store';

export const isIphone = writable(false);
export const isFirefox = writable(false);
export const user = writable({});
export const isLoggedIn = writable(false);
export const gameDirection = writable('leftToRight');
export const modifyingConfig = writable(true);
export const isFullScreen = writable(false);

export const balloonSpeedOptions = {
    SLOW: {min: 0.08, max: 0.2, label: 'SLOW'},
    NORMAL: {min: 0.2, max: 0.4, label: 'NORMAL'},
    FAST: {min: 0.4, max: 0.6, label: 'FAST'},
};
export const balloonSizeOptions = {
    SMALL: {width: 40, height: 50, label: 'SMALL'},
    NORMAL: {width: 80, height: 100, label: 'NORMAL'},
    BIG: {width: 120, height: 145, label: 'BIG'},
};

export const innerFigureOptions = {
    LETTER: {label: 'Letter', value: 'LETTER'},
    DISC: {label: 'Disc', value: 'DISC'},
};

const defaultBalloonInterpolatedColors = [ "#ff0000", "#e61a00", "#cc3300", "#b34d00", "#996600", "#808000", "#669900", "#4db300", "#33cc00", "#1ae600" ];
const defaultInnerFigInterpolatedColors = [ "#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3", "#cccccc", "#e6e6e6" ];

export const speechSettings = writable({
    speechCorrect: 'Correct!',
    speechExcellent: 'Excellent!',
    voice: null,
    rate: 1.5,
    pitch: 1,
    volume: 1,
});
const isClient = !import.meta.env.SSR;

export let speechCorrect;
export let speechExcellent;
export const voices = writable([]);
if (isClient) {
    speechCorrect = writable(new SpeechSynthesisUtterance('Correct!'));
    speechExcellent = writable(new SpeechSynthesisUtterance('Excellent!'));
}
export const appSettingsDEFAULT = {
    subjectName: 'subject-name',
    instructorName: 'instructor-name',
    fluidTransitions: false,
    enableCustomSpeeches: true,
};

export const menuSettingsDEFAULT = {
    mainMenuRandomColors: true,
    menuBackgroundColor: '#ffffff',
};

export const gameSettingsDEFAULT = {
    balloonSpeed: balloonSpeedOptions.NORMAL.label,
    balloonSize: balloonSizeOptions.NORMAL.label,
    maxBalloonsQuantity: 8,
    normalBalloonRandomColor: true,
    expBalloonRandomColor: true,
    ctrlBalloonRandomColor: true,
    enableNormalBalloonRangeColor: false,
    enableExpBalloonRangeColor: false,
    enableCtrlBalloonRangeColor: false,
    normalBalloonRangeColor1: '#ff0000',
    normalBalloonRangeColor2: '#00ff00',
    normalBalloonRangeColorDefinition: 10,
    expBalloonRangeColor1: '#ff0000',
    expBalloonRangeColor2: '#00ff00',
    expBalloonRangeColorDefinition: 10,
    ctrlBalloonRangeColor1: '#ff0000',
    ctrlBalloonRangeColor2: '#00ff00',
    ctrlBalloonRangeColorDefinition: 10,
    normalBalloonInterpolatedColors: deepCopy(defaultBalloonInterpolatedColors),
    expBalloonInterpolatedColors: deepCopy(defaultBalloonInterpolatedColors),
    ctrlBalloonInterpolatedColors: deepCopy(defaultBalloonInterpolatedColors),
    normalBalloonColor: '#ff0000',
    expBalloonColor: '#ff0000',
    ctrlBalloonColor: '#ff0000',
    gameBackgroundColor: '#add8e6',
    expInnerFigureType: innerFigureOptions.DISC.value,
    ctrlInnerFigureType: innerFigureOptions.DISC.value,
    expBalloonInnerFigColor: '#f82383',
    ctrlBalloonInnerFigColor: '#000000',
    enableExpInnerFigRangeColor: false,
    enableCtrlInnerFigRangeColor: false,
    expInnerFigColorRange1:'#000000',
    expInnerFigColorRange2:'#ffffff',
    expInnerFigColorDefinition: 10,
    expInnerFigInterpolatedColors: deepCopy(defaultInnerFigInterpolatedColors),
    ctrlInnerFigColorRange1:'#000000',
    ctrlInnerFigColorRange2:'#ffffff',
    ctrlInnerFigColorDefinition: 10,
    ctrlInnerFigInterpolatedColors: deepCopy(defaultInnerFigInterpolatedColors),
    enableExpInnerFigContour: false,
    enableCtrlInnerFigContour: false,
    availableModes: {
        'rightToLeft': {label: 'Right to left', enabled: true, icon: 'faLeftLong', color: '#ff0000'},
        'bottomToTop': {label: 'Bottom to top', enabled: true, icon: 'faUpLong', color: '#22d933'},
        'topToBottom': {label: 'Top to bottom', enabled: true, icon: 'faDownLong', color: '#2665ea'},
        'leftToRight': {label: 'Left to right', enabled: true, icon: 'faRightLong', color: '#eacf26'},
    },
    expBalloonsProp: 20,
    ctrlBalloonsProp: 30,
    enableBalloonReflex: false,
    enableRampageMode: true,
    rampageModeChain: 3,
};

export const appSettings = writable(deepCopy(appSettingsDEFAULT));
export const menuSettings = writable(deepCopy(menuSettingsDEFAULT));
export const gameSettings = writable(deepCopy(gameSettingsDEFAULT));
