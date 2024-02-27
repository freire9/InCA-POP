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
    position: absolute;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }
  span{
    font-size: x-large;
  }
</style>

<div on:click={handleClick}
  style:transform = 'translate({balloon.x}px, {balloon.y}px)'
  style:background-color = '{balloon.color}'
  style:width = '{balloon.size.width}px'
  style:height = '{balloon.size.height}px'
>
  <span style:color={$balloonLetterColor}>P</span>
</div>

