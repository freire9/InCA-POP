<script>
    import { gameSettings, appSettings, menuSettings, isLoggedIn, user, isFullScreen, menuSettingsDEFAULT, appSettingsDEFAULT, gameSettingsDEFAULT, subjectName, popElmntSpeeds, popElmntSizes} from '../../stores.js';
    import { downloadJsonLocal, downloadJsonRemote, downloadCsvLocal, downloadCsvRemote, deepCopy, handleUpdateRemotePreferences, updateRemotePreferences } from '$lib/utils.js'
    import { Fa } from 'inca-utils';
    import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
    import Profile from '../../components/settings/Profile.svelte';
    import UserNavBar from '../../components/UserNavBar.svelte';
    import PopElmntsTabs from '../../components/settings/game/PopElmntsTabs.svelte';

	import Speeches from '../../components/settings/Speeches.svelte';
    import lodash from 'lodash';

    const { debounce } = lodash;

    function handleRemoteJsonDownload (){
        if ($isLoggedIn && $user) downloadJsonRemote($user.uid);
    }
    function handleRemoteCsvDownload(){
        if ($isLoggedIn && $user) downloadCsvRemote($user.uid);
    }

    function handleRestoreDefaults(){
        gameSettings.set(deepCopy(gameSettingsDEFAULT));
        appSettings.set(deepCopy(appSettingsDEFAULT));
        menuSettings.set(deepCopy(menuSettingsDEFAULT));
        console.log('Default settings restored')
        if ($isLoggedIn && $user) updateRemotePreferences();
    }

    function handleRestoreDefaultsWarning(){
        if(confirm('Are you sure you want to restore default settings? (if logged in, changes will be saved to the database!)')){
            handleRestoreDefaults();
        }
    }

    function saveSubjectNameLocal(){
        localStorage.setItem('subjectName', $subjectName);
        console.log('Subject name saved to local storage')
    }

    const handleSaveSubjectLocal = debounce(saveSubjectNameLocal, 500);
</script>

<div class="settings {$isFullScreen ? 'fullscreen' : ''}">

    <UserNavBar />
    <main>
        <h1>Settings</h1>
        <div class="settings-form flex-column">
            
            <h2>Profile</h2>
            <Profile />

            <button class="restore-btn" on:click={handleRestoreDefaultsWarning}>Restore default settings</button>
            
            <label for="subjectNameInput">Subject's name:</label>
            <input id="subjectNameInput" type='text' bind:value={$subjectName} on:input={handleSaveSubjectLocal}/>
            
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

            <h2>Global game</h2>
            <div class="range-input">
                <label for="maxPopElmntQtyInput">Max pop elements quantity on screen:</label>
                <p>{$gameSettings.maxPopElmntQty}</p>
            </div>
            <input id="maxPopElmntQtyInput" min="1" max="50" step="1" type="range" bind:value={$gameSettings.maxPopElmntQty} on:input={handleUpdateRemotePreferences}>

            <label for="popElmntSpeedSelect">Pop element speed:</label>
            <select id="popElmntSpeedSelect" bind:value={$gameSettings.popElmntSpeed} on:input={handleUpdateRemotePreferences}>
                {#each Object.values(popElmntSpeeds) as speedOption}
                    <option value={speedOption}>
                        {speedOption.charAt(0).toUpperCase() + speedOption.slice(1).toLowerCase()}
                    </option>
                {/each}
            </select>

            <label for="popElmntSizeInput">Pop element size:</label>
            <select id="popElmntSizeInput" bind:value={$gameSettings.popElmntSize} on:input={handleUpdateRemotePreferences}>
                {#each Object.values(popElmntSizes) as sizeOption}
                    <option value={sizeOption}>
                        {sizeOption.charAt(0).toUpperCase() + sizeOption.slice(1).toLowerCase()}
                    </option>
                {/each}
            </select>

            <div class="checkbox-flex">
                <label for="enableRampageMode">Enable rampage mode (chain a number of special pop elements):</label>
                <input id="enableRampageMode" type="checkbox" bind:checked={$gameSettings.enableRampageMode} on:input={handleUpdateRemotePreferences}>
            </div>

            {#if $gameSettings.enableRampageMode}
                <div class="rampage-mode-container">
                    <div class="range-input">
                        <label for="rampageModeLength">Rampage mode chain length:</label>
                        <p>{$gameSettings.rampageModeChain}</p>
                    </div>
                    <input type="range" min="2" max="50" step="1" bind:value={$gameSettings.rampageModeChain} on:input={handleUpdateRemotePreferences}>
                </div>
            {/if}

            <div class="checkbox-flex">
                <label for="enableBalloonReflex">Enable pop element reflex effect (only aesthetic in pop element type balloon, slight discrepancies between what is seen and what is logged):</label>
                <input id="enableBalloonReflex" type="checkbox" bind:checked={$gameSettings.enableBalloonReflex} on:input={handleUpdateRemotePreferences}>
            </div>
            
            <div class="color-flex">
                <label for="gameBackgroundColorInput">Game background color:</label>
                <input id="gameBackgroundColorInput" class="color-input" type="color" bind:value={$gameSettings.gameBackgroundColor} on:input={handleUpdateRemotePreferences}>
            </div>

            <h2>Pop elements</h2>
            <PopElmntsTabs />
    
            <h2>Main menu</h2>
            <p>Game modes to display (direction of pop elements):</p>
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

            <h2>Speeches</h2>
            <Speeches />
        </div>
    </main>
</div>

<style>
    .fullscreen{
        height: 100vh;
        overflow: auto;
    }
    .flex-column{
        display: flex;
        flex-direction: column;
    }
    label{
        margin-top: 25px;
    }
    main{
        padding: 2rem;
    }
    .checkbox-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    .color-flex{
        display: flex;
        align-items: flex-end;
        gap: 10px;
    }
    .color-flex label{
        margin-bottom: 0px;
    }
    .logs-container{
        display: flex;
    }

    button.download-logs-btn,
    button.restore-btn{
        background-color: beige;
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 10px;
        text-align: center;
    }

    button.download-logs-btn:hover,
    button.restore-btn:hover{
        background-color: #e6e6e6;
    }

    button.download-logs-btn:focus,
    button.restore-btn:focus{
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

    .game-modes-container,
    .rampage-mode-container{
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
