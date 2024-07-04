<script>
    import { updatePreferences } from "$lib/preferences";
    import { calculateInterpolatedColors, capitalizeFirstLetter } from "$lib/utils";
    import { gameSettings, popElmntInnerFigs, popElmntTypes } from "../../../stores";
    import lodash from 'lodash';
	import ColorPicker from "../ColorPicker.svelte";
	import NumericInput from "../NumericInput.svelte";
    
    const { debounce } = lodash;
    export let gameMode;
    const handleColorChange = debounce(setExpInterpolatedColors, 500);
    const handleExpInnerFigColorChange = debounce(setExpInnerFigInterpolatedColors, 500);
    const expLabel = popElmntTypes.EXP;
    const expLabelUp = capitalizeFirstLetter(expLabel);
    let expPopElmntLabel;

    const otherPopElmntsProportion = Object.values(popElmntTypes).filter(popElmntType => popElmntType !== popElmntTypes.EXP && popElmntType !== popElmntTypes.NORMAL).reduce((acc, popElmntType) => acc + $gameSettings[gameMode].popElmntConfig[popElmntType].proportion, 0);
    const maxProportion = 100 - otherPopElmntsProportion;

    $: expPopElmntLabel = $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].shape;

    function setExpInnerFigInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigColorRangeDef, $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigRangeColor1, $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigRangeColor2);
        $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigInterpColors = colors;
        updatePreferences();
    }

    function setExpInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].colorRangeDef, $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].rangeColor1, $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].rangeColor2);
        $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].interpColors = colors;
        updatePreferences();
    }
</script>

<NumericInput 
    inputType={"range"} 
    id={"expPopElmntPropInput"} 
    min={0} 
    max={maxProportion} 
    label={"Proportion of " + expLabelUp + " " + expPopElmntLabel + ": " + $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].proportion + "% (" + Math.floor($gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].proportion/100 * $gameSettings[gameMode].maxPopElmntQty) + "/" + $gameSettings[gameMode].maxPopElmntQty + ") (Floor rounded)"}  
    bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].proportion}  
    on:input={updatePreferences}
/>

<div class="checkbox-flex">
    <input id="randomizeExpColorsCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableRandColor} on:input={updatePreferences}>
    <label for="randomizeExpColorsCheckbox">Randomize {expLabel} {expPopElmntLabel} colors?</label>
</div>

{#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableRandColor}
    {#if false}
        <div class="checkbox-flex">
            <input id="expColorRangeCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableRangeColor} on:input={updatePreferences}>
            <label for="expColorRangeCheckbox">Enable {expLabel} {expPopElmntLabel} range color?</label>
        </div>
    {/if}

    {#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableRangeColor}
        <ColorPicker id={"expPopElmntColorInput"} label={expLabelUp + " " + expPopElmntLabel + " color:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].color} on:input={updatePreferences}/>
    {:else if false}
        <div class="pop-elmnt-range-color-container">
            <ColorPicker id={"expColor1RangeInput"} label={expLabelUp + " color 1:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].rangeColor1} on:input={handleColorChange}/>
            <ColorPicker id={"expColor2RangeInput"} label={expLabelUp + " color 2:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].rangeColor2} on:input={handleColorChange}/>

            <div class="range-input">
                <label for="expDefinitionInput">{expLabelUp} definition:</label>
                <p>{$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].colorRangeDef}</p>
            </div>
            <input id="expDefinitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].colorRangeDef} on:input={handleColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].interpColors as color (color)}
                    <div class="color-square" style="background-color: {color}"></div>
                {/each}
            </div>
        </div>
    {/if}
{/if}

<div class="checkbox-flex">
    <input id="enableExpPopElmntInnerFigContour" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableInnerFigContour} on:input={updatePreferences}>
    <label for="enableExpPopElmntInnerFigContour">Enable {expLabel} {expPopElmntLabel} inner figure contour:</label>
</div>

{#if $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableInnerFigContour}
    <ColorPicker id={"expPopElmntInnerFigContourColorInput"} label={expLabelUp + " " + expPopElmntLabel + " inner figure contour color:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigContourColor} on:input={updatePreferences}/>

    <NumericInput 
        inputType={"range"} 
        id={"expPopElmntInnerFigContourWidthInput"} 
        min={1} 
        max={10}
        step={0.1}
        label={expLabelUp + " " + expPopElmntLabel + " inner figure contour width: " + $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigContourWidth + "px"}  
        bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigContourWidth}  
        on:input={updatePreferences}
    />
{/if}

<label for="expInnerFigSelect">{expLabelUp} {expPopElmntLabel} inner figure type:</label>
<select id="expInnerFigSelect" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigType} on:input={updatePreferences}>
    {#each Object.values(popElmntInnerFigs) as innerFigOption}
        <option value={innerFigOption}>
            {capitalizeFirstLetter(innerFigOption)}
        </option>
    {/each}
</select>


<div class="checkbox-flex">
    <input id="randomizeExpInnerFigColorsCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableRandInnerFigColor} on:input={updatePreferences}>
    <label for="randomizeExpInnerFigColorsCheckbox">Randomize {expLabel} {expPopElmntLabel} inner figure colors?</label>
</div>

{#if !$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableInnerFigRandColor}
    {#if false}
        <div class="checkbox-flex">
            <input id="colorRangeExpInnerFigCheckbox" type="checkbox" bind:checked={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableInnerFigRangeColor} on:input={updatePreferences}>
            <label for="colorRangeExpInnerFigCheckbox">Enable {expLabel} inner figure range color?</label>
        </div>
    {/if}
    {#if $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].enableInnerFigRangeColor && false}
        <div class="inner-fig-range-color-container">
            <ColorPicker id={"color1ExpInnerFigRangeInput"} label={expLabelUp + " inner figure color 1:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigRangeColor1} on:input={handleExpInnerFigColorChange}/>
            <ColorPicker id={"color2ExpInnerFigRangeInput"} label={expLabelUp + " inner figure color 2:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigRangeColor2} on:input={handleExpInnerFigColorChange}/>

            <div class="range-input">
                <label for="definitionExpInnerFigColorInput">{expLabelUp} inner figure definition:</label>
                <p>{$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigColorRangeDef}</p>
            </div>
            <input id="definitionExpInnerFigColorInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigColorRangeDef} on:input={handleExpInnerFigColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigInterpColors as color (color)}
                    <div class="color-square" style="background-color: {color}"></div>
                {/each}
            </div>
        </div>
    {:else}
        <ColorPicker id={"expPopElmntInnerFigColorInput"} label={expLabelUp + " " + expPopElmntLabel + " inner figure color:"} bind:value={$gameSettings[gameMode].popElmntConfig[popElmntTypes.EXP].innerFigColor} on:input={updatePreferences}/>
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