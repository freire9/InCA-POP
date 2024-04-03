<script>
    import { balloonSizeOptions, balloonSpeedOptions, gameSettings, appSettings, menuSettings, isLoggedIn, user } from '../../stores.js';
    import lodash from 'lodash';
    import { onMount } from 'svelte';
    import { calculateInterpolatedColors, downloadJsonLocal, downloadJsonRemote, downloadCsvLocal, downloadCsvRemote, deepCopy } from '$lib/utils.js'
    import { Fa } from 'inca-utils';
    import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
    import Profile from '../../components/Profile.svelte';
	import UserNavBar from '../../components/UserNavBar.svelte';
	import { db } from '$lib/firebaseConfig.js';
	import { doc, updateDoc } from 'firebase/firestore';

    const { debounce } = lodash;

    // Logic for interpolating colors and updating the store
    function setInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.balloonRangeColorDefinition, $gameSettings.balloonRangeColor1, $gameSettings.balloonRangeColor2);
        $gameSettings.balloonInterpolatedColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }
    function setLetterInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.letterColorDefinition, $gameSettings.letterColorRange1, $gameSettings.letterColorRange2);
        $gameSettings.letterInterpolatedColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }

    onMount(() => {
        if($gameSettings.balloonInterpolatedColors.length == 0) setInterpolatedColors();
        if($gameSettings.letterInterpolatedColors.length == 0) setLetterInterpolatedColors();
    });

    const handleColorChange = debounce(setInterpolatedColors, 500);
    const handleLetterColorChange = debounce(setLetterInterpolatedColors, 500);
    const handleUpdateRemotePreferences = debounce(updateRemotePreferences, 500);

    function handleRemoteJsonDownload (){
        if ($isLoggedIn && $user) downloadJsonRemote($user.uid);
    }
    function handleRemoteCsvDownload(){
        if ($isLoggedIn && $user) downloadCsvRemote($user.uid);
    }

    async function updateRemotePreferences(){
        if (!$isLoggedIn || !$user) return;
        const userDocRef = doc(db, 'users', $user.uid);
        await updateDoc(userDocRef, {
            preferences: { 
                gameSettings: deepCopy($gameSettings),
                appSettings: deepCopy($appSettings),
                menuSettings: deepCopy($menuSettings)},
        });
        console.log('Settings updated')
    }
</script>

