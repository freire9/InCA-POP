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

    let speech;
    onMount(async () => {
        ({speech} = await import('inca-utils/api'));
        // Set defaults
        $speech.speeches['correct'] ??='Correct';

    })

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

            {#if speech!=undefined}
                <h2>Speeches</h2>

                <fieldset>
                    <div class="inca-form-inline">
                        <label for="speech-volume">Voice</label>
                        <select bind:value={$speech.config.voiceName} id="">
                        {#each $speech.voices as voice}
                            <option value={voice}>{voice}</option>
                        {/each}
                        </select>
                    </div>

                    <div class="inca-form-inline">
                        <label for="speech-volume">Volume</label>
                        <input
                        bind:value={$speech.config.volume}
                        min="0"
                        max="1"
                        step="0.01"
                        type="range"
                        id="speech-volume"
                        />
                        <p class="inca-label">{$speech.config.volume}</p>
                    </div>

                    <div class="inca-form-inline">
                        <label for="speech-pitch">Pitch</label>
                        <input
                        bind:value={$speech.config.pitch}
                        min="0"
                        max="2"
                        step="0.1"
                        type="range"
                        id="speech-pitch"
                        />
                        <p class="inca-label">{$speech.config.pitch}</p>
                    </div>

                    <div class="inca-form-inline">
                        <label for="speech-rate">Rate</label>
                        <input
                        bind:value={$speech.config.rate}
                        min="0.1"
                        max="2"
                        step="0.1"
                        type="range"
                        id="speech-rate"
                        />
                        <p class="inca-label">{$speech.config.rate}</p>
                    </div>
                </fieldset>

                <label for="speech-test-input">Correct:</label>
                <div class="speech-input">
                    <input
                        bind:value={$speech.speeches.correct}
                        type="text"
                        id="speech-test-input"
                        placeholder="Correct"
                    />
                    <button on:click={() => speech.play('correct')}>
                        <Fa icon={faPlay} />
                    </button>
                </div>
            {/if}
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
        width: 48rem;
        margin: auto;
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
    .speech-input {
    display: flex;
    gap: 0.5rem;
  }

  .speech-input button {
    border-radius: 0.6rem;
    padding: 0.8rem 2em;
    background-color: var(--inca-primary-container);
    color: var(--inca-on-primary-container);
  }

  .inca-form-inline {
    display: grid;
    grid-template-columns: 4rem 1fr 3rem;
  }

  select {
    grid-column: 2 / span 2;
  }

  fieldset {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0 2rem;
  }

</style>
