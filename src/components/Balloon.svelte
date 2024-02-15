<script>
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher();
  export let balloon;


  onDestroy(() => {
    dispatch('balloonDestroyed', { id: balloon.id });
  });

  function handleClick() {
    dispatch('balloonClicked', { id: balloon.id, x:balloon.x, y: balloon.y, color: balloon.color});
  }
</script>

<style>
  div {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  span{
    font-size: x-large;
  }
</style>

<div on:click={handleClick}
  style="transform: translate({balloon.x}px, {balloon.y}px); background-color:{balloon.color};">
  <span>P</span>
</div>