<div class="settings">

    <UserNavBar />
    <main>
        <h1>Settings</h1>
        <div class="settings-form flex-column">
            
            <h2>Profile</h2>
            <Profile />
            
            <label for="subjectNameInput">Subject's name:</label>
            <input id="subjectNameInput" type='text' bind:value={$appSettings.subjectName} on:input={handleUpdateRemotePreferences}/>
            
            <label for="instructorNameInput">Instructor's name:</label>
            <input id="instructorNameInput" type="text" bind:value={$appSettings.instructorName} on:input={handleUpdateRemotePreferences}>
            
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
            
            <div class="range-input">
                <label for="maxBalloonsInput">Max balloons quantity on screen:</label>
                <p>{$gameSettings.maxBalloonsQuantity}</p>
            </div>
            <input id="maxBalloonsInput" min="1" max="50" step="1" type="range" bind:value={$gameSettings.maxBalloonsQuantity} on:input={handleUpdateRemotePreferences}>

            <div class="range-input">
                <label for="specialBalloonsPropInput">Proportion of special balloons (balloons with letters):</label>
                <p>{$gameSettings.specialBalloonsProp}% ({Math.floor($gameSettings.specialBalloonsProp/100 * $gameSettings.maxBalloonsQuantity)}/{$gameSettings.maxBalloonsQuantity})</p>
            </div>
            <input id="specialBalloonsPropInput" min="1" max="100" step="1" type="range" bind:value={$gameSettings.specialBalloonsProp} on:input={handleUpdateRemotePreferences}>
    
            <label for="balloonSpeedSelect">Balloon Speed:</label>
            <select id="balloonSpeedSelect" bind:value={$gameSettings.balloonSpeed} on:input={handleUpdateRemotePreferences}>
                {#each Object.keys(balloonSpeedOptions) as speedOptionKey}
                    <option value={speedOptionKey}>
                        {speedOptionKey.charAt(0).toUpperCase() + speedOptionKey.slice(1).toLowerCase()}
                    </option>
                {/each}
            </select>
    
            <label for="balloonSizeInput">Balloon size:</label>
            <select id="balloonSizeInput" bind:value={$gameSettings.balloonSize} on:input={handleUpdateRemotePreferences}>
                {#each Object.keys(balloonSizeOptions) as sizeOptionKey}
                    <option value={sizeOptionKey}>
                        {sizeOptionKey.charAt(0).toUpperCase() + sizeOptionKey.slice(1).toLowerCase()}
                    </option>
                {/each}
            </select>

            <div class="checkbox-flex">
                <label for="enableBalloonReflex">Enable balloon reflex effect (only aesthetic, slight discrepancies between what is seen and what is logged):</label>
                <input id="enableBalloonReflex" type="checkbox" bind:checked={$gameSettings.enableBalloonReflex} on:input={handleUpdateRemotePreferences}>
            </div>
    
            <div class="checkbox-flex">
                <label for="randomizeColorsCheckbox">Randomize balloons colors?</label>
                <input id="randomizeColorsCheckbox" type="checkbox" bind:checked={$gameSettings.balloonRandomColor} on:input={handleUpdateRemotePreferences}>
            </div>
    
            {#if !$gameSettings.balloonRandomColor}
                <div class="checkbox-flex">
                    <label for="colorRangeCheckbox">Enable range color?</label>
                    <input id="colorRangeCheckbox" type="checkbox" bind:checked={$gameSettings.enableBalloonRangeColor} on:input={handleUpdateRemotePreferences}>
                </div>
    
                {#if !$gameSettings.enableBalloonRangeColor}
                    <div class="color-flex">
                        <label for="balloonColorInput">Balloon color:</label>
                        <input id="balloonColorInput" class="color-input" type="color" bind:value={$gameSettings.balloonColor} on:input={handleUpdateRemotePreferences}>
                    </div>
                {:else}
                    <div class="balloon-range-color-container">
                        <div class="color-flex">
                            <label for="color1RangeInput">Color 1:</label>
                            <input id="color1RangeInput" class="color-input" type="color" bind:value={$gameSettings.balloonRangeColor1} on:input={handleColorChange} />
                        </div>
        
                        <div class="color-flex">
                            <label for="color2RangeInput">Color 2:</label>
                            <input id="color2RangeInput" class="color-input" type="color" bind:value={$gameSettings.balloonRangeColor2} on:input={handleColorChange} />
                        </div>
        
                        <div class="range-input">
                            <label for="definitionInput">Definition:</label>
                            <p>{$gameSettings.balloonRangeColorDefinition}</p>
                        </div>
                        <input id="definitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.balloonRangeColorDefinition} on:input={handleColorChange}>
                        <br>
                        <div class="color-box">
                            {#each $gameSettings.balloonInterpolatedColors as color (color)}
                                <div class="color-square" style="background-color: {color}"></div>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/if}
    
            <div class="color-flex">
                <label for="gameBackgroundColorInput">Game background color:</label>
                <input id="gameBackgroundColorInput" class="color-input" type="color" bind:value={$gameSettings.gameBackgroundColor} on:input={handleUpdateRemotePreferences}>
            </div>

            <div class="checkbox-flex">
                <label for="enableBalloonLetterContour">Enable balloon letter contour:</label>
                <input id="enableBalloonLetterContour" type="checkbox" bind:checked={$gameSettings.enableLetterContour} on:input={handleUpdateRemotePreferences}>
            </div>
    
            <div class="checkbox-flex">
                <label for="balloonLetterColorCheckbox">Enable balloon custom letter color:</label>
                <input id="balloonLetterColorCheckbox" type="checkbox" bind:checked={$gameSettings.enableCustomLetter} on:input={handleUpdateRemotePreferences}>
            </div>
            {#if $gameSettings.enableCustomLetter}
                <div class="checkbox-flex">
                    <label for="colorRangeLetterCheckbox">Enable letter range color?</label>
                    <input id="colorRangeLetterCheckbox" type="checkbox" bind:checked={$gameSettings.enableLetterRangeColor} on:input={handleUpdateRemotePreferences}>
                </div>
                {#if $gameSettings.enableLetterRangeColor}
                    <div class="letter-range-color-container">
                        <div class="color-flex">
                            <label for="color1LetterRangeInput">Color 1:</label>
                            <input id="color1LetterRangeInput" class="color-input" type="color" bind:value={$gameSettings.letterColorRange1} on:input={handleLetterColorChange}>
                        </div>
                        <div class="color-flex">
                            <label for="color2LetterRangeInput">Color 2:</label>
                            <input id="color2LetterRangeInput" class="color-input" type="color" bind:value={$gameSettings.letterColorRange2} on:input={handleLetterColorChange}>
                        </div>
                        <div class="range-input">
                            <label for="definitionLetterColorInput">Definition:</label>
                            <p>{$gameSettings.letterColorDefinition}</p>
                        </div>
                        <input id="definitionLetterColorInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.letterColorDefinition} on:input={handleLetterColorChange}>
                        <br>
                        <div class="color-box">
                            {#each $gameSettings.letterInterpolatedColors as color (color)}
                                <div class="color-square" style="background-color: {color}"></div>
                            {/each}
                        </div>
                    </div>
                {:else}
                    <div class="color-flex">
                        <label for="balloonLetterColorInput">Balloon letter color:</label>
                        <input id="balloonLetterColorInput" class="color-input" type="color" bind:value={$gameSettings.balloonLetterColor} on:input={handleUpdateRemotePreferences}>
                    </div>
                {/if}
            {/if}
    
            <h2>Main menu</h2>
            <p>Game Modes to display (Direction of balloons):</p>
            <div class="flex-column">
                <div class="game-modes-container">
                    {#each Object.keys($gameSettings.availableModes) as mode}
                        <div class="checkbox-flex">
                            <label for={"gameMode" + mode + "Checkbox"}>{$gameSettings.availableModes[mode].label}:</label>
                            <input id={"gameMode" + mode + "Checkbox"} type="checkbox" bind:checked={$gameSettings.availableModes[mode].enabled} on:input={handleUpdateRemotePreferences}>
        
                            {#if !$menuSettings.mainMenuRandomColors}
                                <div class="color-flex">
                                    <label for={"gameMode" + mode + "ColorInput"}>Color:</label>
                                    <input id={"gameMode" + mode + "ColorInput"} class="color-input" type="color" bind:value={$gameSettings.availableModes[mode].color} on:input={handleUpdateRemotePreferences}>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
    
                <div class="checkbox-flex">
                    <label for="modeRandomColorsCheckbox">Enable random colors in mode representations:</label>
                    <input id="modeRandomColorsCheckbox" type="checkbox" bind:checked={$menuSettings.mainMenuRandomColors} on:input={handleUpdateRemotePreferences}>
                </div>

                <div class="color-flex">
                    <label for="menuBackgroundColor">Main menu background color:</label>
                    <input id="menuBackgroundColor" class="color-input" type="color" bind:value={$menuSettings.menuBackgroundColor} on:input={handleUpdateRemotePreferences}>
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
    .color-flex{
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
    .letter-range-color-container,
    .balloon-range-color-container,
    .game-modes-container{
        margin-left: 30px;
    }
    .range-input{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        margin-top: 25px;
    }
    .range-input label{
        margin: 0px;
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
