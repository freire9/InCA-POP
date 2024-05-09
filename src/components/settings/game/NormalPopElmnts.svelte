<script>
    import { updatePreferences } from "$lib/preferences";
    import { calculateInterpolatedColors, capitalizeFirstLetter } from "$lib/utils";
    import { gameSettings, popElmntTypes } from "../../../stores";
    import lodash from 'lodash';
	import ColorPicker from "../ColorPicker.svelte";
    
    const { debounce } = lodash;
    export let gameMode;
    const handleColorChange = debounce(setNormalInterpolatedColors, 500);
    const normalLabel = popElmntTypes.NORMAL;
    const normalLabelUp = capitalizeFirstLetter(normalLabel);
    let normalPopElmntLabel;

    $: normalPopElmntLabel = $gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].shape;

    function setNormalInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].colorRangeDef, $gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].rangeColor1, $gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].rangeColor2);
        $gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].interpColors = colors;
        updatePreferences();
    }
</script>

<div class="checkbox-flex">
    <label for="randomizeNormalColorsCheckbox">Randomize {normalLabel} {normalPopElmntLabel} colors?</label>
    <input id="randomizeNormalColorsCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].enableRandColor} on:input={updatePreferences}>
</div>

{#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].enableRandColor}
    {#if false}
        <div class="checkbox-flex">
            <label for="normalColorRangeCheckbox">Enable {normalLabel} {normalPopElmntLabel} range color?</label>
            <input id="normalColorRangeCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].enableRangeColor} on:input={updatePreferences}>
        </div>
    {/if}

    {#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].enableRangeColor}
        <ColorPicker id={"normalPopElmntColorInput"} label={normalLabelUp + " " + normalPopElmntLabel + " color:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].color} on:input={updatePreferences}/>
    {:else if false}
        <div class="pop-elmnt-range-color-container">
            <ColorPicker id={"normalColor1RangeInput"} label={normalLabelUp + " color 1:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].rangeColor1} on:input={handleColorChange}/>
            <ColorPicker id={"normalColor2RangeInput"} label={normalLabelUp + " color 2:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].rangeColor2} on:input={handleColorChange}/>

            <div class="range-input">
                <label for="normalDefinitionInput">{normalLabelUp} Definition:</label>
                <p>{$gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].colorRangeDef}</p>
            </div>
            <input id="normalDefinitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].colorRangeDef} on:input={handleColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings[gameMode].popElmntConfig[popElmntTypes.NORMAL].interpColors as color (color)}
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
    .checkbox-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    label{
        margin-top: 25px;
    }
</style>