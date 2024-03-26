<script>
    import { createEventDispatcher } from 'svelte'
    import { gameSettings, appSettings } from '../stores';

    export let balloon;
    const dispatch = createEventDispatcher();
    const popSound = new Audio('/sounds/balloon-pop.mp3');
    const popCorrectSound = new Audio('/sounds/pop-correct.mp3');
    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];

    function playPopSound(){
        const sound = balloon.isSpecial ? popCorrectSound : popSound;
        sound.currentTime = 0;
        sound.play();
    }

    function handleClick() {
        playPopSound();
        dispatch('balloonClicked', balloon);
    }

    function getLetterColor(){
        if($gameSettings.enableCustomLetter && !$gameSettings.enableLetterRangeColor){
            return $gameSettings.balloonLetterColor;
        } else if($gameSettings.enableCustomLetter && $gameSettings.enableLetterRangeColor){
            let randomIndex = Math.floor(Math.random() * $gameSettings.letterInterpolatedColors.length);
            return $gameSettings.letterInterpolatedColors[randomIndex];
        } else{
            return 'transparent';
        }
    }
</script>

<style>
    .balloon {
        cursor: pointer;
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        filter: brightness(1.2);
        border-radius: 100% / 80% 80% 120% 120%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        background: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.5), transparent 70%);
        /* background: radial-gradient(circle at 25% 25%, #fff7 12%, #0000 12.5%),radial-gradient(circle at 12% 40%, #fff7 5%, #0000 5.5%),#c47; */
    }
    .balloon::before {
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
        position: absolute;
        width: 1px;
        height: 10%;
        background-color: black;
        bottom: -25%;
        left: 48%;
        border-bottom-left-radius: 50%;
    }
    span{
        -webkit-text-stroke: 0.7px black;
    }
    button:focus-visible,
    button:focus-visible::before{
        outline: 2px solid blue;
    }
</style>

<button id= "{balloon.id}" class="balloon not-selectable" on:click|stopPropagation={handleClick}
  style:transform = 'translate({balloon.x}px, {balloon.y}px) rotate({balloon.rotation}deg)'
  style:background-color = '{balloon.color}'
  style:width = '{balloon.size.width}px'
  style:height = '{balloon.size.height}px'
  style:--bg-pseudo= '{balloon.color}'
  style:transition={$appSettings.fluidTransitions ? 'transform 0.3s ease' : ''}
>
  {#if balloon.isSpecial}
    <span
    class="not-selectable"
    style="-webkit-text-fill-color: {getLetterColor()};"
    style:font-size='{balloon.size.height * 0.7}px'
    >
    {randomLetter}
    </span>
  {/if}
  <div class="string not-selectable" style:transform='translateX(-50%) rotate({10+balloon.rotation}deg)'></div>
</button>
