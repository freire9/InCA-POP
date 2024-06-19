<script>
    import { createEventDispatcher } from 'svelte';

    export let inputType = 'number';
    export let value;
    export let id;
    export let elementClass = '';
    export let label;
    export let min = 0;
    export let max = 100;
    export let step = 1;

    const dispatch = createEventDispatcher();

    function handleInput(event) {
        let newValue = +event.target.value;
        if (newValue > max) value = max;
        
        dispatch('input');
    }

    function handlePlus() {
        if(value + step > max) return;

        value = value + step;
        dispatch('input');
    }

    function handleMinus() {
        if(value - step < min) return;

        value = value - step;
        dispatch('input');
    }
</script>

<div class='NumericInput {elementClass}'>
    <label for={id}>{label}</label>
    <div>
        <button on:click={handleMinus}>-</button>
        {#if inputType === 'range'}
            <input type="range" id={id} min={min} max={max} step={step} bind:value={value} on:input={handleInput}>
        {:else}
            <input type="number" id={id} min={min} max={max} step={step} bind:value={value} on:input={handleInput}>
        {/if}
        <button on:click={handlePlus}>+</button>
    </div>
</div>

<style>
    .NumericInput div {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    button {
        padding: 10px;
        background-color: #f0f0f0;
        cursor: pointer;
        border-radius: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        touch-action: manipulation;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    input {
        padding: 5px;
        border: none;
        text-align: center;
    }
</style>