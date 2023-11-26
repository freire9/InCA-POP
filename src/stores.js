import { writable} from 'svelte/store';

export const subjectName = writable('subject-name');
export const bubbleSpeed = writable('normal');
export const bubbleSize = writable('normal');
export const gameModes = writable({
    'leftToRight': true, 
    'rightToLeft': true, 
    'topToBottom': true, 
    'bottomToTop': true
    }
)