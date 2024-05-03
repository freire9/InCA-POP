import { deepCopy } from '$lib/utils';
import { writable} from 'svelte/store';

export const isIphone = writable(false);
export const user = writable({});
export const isLoggedIn = writable(false);
export const modifyingConfig = writable(true);
export const isFullScreen = writable(false);
export const localUserId = writable('');
export const syncPreferencesFromRemote = writable(false);
export const subjectName = writable('subject-name');

// Pop element types: NORMAL AND SPECIAL (EXP, CTRL, etc.)
export const popElmntTypes = {
    NORMAL: 'normal',
    EXP: 'experimental',
    CTRL: 'control',
}
// Pop element types short labels: Norm., Exp., Ctrl.
export const popElmntTypesShort = {
    [popElmntTypes.NORMAL]: 'Norm.',
    [popElmntTypes.EXP]: 'Exp.',
    [popElmntTypes.CTRL]: 'Ctrl.',
};
// Pop element shapes: BALLOON, etc.
export const popElmntShapes = {
    BALLOON: 'balloon',
}
// Pop element speeds: SLOW, NORMAL, FAST
export const popElmntSpeeds = {
    SLOW: 'slow',
    NORMAL: 'normal',
    FAST: 'fast',
}
// Pop element sizes: SMALL, NORMAL, BIG
export const popElmntSizes = {
    SMALL: 'small',
    NORMAL: 'normal',
    BIG: 'big',
}
// Special pop elements inner figure types: LETTER, DISC
export const popElmntInnerFigs = {
    LETTER: 'letter',
    DISC: 'disc',
}
// Pop element directions (game modes): LEFT_TO_RIGHT, RIGHT_TO_LEFT, BOTTOM_TO_TOP, TOP_TO_BOTTOM
export const popElmntDirections ={
    LEFT_TO_RIGHT: 'left to right',
    RIGHT_TO_LEFT: 'right to left',
    BOTTOM_TO_TOP: 'bottom to top',
    TOP_TO_BOTTOM: 'top to bottom',
}
export const gameDirection = writable(popElmntDirections.LEFT_TO_RIGHT);
export const gameId = writable('');

export const endGameConditionsOpts = {
    TIME: 'time',
    POP_ELMNTS_POPPED: 'pop elements popped',
    SPECIAL_POP_ELMNTS_POPPED: 'special pop elements popped',
}

const specialPopElmnts = Object.values(popElmntTypes).filter(type => type !== popElmntTypes.NORMAL);

export const endGameConditionsTooltip = {
    [endGameConditionsOpts.TIME]: 'Time limit from game start to game end (in seconds).',
    [endGameConditionsOpts.POP_ELMNTS_POPPED]: 'Pop elements quantity limit (total).',
    [endGameConditionsOpts.SPECIAL_POP_ELMNTS_POPPED]: 'Special pop elements quantity limit (' + specialPopElmnts.map(type => `${popElmntTypesShort[type]}`).join(' + ') + ').',
};

// Speed values for different pop element speeds (px per frame usign 60fps as reference)
export const popElmntSpeedsOpts = {
    [popElmntSpeeds.SLOW]: {min: 1, max: 2},
    [popElmntSpeeds.NORMAL]: {min: 2, max: 3},
    [popElmntSpeeds.FAST]: {min: 3, max: 4},
};

// Size values for different pop element sizes
export const popElmntSizeOpts = {
    [popElmntSizes.SMALL]: {width: 40, height: 50},
    [popElmntSizes.NORMAL]: {width: 80, height: 100},
    [popElmntSizes.BIG]: {width: 120, height: 145},
};

// Default interpolated colors for pop elements and inner figures
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

export const appSettingsDEFAULT = {
    instructorName: 'instructor-name',
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
    shape: popElmntShapes.BALLOON,
};

const expPopElmntSettings = {
    enableRandColor: true,
    enableRangeColor: false,
    rangeColor1: '#ff0000',
    rangeColor2: '#00ff00',
    colorRangeDef: 10,
    interpColors: deepCopy(dfltPopElmntInterColors),
    color: '#ff0000',
    shape: popElmntShapes.BALLOON,
    innerFigType: popElmntInnerFigs.DISC,
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
    shape: popElmntShapes.BALLOON,
    innerFigType: popElmntInnerFigs.DISC,
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
    [popElmntDirections.RIGHT_TO_LEFT]: { enabled: true, icon: 'faLeftLong', color: '#ff0000'},
    [popElmntDirections.BOTTOM_TO_TOP]: { enabled: true, icon: 'faUpLong', color: '#22d933'},
    [popElmntDirections.TOP_TO_BOTTOM]: { enabled: true, icon: 'faDownLong', color: '#2665ea'},
    [popElmntDirections.LEFT_TO_RIGHT]: { enabled: true, icon: 'faRightLong', color: '#eacf26'},
};

export const endGameConditions = {
    [endGameConditionsOpts.TIME]: { enabled: true, value: 300 }, // in seconds
    [endGameConditionsOpts.POP_ELMNTS_POPPED]: { enabled: true, value: 50 }, // elements popped
    [endGameConditionsOpts.SPECIAL_POP_ELMNTS_POPPED]: { enabled: true, value: 20 }, // special elements popped
};

export const gameSettingsDEFAULT = {
    popElmntSpeed: popElmntSpeeds.NORMAL,
    popElmntSize: popElmntSizes.NORMAL,
    maxPopElmntQty: 8,
    gameBackgroundColor: '#add8e6',
    availableModes: deepCopy(availableModes),
    enableBalloonReflex: false,
    enableRampageMode: true,
    rampageModeChain: 3,
    popElmntConfig: {
        [popElmntTypes.NORMAL]: deepCopy(normalPopElmntSettings),
        [popElmntTypes.EXP]: deepCopy(expPopElmntSettings),
        [popElmntTypes.CTRL]: deepCopy(ctrlPopElmntSettings),
    },
    endGameConditions: deepCopy(endGameConditions),
};

export const appSettings = writable(deepCopy(appSettingsDEFAULT));
export const menuSettings = writable(deepCopy(menuSettingsDEFAULT));
export const gameSettings = writable(deepCopy(gameSettingsDEFAULT));
