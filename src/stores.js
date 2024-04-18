import { deepCopy } from '$lib/utils';
import { writable} from 'svelte/store';

export const isIphone = writable(false);
export const isFirefox = writable(false);
export const user = writable({});
export const isLoggedIn = writable(false);
export const gameDirection = writable('leftToRight');
export const modifyingConfig = writable(true);
export const isFullScreen = writable(false);

// Pop element types: NORMAL AND SPECIAL (EXP, CTRL, etc.)
export const popElmntType = {
    NORMAL: 'normal',
    EXP: 'experimental',
    CTRL: 'control',
}
// Pop element shapes: BALLOON, etc.
export const popElmntShape = {
    BALLOON: 'balloon',
}

export const popElmntSpeedOpts = {
    SLOW: {min: 0.08, max: 0.2, label: 'SLOW'},
    NORMAL: {min: 0.2, max: 0.4, label: 'NORMAL'},
    FAST: {min: 0.4, max: 0.6, label: 'FAST'},
};
export const popElmntSizeOpts = {
    SMALL: {width: 40, height: 50, label: 'SMALL'},
    NORMAL: {width: 80, height: 100, label: 'NORMAL'},
    BIG: {width: 120, height: 145, label: 'BIG'},
};

export const innerFigureOptions = {
    LETTER: {label: 'Letter', value: 'LETTER'},
    DISC: {label: 'Disc', value: 'DISC'},
};

const dfltPopElmntInterColors = [ "#ff0000", "#e61a00", "#cc3300", "#b34d00", "#996600", "#808000", "#669900", "#4db300", "#33cc00", "#1ae600" ];
const dfltInnerFigInterpColors = [ "#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3", "#cccccc", "#e6e6e6" ];

export const speechSettings = writable({
    speechCorrect: 'Correct!',
    speechExcellent: 'Excellent!',
    voice: null,
    rate: 1,
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

export const subjectName = writable('subject-name');
export const appSettingsDEFAULT = {
    instructorName: 'instructor-name',
    fluidTransitions: false,
    enableCustomSpeeches: true,
};

export const menuSettingsDEFAULT = {
    mainMenuRandomColors: true,
    menuBackgroundColor: '#ffffff',
};

const normalPopElmntSettings = {
    enableRandColor: true,
    enableRangeColor: false,
    rangeColor1: '#ff0000',
    rangeColor2: '#00ff00',
    colorRangeDef: 10,
    interpColors: deepCopy(dfltPopElmntInterColors),
    color: '#ff0000',
    shape: popElmntShape.BALLOON,
};

const expPopElmntSettings = {
    enableRandColor: true,
    enableRangeColor: false,
    rangeColor1: '#ff0000',
    rangeColor2: '#00ff00',
    colorRangeDef: 10,
    interpColors: deepCopy(dfltPopElmntInterColors),
    color: '#ff0000',
    shape: popElmntShape.BALLOON,
    innerFigType: innerFigureOptions.DISC.value,
    innerFigColor: '#f82383',
    enableInnerFigRangeColor: false,
    innerFigRangeColor1:'#000000',
    innerFigRangeColor2:'#ffffff',
    innerFigColorRangeDef: 10,
    innerFigInterpColors: deepCopy(dfltInnerFigInterpColors),
    enableInnerFigContour: false,
    proportion: 20,
};

const ctrlPopElmntSettings = {
    enableRandColor: true,
    enableRangeColor: false,
    rangeColor1: '#ff0000',
    rangeColor2: '#00ff00',
    colorRangeDef: 10,
    interpColors: deepCopy(dfltPopElmntInterColors),
    color: '#ff0000',
    shape: popElmntShape.BALLOON,
    innerFigType: innerFigureOptions.DISC.value,
    innerFigColor: '#000000',
    enableInnerFigRangeColor: false,
    innerFigRangeColor1:'#000000',
    innerFigRangeColor2:'#ffffff',
    innerFigColorRangeDef: 10,
    innerFigInterpColors: deepCopy(dfltInnerFigInterpColors),
    enableInnerFigContour: false,
    proportion: 30,
};

const availableModes = {
    'rightToLeft': {label: 'Right to left', enabled: true, icon: 'faLeftLong', color: '#ff0000'},
    'bottomToTop': {label: 'Bottom to top', enabled: true, icon: 'faUpLong', color: '#22d933'},
    'topToBottom': {label: 'Top to bottom', enabled: true, icon: 'faDownLong', color: '#2665ea'},
    'leftToRight': {label: 'Left to right', enabled: true, icon: 'faRightLong', color: '#eacf26'},
};

export const gameSettingsDEFAULT = {
    popElmntSpeed: popElmntSpeedOpts.NORMAL.label,
    popElmntSize: popElmntSizeOpts.NORMAL.label,
    maxPopElmntQty: 8,
    gameBackgroundColor: '#add8e6',
    availableModes: deepCopy(availableModes),
    enableBalloonReflex: false,
    enableRampageMode: true,
    rampageModeChain: 3,
    popElmntConfig: {
        [popElmntType.NORMAL]: deepCopy(normalPopElmntSettings),
        [popElmntType.EXP]: deepCopy(expPopElmntSettings),
        [popElmntType.CTRL]: deepCopy(ctrlPopElmntSettings),
    },
};

export const appSettings = writable(deepCopy(appSettingsDEFAULT));
export const menuSettings = writable(deepCopy(menuSettingsDEFAULT));
export const gameSettings = writable(deepCopy(gameSettingsDEFAULT));
