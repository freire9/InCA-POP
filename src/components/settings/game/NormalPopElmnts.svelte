<script>
	import { handleUpdateRemotePreferences, updateRemotePreferences } from "$lib/firebaseFunctions";
    import { calculateInterpolatedColors, capitalizeFirstLetter } from "$lib/utils";
    import { gameSettings, isLoggedIn, user, popElmntTypes } from "../../../stores";
    import lodash from 'lodash';
    
    const { debounce } = lodash;
    const handleColorChange = debounce(setNormalInterpolatedColors, 500);
    const normalLabel = popElmntTypes.NORMAL;
    const normalLabelUp = capitalizeFirstLetter(normalLabel);
    let normalPopElmntLabel;

    $: normalPopElmntLabel = $gameSettings.popElmntConfig[popElmntTypes.NORMAL].shape;

    function setNormalInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.popElmntConfig[popElmntTypes.NORMAL].colorRangeDef, $gameSettings.popElmntConfig[popElmntTypes.NORMAL].rangeColor1, $gameSettings.popElmntConfig[popElmntTypes.NORMAL].rangeColor2);
        $gameSettings.popElmntConfig[popElmntTypes.NORMAL].interpColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }
</script>

<div class="checkbox-flex">
    <label for="randomizeNormalColorsCheckbox">Randomize {normalLabel} {normalPopElmntLabel} colors?</label>
    <input id="randomizeNormalColorsCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.NORMAL].enableRandColor} on:input={handleUpdateRemotePreferences}>
</div>

{#if !$gameSettings.popElmntConfig[popElmntTypes.NORMAL].enableRandColor}
    <div class="checkbox-flex">
        <label for="normalColorRangeCheckbox">Enable {normalLabel} {normalPopElmntLabel} range color?</label>
        <input id="normalColorRangeCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.NORMAL].enableRangeColor} on:input={handleUpdateRemotePreferences}>
    </div>

    {#if !$gameSettings.popElmntConfig[popElmntTypes.NORMAL].enableRangeColor}
        <div class="color-flex">
            <label for="normalPopElmntColorInput">{normalLabelUp} {normalPopElmntLabel} color:</label>
            <input id="normalPopElmntColorInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.NORMAL].color} on:input={handleUpdateRemotePreferences}>
        </div>
    {:else}
        <div class="pop-elmnt-range-color-container">
            <div class="color-flex">
                <label for="normalColor1RangeInput">{normalLabelUp} color 1:</label>
                <input id="normalColor1RangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.NORMAL].rangeColor1} on:input={handleColorChange} />
            </div>

            <div class="color-flex">
                <label for="normalColor2RangeInput">{normalLabelUp} color 2:</label>
                <input id="normalColor2RangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.NORMAL].rangeColor2} on:input={handleColorChange} />
            </div>

            <div class="range-input">
                <label for="normalDefinitionInput">{normalLabelUp} Definition:</label>
                <p>{$gameSettings.popElmntConfig[popElmntTypes.NORMAL].colorRangeDef}</p>
            </div>
            <input id="normalDefinitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.popElmntConfig[popElmntTypes.NORMAL].colorRangeDef} on:input={handleColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings.popElmntConfig[popElmntTypes.NORMAL].interpColors as color (color)}
                    <div class="color-square" style="background-color: {color}"></div>
                {/each}
            </div>
        </div>
    {/if}
{/if}

<style>
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
    .pop-elmnt-range-color-container{
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
    input.color-input{
        border: 1px solid black;
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
    label{
        margin-top: 25px;
    }
</style>