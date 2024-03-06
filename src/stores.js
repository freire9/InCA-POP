import { writable} from 'svelte/store';

export const balloonSpeedOptions = {
    SLOW: {min: 0.08, max: 0.2},
    NORMAL: {min: 0.2, max: 0.4},
    FAST: {min: 0.4, max: 0.6},
};
export const balloonSizeOptions = {
    SMALL: {width: 40, height: 50},
    NORMAL: {width: 80, height: 100},
    BIG: {width: 120, height: 145},
};


export const appSettings = writable({
    subjectName: 'subject-name',
    instructorName: 'instructor-name',
    fluidTransitions: true,
});

export const menuSettings = writable({
    mainMenuRandomColors: true,
    menuBackgroundColor: '#ffffff',
});

export const gameSettings = writable({
    balloonSpeed: balloonSpeedOptions.NORMAL,
    balloonSize: balloonSizeOptions.NORMAL,
    gameDirection: 'leftToRight',
    maxBalloonsQuantity: 8,
    balloonRandomColor: true,
    enableBalloonRangeColor: false,
    balloonRangeColor1: '#ff0000',
    balloonRangeColor2: '#00ff00',
    balloonRangeColorDefinition: 10,
    balloonInterpolatedColors: [],
    balloonColor: '#ff0000',
    gameBackgroundColor: '#add8e6',
    enableCustomLetter: false,
    balloonLetterColor: '#000000',
    availableModes: {
        'rightToLeft': {label: 'Right to left', enabled: true, icon: 'faLeftLong', color: '#ff0000'},
        'bottomToTop': {label: 'Bottom to top', enabled: true, icon: 'faUpLong', color: '#22d933'},
        'topToBottom': {label: 'Top to bottom', enabled: true, icon: 'faDownLong', color: '#2665ea'},
        'leftToRight': {label: 'Left to right', enabled: true, icon: 'faRightLong', color: '#eacf26'},
    },
});