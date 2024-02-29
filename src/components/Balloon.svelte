<script>
    import { onDestroy } from 'svelte';
    import { createEventDispatcher } from 'svelte'
    import { 
        balloonLetterColor,
        fluidTransitions,
        enableCustomLetter,
    } from '../stores';

    export let balloon;
    const dispatch = createEventDispatcher();
    const popSound = new Audio('/sounds/balloon-pop.mp3');
    const popCorrectSound = new Audio('/sounds/pop-correct.mp3');

    onDestroy(() => {
        dispatch('balloonDestroyed', { id: balloon.id });
    });

    function playPopSound(){
        const sound = balloon.isSpecial ? popCorrectSound : popSound;
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
        /* border: 0.1vmin solid; */
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
        /* border: 0.1vmin solid; */
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
</style>

<div id= "{balloon.id}" class="balloon not-selectable" on:click={handleClick}
  style:transform = 'translate({balloon.x}px, {balloon.y}px) rotate({balloon.rotation}deg)'
  style:background-color = '{balloon.color}'
  style:width = '{balloon.size.width}px'
  style:height = '{balloon.size.height}px'
  style:--bg-pseudo= '{balloon.color}'
  style:transition={$fluidTransitions ? 'transform 0.3s ease' : ''}
>
  {#if balloon.isSpecial}
    <span
    class="not-selectable"
    style="-webkit-text-fill-color: {$enableCustomLetter ? $balloonLetterColor : 'transparent'};"
    style:font-size='{balloon.size.height * 0.7}px'
    >
    P
    </span>
  {/if}
  <div class="string not-selectable" style:transform='translateX(-50%) rotate({10+balloon.rotation}deg)'></div>
</div>
