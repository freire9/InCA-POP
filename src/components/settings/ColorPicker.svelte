<script>
  import { capitalizeFirstLetter } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';
  import { availableColorsNames, availableColorsOpts } from '../../stores';

  export let value;
  export let id;
  export let label;
  export let selectAllOption = false;
  let gradient;
  const dispatch = createEventDispatcher();
    
  function handleInput(event) {
    dispatch('input', event.target.value);
  }

  $: {
    if(!value && selectAllOption) gradient = `linear-gradient(45deg, ${Object.values(availableColorsOpts).join(', ')})`;
  }

</script>

<label for={id}>{label}</label>
<div class="select-container">
    <span class="color-preview" style:background={value ? value : gradient}/>
    <select class="not-selectable" id={id} bind:value={value} on:input={handleInput}>
        {#if selectAllOption}
            <option value="">All colors</option>
        {/if}
        {#each Object.values(availableColorsNames) as colorName}
            <option value={availableColorsOpts[colorName]}>{capitalizeFirstLetter(colorName)}</option>
        {/each}
    </select>
</div>

<style>
  .select-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .color-preview {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: solid 0.5px black;
    border-radius: 20%;
  }
</style>