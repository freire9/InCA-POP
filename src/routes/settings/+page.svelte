<script>
    import { balloonSizeOptions, balloonSpeedOptions, gameSettings, appSettings, menuSettings, isLoggedIn, user } from '../../stores.js';
    import lodash from 'lodash';
    import { onMount } from 'svelte';
    import { calculateInterpolatedColors, downloadJsonLocal, downloadJsonRemote, downloadCsvLocal, downloadCsvRemote } from '$lib/utils.js'
    import { ActionButton, NumberInput, Fa } from 'inca-utils';
    import { goto } from '$app/navigation';
    import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
    import Profile from '../../components/Profile.svelte';

    const { debounce } = lodash;

    // Logic for interpolating colors and updating the store
    function setInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.balloonRangeColorDefinition, $gameSettings.balloonRangeColor1, $gameSettings.balloonRangeColor2);
        $gameSettings.balloonInterpolatedColors = colors;
    }

    onMount(() => {
        if($gameSettings.balloonInterpolatedColors.length == 0) setInterpolatedColors();
    });

    const handleColorChange = debounce(setInterpolatedColors, 500);

    function handleRemoteJsonDownload (){
        if ($isLoggedIn && $user) downloadJsonRemote($user.uid);
    }
    function handleRemoteCsvDownload(){
        if ($isLoggedIn && $user) downloadCsvRemote($user.uid);
    }

</script>

