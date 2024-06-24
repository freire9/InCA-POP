<script>
	import { updateRemotePreferences } from "$lib/firebaseFunctions";
	import { updateLocalPreferences } from "$lib/localPreferences";
	import { updatePreferences } from "$lib/preferences";
	import { capitalizeFirstLetter, toCamelCase } from "$lib/utils";
	import { availableGameModes, isLoggedIn, menuSettings, modifyingConfig, syncPreferencesFromRemote, user } from "../../stores";
	import ColorPicker from "./ColorPicker.svelte";
    import lodash from 'lodash';
    
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
        
        if($syncPreferencesFromRemote && $isLoggedIn && $user) updateRemotePreferences();
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
</script>
<p>Game modes to display (direction of pop elements):</p>
<div class="flex-column">
    <div class="game-modes-container">
        {#each Object.keys(availableGameModes) as mode}
            <div class="checkbox-flex">
                <input id={"gameMode" + toCamelCase(mode) + "Checkbox"} type="checkbox" bind:checked={$menuSettings.availableGameModes[mode].enabled} on:input={handleModeCheckbox}>
                <label for={"gameMode" + toCamelCase(mode) + "Checkbox"}>{capitalizeFirstLetter(mode)}:</label>
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
</style>