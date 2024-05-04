<script>
    import { updatePreferences } from "$lib/preferences";
    import { capitalizeFirstLetter, toCamelCase } from "$lib/utils";
    import { endGameConditionsOpts, endGameConditionsTooltip, gameSettings, popElmntSizes, popElmntSpeeds } from "../../../stores";
    import PopElmntsTabs from "./PopElmntsTabs.svelte";

    export let mode;

</script>

<div class="range-input">
    <label for="maxPopElmntQtyInput">Max pop elements quantity on screen:</label>
    <p>{$gameSettings[mode].maxPopElmntQty}</p>
</div>
<input id="maxPopElmntQtyInput" min="1" max="50" step="1" type="range" bind:value={$gameSettings[mode].maxPopElmntQty} on:input={updatePreferences}>

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
    <label for="enableRampageMode">Enable rampage mode (chain a number of special pop elements):</label>
    <input id="enableRampageMode" type="checkbox" bind:checked={$gameSettings[mode].enableRampageMode} on:input={updatePreferences}>
</div>

{#if $gameSettings[mode].enableRampageMode}
    <div class="rampage-mode-container">
        <div class="range-input">
            <label for="rampageModeLength">Rampage mode chain length:</label>
            <p>{$gameSettings[mode].rampageModeChain}</p>
        </div>
        <input type="range" min="2" max="50" step="1" bind:value={$gameSettings[mode].rampageModeChain} on:input={updatePreferences}>
    </div>
{/if}

<div class="checkbox-flex">
    <label for="enableBalloonReflex">Enable pop element reflex effect (only aesthetic in pop element type balloon, slight discrepancies between what is seen and what is logged):</label>
    <input id="enableBalloonReflex" type="checkbox" bind:checked={$gameSettings[mode].enableBalloonReflex} on:input={updatePreferences}>
</div>

<div class="color-flex">
    <label for="gameBackgroundColorInput">Game background color:</label>
    <input id="gameBackgroundColorInput" class="color-input" type="color" bind:value={$gameSettings[mode].gameBackgroundColor} on:input={updatePreferences}>
</div>

<div class="end-game-container">
    <h3>End game conditions</h3>
    {#each Object.values(endGameConditionsOpts) as condition}
        <div class="checkbox-flex">
            <input type="checkbox" id={"endGameCondition" + toCamelCase(condition) + "Checkbox"} bind:checked={$gameSettings[mode].endGameConditions[condition].enabled} on:input={updatePreferences}>
            <label for={"endGameCondition" + toCamelCase(condition) + "Checkbox"}>
                <strong>{capitalizeFirstLetter(condition)}:</strong> {endGameConditionsTooltip[condition]}
            </label>
        </div>
        {#if $gameSettings[mode].endGameConditions[condition].enabled}
            <div class="end-game-values-container">
                <div class="range-input">
                    <label for={"endGameCondition" + toCamelCase(condition) + "Value"}>Value:</label>
                    <p>{$gameSettings[mode].endGameConditions[condition].value}</p>
                </div>
                <input type="range" min="1" max="{$gameSettings[mode].endGameConditions[condition].rangeMax}" step="1" id={"endGameCondition" + toCamelCase(condition) + "Value"} bind:value={$gameSettings[mode].endGameConditions[condition].value} on:input={updatePreferences}>
            </div>
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
    .end-game-values-container{
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
    .end-game-container{
        margin-top: 25px;
    }
    .color-flex{
        display: flex;
        align-items: flex-end;
        gap: 10px;
    }
    .color-flex label{
        margin-bottom: 0px;
    }
</style>