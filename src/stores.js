import { writable} from 'svelte/store';

export const subjectName = writable('subject-name');
export const instructorName = writable('instructor-name');
export const balloonSpeedOptions = {
    SLOW: {min: 0.08, max: 0.2},
    NORMAL: {min: 0.2, max: 0.4},
    FAST: {min: 0.4, max: 0.6},
}
export const balloonSpeed = writable(balloonSpeedOptions.NORMAL);
export const balloonSizeOptions = {
    SMALL: {width: 40, height: 50},
    NORMAL: {width: 80, height: 100},
    BIG: {width: 120, height: 145},
}
export const balloonSize = writable(balloonSizeOptions.NORMAL);
export const mainMenuRandomColors = writable(true);
export const availableModes = writable({
    'rightToLeft': {label: 'Right to left', enabled: true, icon: 'faLeftLong', color: '#ff0000'},
    'bottomToTop': {label: 'Bottom to top', enabled: true, icon: 'faUpLong', color: '#22d933'},
    'topToBottom': {label: 'Top to bottom', enabled: true, icon: 'faDownLong', color: '#2665ea'},
    'leftToRight': {label: 'Left to right', enabled: true, icon: 'faRightLong', color: '#eacf26'},
    }
);
export const gameDirection = writable('leftToRight');
export const maxBalloonsQuantity = writable('8');
export const balloonRandomColor = writable(true);
export const enableBalloonRangeColor = writable(false);
export const balloonRangeColor1 = writable('#ff0000');
export const balloonRangeColor2 = writable('#00ff00');
export const balloonRangeColorDefinition = writable(10);
export const balloonInterpolatedColors = writable([]);
export const balloonColor = writable('#ff0000');
export const gameBackgroundColor = writable('#add8e6');
export const enableCustomLetter = writable(false);
export const balloonLetterColor = writable('#000000');
export const fluidTransitions = writable(true);
export const menuBackgroundColor = writable('#ffffff')