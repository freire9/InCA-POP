<script>
	import { syncPreferencesFromFirestore, updateRemotePreferences } from "$lib/firebaseFunctions";
	import { updateLocalPreferences } from "$lib/localPreferences";
	import { updatePreferences } from "$lib/preferences";
	import { capitalizeFirstLetter, toCamelCase } from "$lib/utils";
	import { availableGameModes, isLoggedIn, loadPreferencesFromRemote, menuSettings, modifyingConfig, savePreferencesToRemote, syncMenuSettingsFromRemote, syncMenuSettingsToRemote, user, useRemoteDb } from "../../stores";
	import ColorPicker from "./ColorPicker.svelte";
    import lodash from 'lodash';
	import { USE_FIREBASE } from "$lib/firebaseConfig";
    import { faCloudDownload, faCloudUpload } from '@fortawesome/free-solid-svg-icons';
    import { Fa } from "inca-utils";

    const { debounce } = lodash;

    let modesByPositions = {};
    let positionByModes = {};
    let loadingSaveRemotePreferences = false;
    let loadingLoadRemotePreferences = false;

    $:{
        if(!$modifyingConfig){
            handleAuthFinally();
        }
    }

    function managePositionChange(newModeInPos){
        if($menuSettings.enableModesRandomPos || Object.keys(modesByPositions).length === 0 || Object.keys(positionByModes).length === 0) return;
        
        const newPosition = $menuSettings.availableGameModes[newModeInPos].position;
        const oldModeInPos = modesByPositions[newPosition];
        const oldPos = positionByModes[newModeInPos];

        // Update position of the mode that was in the new position
        $menuSettings.availableGameModes[oldModeInPos].position = oldPos;

        modesByPositions[newPosition] = newModeInPos;
        positionByModes[newModeInPos] = newPosition;
        modesByPositions[oldPos] = oldModeInPos;
        positionByModes[oldModeInPos] = oldPos;
        
        if(USE_FIREBASE && $savePreferencesToRemote && $isLoggedIn && $user) updateRemotePreferences();
        else updateLocalPreferences();
    }

    function handleAuthFinally(){
        modesByPositions = Object.fromEntries(Object.keys($menuSettings.availableGameModes).map(mode => [$menuSettings.availableGameModes[mode].position, mode]));
        positionByModes = Object.fromEntries(Object.keys($menuSettings.availableGameModes).map(mode => [mode, $menuSettings.availableGameModes[mode].position]));
    }
    
    const handlePositionChange = debounce((NewModeInPos) => managePositionChange(NewModeInPos), 1500);

    function handleModeCheckbox(event){
        if(!event.target.checked && Object.keys($menuSettings.availableGameModes).filter(mode => $menuSettings.availableGameModes[mode].enabled).length <= 1){
            event.target.checked = true;
            alert('You must have at least 1 game mode enabled');
            return;
        }
        updatePreferences();
    }

    async function saveRemotePreferences(){
        loadingSaveRemotePreferences = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        $savePreferencesToRemote = true;
        $syncMenuSettingsToRemote = true;
        updateRemotePreferences();
        $savePreferencesToRemote = false;
        $syncMenuSettingsToRemote = false;
        loadingSaveRemotePreferences = false;
        alert('Main menu preferences saved to remote database')
    }
    async function loadRemotePreferences(){
        loadingLoadRemotePreferences = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        $syncMenuSettingsFromRemote = true;
        await syncPreferencesFromFirestore();
        updateLocalPreferences();
        loadingLoadRemotePreferences = false;
        $syncMenuSettingsFromRemote = false;
        alert('Main menu preferences loaded from remote database')
    }

    const handleClickLoadRemotePreferences = debounce(loadRemotePreferences, 1500);
    const handleClickSaveRemotePreferences = debounce(saveRemotePreferences, 1500);
</script>

