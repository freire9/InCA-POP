<script>
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte'
  import { balloonLetterColor } from '../stores';

  const dispatch = createEventDispatcher();
  export let balloon;

  onDestroy(() => {
    dispatch('balloonDestroyed', { id: balloon.id });
  });

  function handleClick() {
    dispatch('balloonClicked', balloon);
  }
</script>

<style>
  div {
    cursor: pointer;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    filter: brightness(1.2);
    border-radius: 100% / 80% 80% 120% 120%;
    background: 
      radial-gradient(circle at 25% 25%, #fff7 12%, #0000 12.5%),
      radial-gradient(circle at 12% 40%, #fff7 5%, #0000 5.5%),
      #c47;
    
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    /* border: 0.1vmin solid; */
  }
  div::before {
    content: '';
    position: absolute;
    /* border: 0.1vmin solid; */
    width: 15%;
    height: 15%;
    /* bottom: -12px; */
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    border-radius: 100% / 130% 120% 20% 10%;
    background: var(--bg-pseudo);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  span{
    font-size: x-large;
  }
</style>

<div id= "{balloon.id}" on:click={handleClick}
  style:transform = 'translate({balloon.x}px, {balloon.y}px)'
  style:background-color = '{balloon.color}'
  style:width = '{balloon.size.width}px'
  style:height = '{balloon.size.height}px'
  style:--bg-pseudo= '{balloon.color}'
>
  <span style:color={$balloonLetterColor}>P</span>
</div>

