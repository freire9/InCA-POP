<script>
    import { 
        balloonSizeOptions, 
        subjectName,
        balloonSpeed,
        balloonSpeedOptions,
        balloonSize,
        availableModes,
        maxBalloonsQuantity,
        balloonRandomColor,
        balloonColor,
        gameBackgroundColor,
        balloonLetterColor,
        fluidTransitions,
        enableCustomLetter,
        enableBalloonRangeColor,
        balloonRangeColor1,
        balloonRangeColor2,
        balloonRangeColorDefinition,
        balloonInterpolatedColors,
        instructorName,
        mainMenuRandomColors,
    } from '../../stores.js';
    import { debounce } from 'lodash';
    import { onMount } from 'svelte';
    import { calculateInterpolatedColors } from '$lib/utils.js'
    import {
        ActionButton,
        Fa,
        NumberInput,
    } from 'inca-utils';
	import { goto } from '$app/navigation';

    // Logic for interpolating colors and updating the store
    function setInterpolatedColors(){
        const colors = calculateInterpolatedColors($balloonRangeColorDefinition, $balloonRangeColor1, $balloonRangeColor2);
        balloonInterpolatedColors.set(colors);
    }

    onMount(() => {
        if($balloonInterpolatedColors.length == 0){
            setInterpolatedColors();
        }
    });

    const handleColorChange = debounce(setInterpolatedColors, 500);
</script>

<nav>
    <ActionButton mode="exit" on:click={() => goto('/')}/>
</nav>

<main>
    <h1>Settings</h1>
    <div class="settings-form flex-column">
        <h2>Profile</h2>

        <label>Subject's name:</label>
        <input type='text' bind:value={$subjectName}/>

        <label>Instructor's name:</label>
        <input type="text" bind:value={$instructorName}>

        <h2>Game settings</h2>

        <label>Max balloons quantity on screen:</label>
        <NumberInput min=1 max=100 bind:value={$maxBalloonsQuantity}/>

        <label>Balloon Speed:</label>
        <select bind:value={$balloonSpeed}>
            {#each Object.keys(balloonSpeedOptions) as speedOptionKey}
                <option value={balloonSpeedOptions[speedOptionKey]}>
                    {speedOptionKey.charAt(0).toUpperCase() + speedOptionKey.slice(1).toLowerCase()}
                </option>
            {/each}
        </select>

        <label>Balloon size:</label>
        <select bind:value={$balloonSize}>
            {#each Object.keys(balloonSizeOptions) as sizeOptionKey}
                <option value={balloonSizeOptions[sizeOptionKey]}>
                    {sizeOptionKey.charAt(0).toUpperCase() + sizeOptionKey.slice(1).toLowerCase()}
                </option>
            {/each}
        </select>

        <div class="checkbox-flex">
            <label>Randomize balloons colors?</label>
            <input type="checkbox" bind:checked={$balloonRandomColor}>
        </div>

        {#if !$balloonRandomColor}
            <div class="checkbox-flex">
                <label>Enable range color?</label>
                <input type="checkbox" bind:checked={$enableBalloonRangeColor}>
            </div>

            {#if !$enableBalloonRangeColor}
                <div class="checkbox-flex">
                    <label>Balloon color:</label>
                    <input type="color" bind:value={$balloonColor}>
                </div>
            {:else}
                <div class="checkbox-flex">
                    <label>Color 1:</label>
                    <input type="color" bind:value={$balloonRangeColor1} on:input={handleColorChange} />
                </div>

                <div class="checkbox-flex">
                    <label>Color 2:</label>
                    <input type="color" bind:value={$balloonRangeColor2} on:input={handleColorChange} />
                </div>

                <div class="checkbox-flex">
                    <label>Definition:</label>
                    <NumberInput min=1 max=100 bind:value={$balloonRangeColorDefinition} on:change={handleColorChange} />
                </div>
                <br>
                <div class="color-box">
                    {#each $balloonInterpolatedColors as color (color)}
                        <div class="color-square" style="background-color: {color}"></div>
                    {/each}
                </div>
            {/if}
        {/if}

        <div class="checkbox-flex">
            <label>Game background color:</label>
            <input type="color" bind:value={$gameBackgroundColor}>
        </div>

        <div class="checkbox-flex">
            <label>Enable balloon custom letter color:</label>
            <input type="checkbox" bind:checked={$enableCustomLetter}>
        </div>

        {#if $enableCustomLetter}
            <div class="checkbox-flex">
                <label>Balloon letter color:</label>
                <input type="color" bind:value={$balloonLetterColor}>
            </div>
        {/if}

        <h2>Main menu</h2>
        <label>Game Modes to display (Direction of balloons):</label>
        <div class="flex-column">
            {#each Object.keys($availableModes) as mode}
                <div class="checkbox-flex">
                    <label class="flex-label">{$availableModes[mode].label}:</label>
                    <input type="checkbox" bind:checked={$availableModes[mode].enabled}>

                    {#if !$mainMenuRandomColors}
                        <div class="checkbox-flex">
                            <label>Color:</label>
                            <input type="color" bind:value={$availableModes[mode].color}>
                        </div>
                    {/if}
                </div>
            {/each}

            <div class="checkbox-flex">
                <label>Enable random colors in mode representations:</label>
                <input type="checkbox" bind:checked={$mainMenuRandomColors}>
            </div>
        </div>

        <h2>Browser settings</h2>
        <div class="checkbox-flex">
            <label>Enable fluid transitions (Firefox presents bugs at clicks):</label>
            <input type="checkbox" bind:checked={$fluidTransitions}>
        </div>
    </div>
</main>

<style>
    .flex-column{
        display: flex;
        flex-direction: column;
    }
    .flex-label{
        margin-left: 35px;
    }
    label{
        margin-top: 25px;
    }
    .color-box {
        display: flex;
        flex-wrap: wrap;
    }
    .color-square {
        width: 50px;
        height: 50px;
        margin: 5px;
    }
    main{
        padding: 0 2rem;
        width: 48rem;
        margin: auto;
    }
    .checkbox-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
</style>