<div class="main-menu-title-wrapper">
    <h2>Main menu</h2>
    {#if USE_FIREBASE && $isLoggedIn && $user && $useRemoteDb}
        <div class='remote-preferences-btn-wrapper'>
            <button class="save-remote-preferences-btn" on:click={handleClickSaveRemotePreferences}>
                {#if loadingSaveRemotePreferences}
                    <span class="loading"></span> Saving preferences to remote...
                {:else}
                    <Fa icon={faCloudUpload} />
                    Save preferences to remote
                {/if}
            </button>
            <button class="load-remote-preferences-btn" on:click={handleClickLoadRemotePreferences}>
                {#if loadingLoadRemotePreferences}
                    <span class="loading"></span> Loading preferences from remote...
                {:else}
                    <Fa icon={faCloudDownload} />
                    Load preferences from remote
                {/if}
            </button>
        </div>
    {/if}
</div>
<p>Game modes to display:</p>
<div class="flex-column">
    <div class="game-modes-container">
        {#each Object.keys(availableGameModes) as mode}
            <div class="checkbox-flex">
                <input id={"gameMode" + toCamelCase(mode) + "Checkbox"} type="checkbox" bind:checked={$menuSettings.availableGameModes[mode].enabled} on:input={handleModeCheckbox}>
                <label for={"gameMode" + toCamelCase(mode) + "Checkbox"}>{capitalizeFirstLetter(mode)}</label>
            </div>
            <div class="game-mode-extras">
                {#if !$menuSettings.mainMenuRandomColors}
                    <ColorPicker id={"gameMode" + mode + "ColorInput"} label={"Color:"} bind:value={$menuSettings.availableGameModes[mode].color} on:input={updatePreferences}/>
                {/if}

                {#if !$menuSettings.enableModesRandomPos}
                    <label for={"gameMode" + mode + "PositionSelect"}>Position:</label>
                    <select id={"gameMode" + mode + "PositionSelect"} bind:value={$menuSettings.availableGameModes[mode].position} on:input={() => handlePositionChange(mode)}>
                        {#each Object.keys($menuSettings.availableGameModes) as position, index}
                            <option value={index}>{index}</option>
                        {/each}
                    </select>
                {/if}
            </div>
        {/each}
    </div>

    <div class="checkbox-flex">
        <input id="modeRandomColorsCheckbox" type="checkbox" bind:checked={$menuSettings.mainMenuRandomColors} on:input={updatePreferences}>
        <label for="modeRandomColorsCheckbox">Enable random colors in mode representations:</label>
    </div>

    <div class="checkbox-flex">
        <input id="randomModePosCheckbox" type="checkbox" bind:checked={$menuSettings.enableModesRandomPos} on:input={updatePreferences}>
        <label for="randomModePosCheckbox">Randomize mode positions:</label>
    </div>

    <ColorPicker id="mainMenuColorInput" label={"Main menu background color:"} bind:value={$menuSettings.menuBackgroundColor} on:input={updatePreferences}/>
</div>

<style>
    .checkbox-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    .game-modes-container,
    .game-mode-extras{
        margin-left: 30px;
    }
    .game-mode-extras{
        display: flex;
        gap: 10px;
        align-items: center;
        padding-top: 12px;
        padding-bottom: 12px;
    }
    .remote-preferences-btn-wrapper{
        display: flex;
        gap: 10px;
    }
    .main-menu-title-wrapper{
        display: flex;
        gap: 80px;
        align-items: center;
    }
    @media (max-width: 600px) {
        .game-mode-extras{
            flex-direction: column;
            align-items: flex-start;
        }
        button.save-remote-preferences-btn,
        button.load-remote-preferences-btn{
            width: 220px;
        }
        .remote-preferences-btn-wrapper{
            flex-direction: column;
            gap: 10px;
            margin-bottom: 30px;
        }
        .main-menu-title-wrapper{
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
        }
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        button.save-remote-preferences-btn,
        button.load-remote-preferences-btn{
            width: 230px;
        }
    }
    @media (min-width: 1024px){
        button.save-remote-preferences-btn,
        button.load-remote-preferences-btn{
            width: 300px;
        }
    }
    button.save-remote-preferences-btn,
    button.load-remote-preferences-btn{
        background-color: beige;
        border-radius: 10px;
        padding: 10px;
        text-align: center;
    }
    button.save-remote-preferences-btn:hover,
    button.load-remote-preferences-btn:hover{
        background-color: #e6e6e6;
    }
    button.save-remote-preferences-btn:focus,
    button.load-remote-preferences-btn:focus{
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }
    .loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #000;
        animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>