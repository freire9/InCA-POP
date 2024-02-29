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
    } from '../../stores.js';
    import { debounce } from 'lodash';
    import { onMount } from 'svelte';
    import { calculateInterpolatedColors } from '$lib/utils.js'

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
	<a href="/">Home</a>
</nav>

<h1>Settings</h1>
<p>This is the settings page.</p>
<div class="settings-form flex-column">
    <label>
        Subject name:
        <input bind:value={$subjectName}/>
    </label>
    <label>
        Max balloons quantity on screen:
        <input type="number" min="1" bind:value={$maxBalloonsQuantity}/>
    </label>
    <label>
        Balloon Speed:
        <select bind:value={$balloonSpeed}>
            {#each Object.keys(balloonSpeedOptions) as speedOptionKey}
                <option value={balloonSpeedOptions[speedOptionKey]}>
                    {speedOptionKey.charAt(0).toUpperCase() + speedOptionKey.slice(1).toLowerCase()}
                </option>
            {/each}
        </select>
    </label>
    <label>
        Balloon size:
        <select bind:value={$balloonSize}>
            {#each Object.keys(balloonSizeOptions) as sizeOptionKey}
                <option value={balloonSizeOptions[sizeOptionKey]}>
                    {sizeOptionKey.charAt(0).toUpperCase() + sizeOptionKey.slice(1).toLowerCase()}
                </option>
            {/each}
        </select>
    </label>
    <label>
        Randomize balloons colors?
        <input type="checkbox" bind:checked={$balloonRandomColor}>
    </label>
    {#if !$balloonRandomColor}
        <label>
            Enable range color?
            <input type="checkbox" bind:checked={$enableBalloonRangeColor}>
        </label>
        <label>
            {#if !$enableBalloonRangeColor}
                Balloon color:
                <input type="color" bind:value={$balloonColor}>
            {:else}
                Color 1:
                <input type="color" bind:value={$balloonRangeColor1} on:input={handleColorChange} />
                Color 2:
                <input type="color" bind:value={$balloonRangeColor2} on:input={handleColorChange} />
                Definition:
                <input type="number" bind:value={$balloonRangeColorDefinition} on:input={handleColorChange}>
                <br>
                <div class="color-box">
                    {#each $balloonInterpolatedColors as color (color)}
                      <div class="color-square" style="background-color: {color}"></div>
                    {/each}
                </div>
            {/if}
        </label>
    {/if}
    <label>
        Game background color:
        <input type="color" bind:value={$gameBackgroundColor}>
    </label>
    <label>
        Enable balloon custom letter color:
        <input type="checkbox" bind:checked={$enableCustomLetter}>
    </label>
    {#if $enableCustomLetter}
        <label>
            Balloon letter color:
            <input type="color" bind:value={$balloonLetterColor}>
        </label>
    {/if}
    <div class="flex-column">
        Game Modes (trajectory of the balloon) availables in main menu:
        {#each Object.keys($availableModes) as mode}
            <label class="flex-label">
                {$availableModes[mode].label}:
                <input type="checkbox" bind:checked={$availableModes[mode].enabled}>
            </label>
        {/each}
    </div>
    <label>
        Enable fluid transitions (Firefox presents bugs at clicks):
        <input type="checkbox" bind:checked={$fluidTransitions}>
    </label>
</div>

<style>
    .flex-column{
        display: flex;
        flex-direction: column;
        margin-top: 25px;
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
</style>
