<script>
    import { updatePreferences } from "$lib/preferences";
    import { calculateInterpolatedColors, capitalizeFirstLetter } from "$lib/utils";
    import { gameSettings, popElmntInnerFigs, popElmntTypes } from "../../../stores";
    import lodash from 'lodash';
    
    const { debounce } = lodash;
    export let gameMode;
    const handleColorChange = debounce(setCtrlInterpolatedColors, 500);
    const handleCtrlInnerFigColorChange = debounce(setCtrlInnerFigInterpolatedColors, 500);
    const ctrlLabel = popElmntTypes.CTRL;
    const ctrlLabelUp = capitalizeFirstLetter(ctrlLabel);
    let ctrlPopElmntLabel;

    $: ctrlPopElmntLabel = $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].shape;

    function setCtrlInnerFigInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigColorRangeDef, $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor1, $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor2);
        $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigInterpColors = colors;
        updatePreferences();
    }
    
    function setCtrlInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].colorRangeDef, $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].rangeColor1, $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].rangeColor2);
        $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].interpColors = colors;
        updatePreferences();
    }
</script>

<div class="range-input">
    <label for="ctrlPopElmntPropInput">Proportion of {ctrlLabel} {ctrlPopElmntLabel}:</label>
    <p>{$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].proportion}% ({Math.floor($gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].proportion/100 * $gameSettings[gameMode].maxPopElmntQty)}/{$gameSettings[gameMode].maxPopElmntQty}) (Floor rounded)</p>
</div>
<input id="ctrlPopElmntPropInput" min="0" max="{100 - $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].proportion}" step="1" type="range" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].proportion} on:input={updatePreferences}>

<div class="checkbox-flex">
    <label for="randomizeCtrlColorsCheckbox">Randomize {ctrlLabel} {ctrlPopElmntLabel} colors?</label>
    <input id="randomizeCtrlColorsCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRandColor} on:input={updatePreferences}>
</div>

{#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRandColor}
    <div class="checkbox-flex">
        <label for="ctrlColorRangeCheckbox">Enable {ctrlLabel} {ctrlPopElmntLabel} range color?</label>
        <input id="ctrlColorRangeCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRangeColor} on:input={updatePreferences}>
    </div>

    {#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRangeColor}
        <div class="color-flex">
            <label for="ctrlPopElmntColorInput">{ctrlLabelUp} {ctrlPopElmntLabel} color:</label>
            <input id="ctrlPopElmntColorInput" class="color-input" type="color" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].color} on:input={updatePreferences}>
        </div>
    {:else}
        <div class="pop-elmnt-range-color-container">
            <div class="color-flex">
                <label for="ctrlColor1RangeInput">{ctrlLabelUp} color 1:</label>
                <input id="ctrlColor1RangeInput" class="color-input" type="color" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].rangeColor1} on:input={handleColorChange} />
            </div>

            <div class="color-flex">
                <label for="ctrlColor2RangeInput">{ctrlLabelUp} color 2:</label>
                <input id="ctrlColor2RangeInput" class="color-input" type="color" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].rangeColor2} on:input={handleColorChange} />
            </div>

            <div class="range-input">
                <label for="ctrlDefinitionInput">{ctrlLabelUp} definition:</label>
                <p>{$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].colorRangeDef}</p>
            </div>
            <input id="ctrlDefinitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].colorRangeDef} on:input={handleColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].interpColors as color (color)}
                    <div class="color-square" style="background-color: {color}"></div>
                {/each}
            </div>
        </div>
    {/if}
{/if}

<div class="checkbox-flex">
    <label for="enableCtrlPopElmntInnerFigContour">Enable {ctrlLabel} {ctrlPopElmntLabel} inner figure contour:</label>
    <input id="enableCtrlPopElmntInnerFigContour" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableInnerFigContour} on:input={updatePreferences}>
</div>

<label for="ctrlInnerFigSelect">{ctrlLabelUp} {ctrlPopElmntLabel} inner figure type:</label>
<select id="ctrlInnerFigSelect" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigType} on:input={updatePreferences}>
    {#each Object.values(popElmntInnerFigs) as innerFigOption}
        <option value={innerFigOption}>
            {capitalizeFirstLetter(innerFigOption)}
        </option>
    {/each}
</select>

<div class="checkbox-flex">
    <label for="colorRangeCtrlInnerFigCheckbox">Enable {ctrlLabel} inner figure range color?</label>
    <input id="colorRangeCtrlInnerFigCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableInnerFigRangeColor} on:input={updatePreferences}>
</div>
{#if $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableInnerFigRangeColor}
    <div class="inner-fig-range-color-container">
        <div class="color-flex">
            <label for="color1CtrlInnerFigRangeInput">{ctrlLabelUp} inner figure color 1:</label>
            <input id="color1CtrlInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor1} on:input={handleCtrlInnerFigColorChange}>
        </div>
        <div class="color-flex">
            <label for="color2CtrlInnerFigRangeInput">{ctrlLabelUp} inner figure color 2:</label>
            <input id="color2CtrlInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor2} on:input={handleCtrlInnerFigColorChange}>
        </div>
        <div class="range-input">
            <label for="definitionCtrlInnerFigColorInput">{ctrlLabelUp} inner figure definition:</label>
            <p>{$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigColorRangeDef}</p>
        </div>
        <input id="definitionCtrlInnerFigColorInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigColorRangeDef} on:input={handleCtrlInnerFigColorChange}>
        <br>
        <div class="color-box">
            {#each $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigInterpColors as color (color)}
                <div class="color-square" style="background-color: {color}"></div>
            {/each}
        </div>
    </div>
{:else}
    <div class="color-flex">
        <label for="ctrlPopElmntInnerFigColorInput">{ctrlLabelUp} {ctrlPopElmntLabel} inner figure color:</label>
        <input id="ctrlPopElmntInnerFigColorInput" class="color-input" type="color" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigColor} on:input={updatePreferences}>
    </div>
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
    .inner-fig-range-color-container,
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