<div class="settings">
    <nav>
        <ActionButton mode="exit" on:click={() => goto('/')}/>
    </nav>
    
    <main>
        <h1>Settings</h1>
        <div class="settings-form flex-column">
            
            <h2>Profile</h2>
            <Profile />
            
            <label for="subjectNameInput">Subject's name:</label>
            <input id="subjectNameInput" type='text' bind:value={$appSettings.subjectName}/>
            
            <label for="instructorNameInput">Instructor's name:</label>
            <input id="instructorNameInput" type="text" bind:value={$appSettings.instructorName}>
            
            <h2>Logs</h2>
            <div class="logs-container">
                <div class="local-logs-container">
                    <button class="download-logs-btn" on:click={downloadJsonLocal}>
                        <Fa icon={faFileArrowDown} />
                        Download local logs file (JSON)
                    </button>
                    <button class="download-logs-btn" on:click={downloadCsvLocal}>
                        <Fa icon={faFileArrowDown} />
                        Download local logs file (CSV)
                    </button>
                </div>
                {#if $isLoggedIn && $user}
                    <div class="remote-logs-container">
                        <button class="download-logs-btn" on:click={handleRemoteJsonDownload}>
                            <Fa icon={faFileArrowDown} />
                            Download remote database logs file (JSON)
                        </button>
                        <button class="download-logs-btn" on:click={handleRemoteCsvDownload}>
                            <Fa icon={faFileArrowDown} />
                            Download remote database logs file (CSV)
                        </button>
                    </div>
                {/if}
            </div>

            <h2>Game settings</h2>
    
            <label for="maxBalloonsInput">Max balloons quantity on screen:</label>
            <NumberInput id="maxBalloonsInput" min=1 max=100 bind:value={$gameSettings.maxBalloonsQuantity}/>

            <label for="specialBalloonsFreqInput">Frequency of ocurrence of special balloons (balloons with letters)</label>
            <div class="number-percent-flex">
                <NumberInput id="specialBalloonsFreqInput" min=1 max=100 bind:value={$gameSettings.specialBalloonsFreq} /> 
                <span>%</span>
            </div>
    
            <label for="balloonSpeedSelect">Balloon Speed:</label>
            <select id="balloonSpeedSelect" bind:value={$gameSettings.balloonSpeed}>
                {#each Object.keys(balloonSpeedOptions) as speedOptionKey}
                    <option value={speedOptionKey}>
                        {speedOptionKey.charAt(0).toUpperCase() + speedOptionKey.slice(1).toLowerCase()}
                    </option>
                {/each}
            </select>
    
            <label for="balloonSizeInput">Balloon size:</label>
            <select id="balloonSizeInput" bind:value={$gameSettings.balloonSize}>
                {#each Object.keys(balloonSizeOptions) as sizeOptionKey}
                    <option value={sizeOptionKey}>
                        {sizeOptionKey.charAt(0).toUpperCase() + sizeOptionKey.slice(1).toLowerCase()}
                    </option>
                {/each}
            </select>
    
            <div class="checkbox-flex">
                <label for="randomizeColorsCheckbox">Randomize balloons colors?</label>
                <input id="randomizeColorsCheckbox" type="checkbox" bind:checked={$gameSettings.balloonRandomColor}>
            </div>
    
            {#if !$gameSettings.balloonRandomColor}
                <div class="checkbox-flex">
                    <label for="colorRangeCheckbox">Enable range color?</label>
                    <input id="colorRangeCheckbox" type="checkbox" bind:checked={$gameSettings.enableBalloonRangeColor}>
                </div>
    
                {#if !$gameSettings.enableBalloonRangeColor}
                    <div class="color-flex">
                        <label for="balloonColorInput">Balloon color:</label>
                        <input id="balloonColorInput" class="color-input" type="color" bind:value={$gameSettings.balloonColor}>
                    </div>
                {:else}
                    <div class="color-flex">
                        <label for="color1RangeInput">Color 1:</label>
                        <input id="color1RangeInput" class="color-input" type="color" bind:value={$gameSettings.balloonRangeColor1} on:input={handleColorChange} />
                    </div>
    
                    <div class="color-flex">
                        <label for="color2RangeInput">Color 2:</label>
                        <input id="color2RangeInput" class="color-input" type="color" bind:value={$gameSettings.balloonRangeColor2} on:input={handleColorChange} />
                    </div>
    
                    <div class="number-flex">
                        <label for="definitionInput">Definition:</label>
                        <NumberInput id="definitionInput" min=1 max=100 bind:value={$gameSettings.balloonRangeColorDefinition} on:change={handleColorChange} />
                    </div>
                    <br>
                    <div class="color-box">
                        {#each $gameSettings.balloonInterpolatedColors as color (color)}
                            <div class="color-square" style="background-color: {color}"></div>
                        {/each}
                    </div>
                {/if}
            {/if}
    
            <div class="color-flex">
                <label for="gameBackgroundColorInput">Game background color:</label>
                <input id="gameBackgroundColorInput" class="color-input" type="color" bind:value={$gameSettings.gameBackgroundColor}>
            </div>
    
            <div class="checkbox-flex">
                <label for="balloonLetterColorCheckbox">Enable balloon custom letter color:</label>
                <input id="balloonLetterColorCheckbox" type="checkbox" bind:checked={$gameSettings.enableCustomLetter}>
            </div>
    
            {#if $gameSettings.enableCustomLetter}
                <div class="color-flex">
                    <label for="balloonLetterColorInput">Balloon letter color:</label>
                    <input id="balloonLetterColorInput" class="color-input" type="color" bind:value={$gameSettings.balloonLetterColor}>
                </div>
            {/if}
    
            <h2>Main menu</h2>
            <p>Game Modes to display (Direction of balloons):</p>
            <div class="flex-column">
                {#each Object.keys($gameSettings.availableModes) as mode}
                    <div class="checkbox-flex">
                        <label for={"gameMode" + mode + "Checkbox"} class="flex-label">{$gameSettings.availableModes[mode].label}:</label>
                        <input id={"gameMode" + mode + "Checkbox"} type="checkbox" bind:checked={$gameSettings.availableModes[mode].enabled}>
    
                        {#if !$menuSettings.mainMenuRandomColors}
                            <div class="color-flex">
                                <label for={"gameMode" + mode + "ColorInput"}>Color:</label>
                                <input id={"gameMode" + mode + "ColorInput"} class="color-input" type="color" bind:value={$gameSettings.availableModes[mode].color}>
                            </div>
                        {/if}
                    </div>
                {/each}
    
                <div class="checkbox-flex">
                    <label for="modeRandomColorsCheckbox">Enable random colors in mode representations:</label>
                    <input id="modeRandomColorsCheckbox" type="checkbox" bind:checked={$menuSettings.mainMenuRandomColors}>
                </div>

                <div class="color-flex">
                    <label for="menuBackgroundColor">Main menu background color:</label>
                    <input id="menuBackgroundColor" class="color-input" type="color" bind:value={$menuSettings.menuBackgroundColor}>
                </div>
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
        margin-top: 15px;
    }
    .color-square {
        width: 50px;
        height: 50px;
        margin: 5px;
    }
    main{
        padding: 2rem;
    }
    .checkbox-flex,
    .color-flex,
    .number-flex{
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
    .logs-container{
        display: flex;
    }

    button.download-logs-btn{
        background-color: beige;
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 10px;
        text-align: center;
    }

    button.download-logs-btn:hover{
        background-color: #e6e6e6;
    }

    button.download-logs-btn:focus{
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }

    input.color-input{
        border: 1px solid black;
    }
    
    .local-logs-container,
    .remote-logs-container{
        display: grid;
    }
    .number-percent-flex{
        display: flex;
        align-items: center;
    }
    @media (max-width: 600px) {
        .logs-container{
            flex-direction: column;
            gap: 20px;
        }
        button.download-logs-btn{
            width: 220px;
        }
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        .logs-container{
            gap: 50px;
        }
        button.download-logs-btn{
            width: 230px;
        }
    }
    @media (min-width: 1024px){
        .logs-container{
            gap: 100px;
        }
        button.download-logs-btn{
            width: 300px;
        }
    }
</style>
