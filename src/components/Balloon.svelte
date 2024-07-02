<script>
    import { createEventDispatcher } from 'svelte'
    import { appSettings, gameSettings, popElmntInnerFigs, speechCorrect, speechExcellent } from '../stores';
    import Letter from './inner_figures/Letter.svelte';
    import Disc from './inner_figures/Disc.svelte';

    export let balloon;
    export let gameMode;
    export let currentRampageChain;
    const dispatch = createEventDispatcher();
    const popSound = new Audio('/sounds/balloon-pop.mp3');
    const popCorrectSound = new Audio('/sounds/pop-correct.mp3');
    const rampageSound = new Audio('/sounds/rampage.mp3');

    function isRampage(){
        return $gameSettings[gameMode].enableRampageMode && balloon.isSpecial && ((currentRampageChain + 1) % $gameSettings[gameMode].rampageModeChain === 0);
    }

    function playCustomCorrect(){
        window.speechSynthesis.speak($speechCorrect);
    }

    function playCustomExcellent(){
        window.speechSynthesis.speak($speechExcellent);
    }

    function customSpeechRampage(){
        const pop = popSound;
        pop.currentTime = 0;
        pop.play();
        setTimeout(playCustomCorrect, 400);
        setTimeout(playCustomExcellent, 1400);
    }

    function customSpeechCorrect(){
        const pop = popSound;
        pop.currentTime = 0;
        pop.play();
        setTimeout(playCustomCorrect, 400);
    }

    function playPopSound(){
        if($appSettings.enableCustomSpeeches){
            const pop = popSound;
            pop.currentTime = 0;
            balloon.isSpecial ? (isRampage() ? customSpeechRampage() : customSpeechCorrect()) : pop.play();
            return;
        }
        const sound = balloon.isSpecial ? (isRampage() ? rampageSound : popCorrectSound) : popSound;
        sound.currentTime = 0;
        sound.play();
    }

    function handleClick() {
        playPopSound();
        dispatch('balloonClicked', balloon);
    }
</script>

<style>
    .balloon {
        z-index: 4;
        cursor: pointer;
        position: absolute;
        text-align: center;
        border-radius: 100% / 80% 80% 120% 120%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        /* filter: brightness(1.2); */
        /* background: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.5), transparent 70%); */
        /* background: radial-gradient(circle at 25% 25%, #fff7 12%, #0000 12.5%),radial-gradient(circle at 12% 40%, #fff7 5%, #0000 5.5%),#c47; */
    }
    .balloon::before {
        z-index: 2;
        content: '';
        position: absolute;
        width: 15%;
        height: var(--balloon-knot-height);
        left: 50%;
        top: 100%;
        transform: translateX(-50%);
        border-radius: 100% / 130% 120% 20% 10%;
        background: var(--bg-pseudo);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .string {
        z-index: 2;
        position: absolute;
        width: 1px;
        height: 10%;
        background-color: black;
        bottom: -25%;
        left: 48%;
        border-bottom-left-radius: 50%;
    }
    button:focus-visible,
    button:focus-visible::before{
        outline: 2px solid blue;
    }
</style>

<button id="{balloon.id}" class="balloon not-selectable" on:click|stopPropagation={handleClick}
  style:transform = 'translate({balloon.x}px, {balloon.y}px) rotate({balloon.rotation}deg)'
  style:background-color = '{balloon.color}'
  style:width = '{balloon.size.width}px'
  style:height = '{balloon.size.height}px'
  style:--bg-pseudo= '{balloon.color}'
  style=
    "background: {$gameSettings[gameMode].enableBalloonReflex ? "radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.5), transparent 70%)" : "unset"};
    filter: {$gameSettings[gameMode].enableBalloonReflex ? "brightness(1.2)" : "unset"};"
>
    {#if balloon.isSpecial && balloon.innerFigType == popElmntInnerFigs.LETTER}
        <Letter popElmnt={balloon} gameMode={gameMode} />
    {:else if balloon.isSpecial && balloon.innerFigType == popElmntInnerFigs.DISC}
        <Disc popElmnt={balloon} gameMode={gameMode} />
    {/if}
    <div class="string not-selectable" style:transform='translateX(-50%) rotate({10+balloon.rotation}deg)'></div>
</button>
