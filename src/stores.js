import { writable} from 'svelte/store';

export const isIphone = writable(false);
export const isFirefox = writable(false);
export const user = writable({});
export const isLoggedIn = writable(false);
export const gameDirection = writable('leftToRight');
export const modifyingConfig = writable(true);

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


export const appSettings = writable({
    subjectName: 'subject-name',
    instructorName: 'instructor-name',
    fluidTransitions: false,
});

export const menuSettings = writable({
    mainMenuRandomColors: true,
    menuBackgroundColor: '#ffffff',
});

export const gameSettings = writable({
    balloonSpeed: balloonSpeedOptions.NORMAL.label,
    balloonSize: balloonSizeOptions.NORMAL.label,
    maxBalloonsQuantity: 8,
    balloonRandomColor: true,
    enableBalloonRangeColor: false,
    balloonRangeColor1: '#ff0000',
    balloonRangeColor2: '#00ff00',
    balloonRangeColorDefinition: 10,
    balloonInterpolatedColors: [],
    balloonColor: '#ff0000',
    gameBackgroundColor: '#add8e6',
    enableCustomLetter: true,
    balloonLetterColor: '#000000',
    enableLetterRangeColor: false,
    letterColorRange1:'#000000',
    letterColorRange2:'#ffffff',
    letterColorDefinition: 10,
    letterInterpolatedColors: [],
    availableModes: {
        'rightToLeft': {label: 'Right to left', enabled: true, icon: 'faLeftLong', color: '#ff0000'},
        'bottomToTop': {label: 'Bottom to top', enabled: true, icon: 'faUpLong', color: '#22d933'},
        'topToBottom': {label: 'Top to bottom', enabled: true, icon: 'faDownLong', color: '#2665ea'},
        'leftToRight': {label: 'Left to right', enabled: true, icon: 'faRightLong', color: '#eacf26'},
    },
    specialBalloonsProp: 50,
});