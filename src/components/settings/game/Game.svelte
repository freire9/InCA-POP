<script>
    import { updatePreferences } from "$lib/preferences";
    import { capitalizeFirstLetter, toCamelCase } from "$lib/utils";
    import { directionIcons, endGameConditionsOpts, endGameConditionsTooltip, gameSettings, menuSettings, popElmntDirections, popElmntSizes, popElmntSpeeds } from "../../../stores";
	import ColorPicker from "../ColorPicker.svelte";
	import NumericInput from "../NumericInput.svelte";
    import PopElmntsTabs from "./PopElmntsTabs.svelte";

    export let mode;

    function handleDirectionChange(event){
        console.log(event.target.value)
        $menuSettings.availableGameModes[mode].icon = directionIcons[event.target.value];
        updatePreferences();
    }

</script>

<label for="popElmntDirectionSelect">Pop element direction:</label>
<select id="popElmntDirectionSelect" bind:value={$gameSettings[mode].popElmntDirection} on:input={handleDirectionChange}>
    {#each Object.values(popElmntDirections) as directionOption}
        <option value={directionOption}>
            {capitalizeFirstLetter(directionOption)}
        </option>
    {/each}
</select>

<NumericInput 
    id={"maxPopElmntQtyInput"}
    min={1}
    max={50}
    label={"Max pop elements quantity on screen:"} 
    bind:value={$gameSettings[mode].maxPopElmntQty} 
    on:input={updatePreferences}
/>

<label for="popElmntSpeedSelect">Pop element speed:</label>
<select id="popElmntSpeedSelect" bind:value={$gameSettings[mode].popElmntSpeed} on:input={updatePreferences}>
    {#each Object.values(popElmntSpeeds) as speedOption}
        <option value={speedOption}>
            {capitalizeFirstLetter(speedOption)}
        </option>
    {/each}
</select>

<label for="popElmntSizeInput">Pop element size:</label>
<select id="popElmntSizeInput" bind:value={$gameSettings[mode].popElmntSize} on:input={updatePreferences}>
    {#each Object.values(popElmntSizes) as sizeOption}
        <option value={sizeOption}>
            {capitalizeFirstLetter(sizeOption)}
        </option>
    {/each}
</select>

<div class="checkbox-flex">
    <input id="enableRampageMode" type="checkbox" bind:checked={$gameSettings[mode].enableRampageMode} on:input={updatePreferences}>
    <label for="enableRampageMode">Enable rampage mode (chain a number of special pop elements):</label>
</div>

{#if $gameSettings[mode].enableRampageMode}
    <div class="rampage-mode-container">
        <NumericInput 
            id={"rampageModeLength"}
            min={2}
            max={50}
            label={"Rampage mode chain length:"} 
            bind:value={$gameSettings[mode].rampageModeChain} 
            on:input={updatePreferences}/>
    </div>
{/if}

<div class="checkbox-flex">
    <input id="enableBalloonReflex" type="checkbox" bind:checked={$gameSettings[mode].enableBalloonReflex} on:input={updatePreferences}>
    <label for="enableBalloonReflex">Enable pop element reflex effect (only aesthetic in pop element type balloon, slight discrepancies between what is seen and what is logged):</label>
</div>

<ColorPicker id={"gameBackgroundColorInput"} label={"Game background color:"} bind:value={$gameSettings[mode].gameBackgroundColor} on:input={updatePreferences}/>

<div class="end-game-container">
    <h3>End game conditions</h3>
    {#each Object.values(endGameConditionsOpts).filter(condition => condition !== endGameConditionsOpts.INACTIVITY) as condition}
        <div class="checkbox-flex">
            <input type="checkbox" id={"endGameCondition" + toCamelCase(condition) + "Checkbox"} bind:checked={$gameSettings[mode].endGameConditions[condition].enabled} on:input={updatePreferences}>
            <label for={"endGameCondition" + toCamelCase(condition) + "Checkbox"}>
                <strong>{capitalizeFirstLetter(condition)}:</strong> {endGameConditionsTooltip[condition]}
            </label>
        </div>
        {#if $gameSettings[mode].endGameConditions[condition].enabled}
            <NumericInput 
                elementClass={'end-game-conditions-input'}
                min={1}
                max={$gameSettings[mode].endGameConditions[condition].rangeMax}
                id={"endGameCondition" + toCamelCase(condition) + "Value"} 
                label={"Value:"} 
                bind:value={$gameSettings[mode].endGameConditions[condition].value} 
                on:input={updatePreferences}/>
        {/if}
    {/each}
</div>

<h3>Pop elements</h3>
<PopElmntsTabs gameMode={mode}/>

<style>
    .checkbox-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    .rampage-mode-container,
    :global(.NumericInput.end-game-conditions-input){
        margin-left: 30px;
    }
    .end-game-container{
        margin-top: 25px;
    }
</style>