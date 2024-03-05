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
    import { ActionButton, NumberInput, Fa } from 'inca-utils';
    import { goto } from '$app/navigation';
    import { faPlay } from '@fortawesome/free-solid-svg-icons';

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

<div class="settings">
    <nav>
        <ActionButton mode="exit" on:click={() => goto('/')}/>
    </nav>
    
    <main>
        <h1>Settings</h1>
        <div class="settings-form flex-column">
            <h2>Profile</h2>
    
            <label for="subjectNameInput">Subject's name:</label>
            <input id="subjectNameInput" type='text' bind:value={$subjectName}/>
    
            <label for="instructorNameInput">Instructor's name:</label>
            <input id="instructorNameInput" type="text" bind:value={$instructorName}>
    
            <h2>Game settings</h2>
    
            <label for="maxBalloonsInput">Max balloons quantity on screen:</label>
            <NumberInput id="maxBalloonsInput" min=1 max=100 bind:value={$maxBalloonsQuantity}/>
    
            <label for="balloonSpeedSelect">Balloon Speed:</label>
            <select id="balloonSpeedSelect" bind:value={$balloonSpeed}>
                {#each Object.keys(balloonSpeedOptions) as speedOptionKey}
                    <option value={balloonSpeedOptions[speedOptionKey]}>
                        {speedOptionKey.charAt(0).toUpperCase() + speedOptionKey.slice(1).toLowerCase()}
                    </option>
                {/each}
            </select>
    
            <label for="balloonSizeInput">Balloon size:</label>
            <select id="balloonSizeInput" bind:value={$balloonSize}>
                {#each Object.keys(balloonSizeOptions) as sizeOptionKey}
                    <option value={balloonSizeOptions[sizeOptionKey]}>
                        {sizeOptionKey.charAt(0).toUpperCase() + sizeOptionKey.slice(1).toLowerCase()}
                    </option>
                {/each}
            </select>
    
            <div class="checkbox-flex">
                <label for="randomizeColorsCheckbox">Randomize balloons colors?</label>
                <input id="randomizeColorsCheckbox" type="checkbox" bind:checked={$balloonRandomColor}>
            </div>
    
            {#if !$balloonRandomColor}
                <div class="checkbox-flex">
                    <label for="colorRangeCheckbox">Enable range color?</label>
                    <input id="colorRangeCheckbox" type="checkbox" bind:checked={$enableBalloonRangeColor}>
                </div>
    
                {#if !$enableBalloonRangeColor}
                    <div class="checkbox-flex">
                        <label for="balloonColorInput">Balloon color:</label>
                        <input id="balloonColorInput" type="color" bind:value={$balloonColor}>
                    </div>
                {:else}
                    <div class="checkbox-flex">
                        <label for="color1RangeInput">Color 1:</label>
                        <input id="color1RangeInput" type="color" bind:value={$balloonRangeColor1} on:input={handleColorChange} />
                    </div>
    
                    <div class="checkbox-flex">
                        <label for="color2RangeInput">Color 2:</label>
                        <input id="color2RangeInput" type="color" bind:value={$balloonRangeColor2} on:input={handleColorChange} />
                    </div>
    
                    <div class="checkbox-flex">
                        <label for="definitionInput">Definition:</label>
                        <NumberInput id="definitionInput" min=1 max=100 bind:value={$balloonRangeColorDefinition} on:change={handleColorChange} />
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
                <label for="gameBackgroundColorInput">Game background color:</label>
                <input id="gameBackgroundColorInput" type="color" bind:value={$gameBackgroundColor}>
            </div>
    
            <div class="checkbox-flex">
                <label for="balloonLetterColorCheckbox">Enable balloon custom letter color:</label>
                <input id="balloonLetterColorCheckbox" type="checkbox" bind:checked={$enableCustomLetter}>
            </div>
    
            {#if $enableCustomLetter}
                <div class="checkbox-flex">
                    <label for="balloonLetterColorInput">Balloon letter color:</label>
                    <input id="balloonLetterColorInput" type="color" bind:value={$balloonLetterColor}>
                </div>
            {/if}
    
            <h2>Main menu</h2>
            <p>Game Modes to display (Direction of balloons):</p>
            <div class="flex-column">
                {#each Object.keys($availableModes) as mode}
                    <div class="checkbox-flex">
                        <label for={"gameMode" + mode + "Checkbox"} class="flex-label">{$availableModes[mode].label}:</label>
                        <input id={"gameMode" + mode + "Checkbox"} type="checkbox" bind:checked={$availableModes[mode].enabled}>
    
                        {#if !$mainMenuRandomColors}
                            <div class="checkbox-flex">
                                <label for={"gameMode" + mode + "ColorInput"}>Color:</label>
                                <input id={"gameMode" + mode + "ColorInput"} type="color" bind:value={$availableModes[mode].color}>
                            </div>
                        {/if}
                    </div>
                {/each}
    
                <div class="checkbox-flex">
                    <label for="modeRandomColorsCheckbox">Enable random colors in mode representations:</label>
                    <input id="modeRandomColorsCheckbox" type="checkbox" bind:checked={$mainMenuRandomColors}>
                </div>
            </div>
    
            <h2>Browser settings</h2>
            <div class="checkbox-flex">
                <label for="fluidTransitionsCheckbox">Enable fluid transitions (Firefox presents bugs at clicks):</label>
                <input id="fluidTransitionsCheckbox" type="checkbox" bind:checked={$fluidTransitions}>
            </div>
        </div>
    </main>
</div>

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
        padding: 2rem;
    }
    .checkbox-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    .settings{
        position: absolute;
        height: 100vh;
        width: 100vw;
        overflow: auto;
    }
</style>
