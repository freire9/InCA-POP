<script>
	import { syncPreferencesFromFirestore, updateRemotePreferences } from "$lib/firebaseFunctions";
	import { updateLocalPreferences } from "$lib/localPreferences";
	import { updatePreferences } from "$lib/preferences";
	import { capitalizeFirstLetter, toCamelCase } from "$lib/utils";
	import { availableGameModes, isLoggedIn, loadPreferencesFromRemote, menuSettings, modifyingConfig, savePreferencesToRemote, syncAppSettingsFromRemote, syncAppSettingsToRemote, syncGameSettingsFromRemote, syncGameSettingsToRemote, syncMenuSettingsFromRemote, syncMenuSettingsToRemote, user, useRemoteDb } from "../../stores";
	import ColorPicker from "./ColorPicker.svelte";
    import lodash from 'lodash';
	import SliderInput from "./SliderInput.svelte";
	import { USE_FIREBASE } from "$lib/firebaseConfig";
    
    const { debounce } = lodash;

    let modesByPositions = {};
    let positionByModes = {};

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
    function handleToggle(checked) {
        if (checked) toggleSaveRemotePreferences(true);
        else toggleSaveRemotePreferences(false);
    }
    function handleToggleLoad(checked) {
        if (checked) toggleLoadRemotePreferences(true);
        else toggleLoadRemotePreferences(false);
    }
    const toggleSaveRemotePreferences = (toggle) => {
        if(toggle){
            if($syncGameSettingsToRemote || $syncAppSettingsToRemote || $syncMenuSettingsToRemote){
                $savePreferencesToRemote = true;
                updateRemotePreferences();
            } else $savePreferencesToRemote = false;
            localStorage.setItem('savePreferencesToRemote', $savePreferencesToRemote.toString());
            localStorage.setItem('syncMenuSettingsToRemote', $syncMenuSettingsToRemote.toString());
        }
    }
    async function toggleLoadRemotePreferences(toggle) {
        if(toggle){
            if($syncGameSettingsFromRemote || $syncMenuSettingsFromRemote || $syncAppSettingsFromRemote){
                $loadPreferencesFromRemote = true;
                await syncPreferencesFromFirestore();
            } else $loadPreferencesFromRemote = false;
            localStorage.setItem('loadPreferencesFromRemote', $loadPreferencesFromRemote.toString());
            localStorage.setItem('syncMenuSettingsFromRemote', $syncMenuSettingsFromRemote.toString());
        }
    }
    const handleToggleSaveRemotePreferences = debounce((toggle) => handleToggle(toggle), 1500);
    const handleToggleLoadRemotePreferences = debounce((toggle) => handleToggleLoad(toggle), 1500);
</script>

<div class="main-menu-title-wrapper">
    <h2>Main menu</h2>
    {#if USE_FIREBASE && $isLoggedIn && $user && $useRemoteDb}
        <div class="remote-preferences-btn-wrapper">
            <SliderInput 
                bind:value={$syncMenuSettingsToRemote}
                label={"Save preferences remotely"}
                on:change={handleToggleSaveRemotePreferences}
            />
            <SliderInput 
                bind:value={$syncMenuSettingsFromRemote}
                label={"Load preferences remotely"}
                on:change={handleToggleLoadRemotePreferences}
            />
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
    @media (max-width: 600px) {
        .game-mode-extras{
            flex-direction: column;
            align-items: flex-start;
        }
    }
    .main-menu-title-wrapper{
        display: flex;
        gap: 80px;
        align-items: center;
    }
    .remote-preferences-btn-wrapper{
        display: flex;
        gap: 10px;
    }
    @media (max-width: 600px) {
        .main-menu-title-wrapper{
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
        }
        .remote-preferences-btn-wrapper{
            margin-bottom: 30px;
        }
    }
</style>