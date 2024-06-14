<script>
    import { updatePreferences } from "$lib/preferences";
    import { calculateInterpolatedColors, capitalizeFirstLetter } from "$lib/utils";
    import { gameSettings, popElmntInnerFigs, popElmntTypes } from "../../../stores";
    import lodash from 'lodash';
	import ColorPicker from "../ColorPicker.svelte";
	import NumericInput from "../NumericInput.svelte";
    
    const { debounce } = lodash;
    export let gameMode;
    const handleColorChange = debounce(setCtrlInterpolatedColors, 500);
    const handleCtrlInnerFigColorChange = debounce(setCtrlInnerFigInterpolatedColors, 500);
    const ctrlLabel = popElmntTypes.CTRL;
    const ctrlLabelUp = capitalizeFirstLetter(ctrlLabel);
    let ctrlPopElmntLabel;

    const otherPopElmntsProportion = Object.values(popElmntTypes).filter(popElmntType => popElmntType !== popElmntTypes.CTRL && popElmntType !== popElmntTypes.NORMAL).reduce((acc, popElmntType) => acc + $gameSettings[gameMode].popElmntConfig[popElmntType].proportion, 0);
    const maxProportion = 100 - otherPopElmntsProportion;

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

<NumericInput 
    inputType={"range"} 
    id={"ctrlPopElmntPropInput"}
    min={0}
    max={maxProportion}
    label={"Proportion of " + ctrlLabelUp + " " + ctrlPopElmntLabel + ": " + $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].proportion + "% (" + Math.floor($gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].proportion/100 * $gameSettings[gameMode].maxPopElmntQty) + "/" + $gameSettings[gameMode].maxPopElmntQty + ") (Floor rounded)"} 
    bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].proportion} 
    on:input={updatePreferences}
/>

<div class="checkbox-flex">
    <input id="randomizeCtrlColorsCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRandColor} on:input={updatePreferences}>
    <label for="randomizeCtrlColorsCheckbox">Randomize {ctrlLabel} {ctrlPopElmntLabel} colors?</label>
</div>

{#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRandColor}
    {#if false}
        <div class="checkbox-flex">
            <input id="ctrlColorRangeCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRangeColor} on:input={updatePreferences}>
            <label for="ctrlColorRangeCheckbox">Enable {ctrlLabel} {ctrlPopElmntLabel} range color?</label>
        </div>
    {/if}

    {#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRangeColor}
        <ColorPicker id={"ctrlPopElmntColorInput"} label={ctrlLabelUp + " " + ctrlPopElmntLabel + " color:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].color} on:input={updatePreferences}/>
    {:else if false}
        <div class="pop-elmnt-range-color-container">
            <ColorPicker id={"ctrlColor1RangeInput"} label={ctrlLabelUp + " color 1:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].rangeColor1} on:input={handleColorChange}/>
            <ColorPicker id={"ctrlColor2RangeInput"} label={ctrlLabelUp + " color 2:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].rangeColor2} on:input={handleColorChange}/>

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
    <input id="enableCtrlPopElmntInnerFigContour" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableInnerFigContour} on:input={updatePreferences}>
    <label for="enableCtrlPopElmntInnerFigContour">Enable {ctrlLabel} {ctrlPopElmntLabel} inner figure contour:</label>
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
    <input id="randomizeCtrlInnerFigColorsCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRandInnerFigColor} on:input={updatePreferences}>
    <label for="randomizeCtrlInnerFigColorsCheckbox">Randomize {ctrlLabel} {ctrlPopElmntLabel} inner figure colors?</label>
</div>

{#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableRandInnerFigColor}
    {#if false}
        <div class="checkbox-flex">
            <input id="colorRangeCtrlInnerFigCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableInnerFigRangeColor} on:input={updatePreferences}>
            <label for="colorRangeCtrlInnerFigCheckbox">Enable {ctrlLabel} inner figure range color?</label>
        </div>
    {/if}
    {#if $gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].enableInnerFigRangeColor && false}
        <div class="inner-fig-range-color-container">
            <ColorPicker id={"color1CtrlInnerFigRangeInput"} label={ctrlLabelUp + " inner figure color 1:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor1} on:input={handleCtrlInnerFigColorChange}/>
            <ColorPicker id={"color2CtrlInnerFigRangeInput"} label={ctrlLabelUp + " inner figure color 2:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor2} on:input={handleCtrlInnerFigColorChange}/>

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
        <ColorPicker id={"ctrlPopElmntInnerFigColorInput"} label={ctrlLabelUp + " " + ctrlPopElmntLabel + " inner figure color:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.CTRL].innerFigColor} on:input={updatePreferences}/>
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
    .checkbox-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    label{
        margin-top: 25px;
    }
</style>