<script>
	import { handleUpdateRemotePreferences, updateRemotePreferences } from "$lib/firebaseFunctions";
    import { calculateInterpolatedColors, capitalizeFirstLetter } from "$lib/utils";
    import { gameSettings, isLoggedIn, popElmntInnerFigs, popElmntTypes, user } from "../../../stores";
    import lodash from 'lodash';
    
    const { debounce } = lodash;
    const handleColorChange = debounce(setCtrlInterpolatedColors, 500);
    const handleCtrlInnerFigColorChange = debounce(setCtrlInnerFigInterpolatedColors, 500);
    const ctrlLabel = popElmntTypes.CTRL;
    const ctrlLabelUp = capitalizeFirstLetter(ctrlLabel);
    let ctrlPopElmntLabel;

    $: ctrlPopElmntLabel = $gameSettings.popElmntConfig[popElmntTypes.CTRL].shape;

    function setCtrlInnerFigInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigColorRangeDef, $gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor1, $gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor2);
        $gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigInterpColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }
    
    function setCtrlInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.popElmntConfig[popElmntTypes.CTRL].colorRangeDef, $gameSettings.popElmntConfig[popElmntTypes.CTRL].rangeColor1, $gameSettings.popElmntConfig[popElmntTypes.CTRL].rangeColor2);
        $gameSettings.popElmntConfig[popElmntTypes.CTRL].interpColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }
</script>

<div class="range-input">
    <label for="ctrlPopElmntPropInput">Proportion of {ctrlLabel} {ctrlPopElmntLabel}:</label>
    <p>{$gameSettings.popElmntConfig[popElmntTypes.CTRL].proportion}% ({Math.floor($gameSettings.popElmntConfig[popElmntTypes.CTRL].proportion/100 * $gameSettings.maxPopElmntQty)}/{$gameSettings.maxPopElmntQty}) (Floor rounded)</p>
</div>
<input id="ctrlPopElmntPropInput" min="0" max="{100 - $gameSettings.popElmntConfig[popElmntTypes.CTRL].proportion}" step="1" type="range" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].proportion} on:input={handleUpdateRemotePreferences}>

<div class="checkbox-flex">
    <label for="randomizeCtrlColorsCheckbox">Randomize {ctrlLabel} {ctrlPopElmntLabel} colors?</label>
    <input id="randomizeCtrlColorsCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.CTRL].enableRandColor} on:input={handleUpdateRemotePreferences}>
</div>

{#if !$gameSettings.popElmntConfig[popElmntTypes.CTRL].enableRandColor}
    <div class="checkbox-flex">
        <label for="ctrlColorRangeCheckbox">Enable {ctrlLabel} {ctrlPopElmntLabel} range color?</label>
        <input id="ctrlColorRangeCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.CTRL].enableRangeColor} on:input={handleUpdateRemotePreferences}>
    </div>

    {#if !$gameSettings.popElmntConfig[popElmntTypes.CTRL].enableRangeColor}
        <div class="color-flex">
            <label for="ctrlPopElmntColorInput">{ctrlLabelUp} {ctrlPopElmntLabel} color:</label>
            <input id="ctrlPopElmntColorInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].color} on:input={handleUpdateRemotePreferences}>
        </div>
    {:else}
        <div class="pop-elmnt-range-color-container">
            <div class="color-flex">
                <label for="ctrlColor1RangeInput">{ctrlLabelUp} color 1:</label>
                <input id="ctrlColor1RangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].rangeColor1} on:input={handleColorChange} />
            </div>

            <div class="color-flex">
                <label for="ctrlColor2RangeInput">{ctrlLabelUp} color 2:</label>
                <input id="ctrlColor2RangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].rangeColor2} on:input={handleColorChange} />
            </div>

            <div class="range-input">
                <label for="ctrlDefinitionInput">{ctrlLabelUp} definition:</label>
                <p>{$gameSettings.popElmntConfig[popElmntTypes.CTRL].colorRangeDef}</p>
            </div>
            <input id="ctrlDefinitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].colorRangeDef} on:input={handleColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings.popElmntConfig[popElmntTypes.CTRL].interpColors as color (color)}
                    <div class="color-square" style="background-color: {color}"></div>
                {/each}
            </div>
        </div>
    {/if}
{/if}

<div class="checkbox-flex">
    <label for="enableCtrlPopElmntInnerFigContour">Enable {ctrlLabel} {ctrlPopElmntLabel} inner figure contour:</label>
    <input id="enableCtrlPopElmntInnerFigContour" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.CTRL].enableInnerFigContour} on:input={handleUpdateRemotePreferences}>
</div>

<label for="ctrlInnerFigSelect">{ctrlLabelUp} {ctrlPopElmntLabel} inner figure type:</label>
<select id="ctrlInnerFigSelect" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigType} on:input={handleUpdateRemotePreferences}>
    {#each Object.values(popElmntInnerFigs) as innerFigOption}
        <option value={innerFigOption}>
            {capitalizeFirstLetter(innerFigOption)}
        </option>
    {/each}
</select>

<div class="checkbox-flex">
    <label for="colorRangeCtrlInnerFigCheckbox">Enable {ctrlLabel} inner figure range color?</label>
    <input id="colorRangeCtrlInnerFigCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.CTRL].enableInnerFigRangeColor} on:input={handleUpdateRemotePreferences}>
</div>
{#if $gameSettings.popElmntConfig[popElmntTypes.CTRL].enableInnerFigRangeColor}
    <div class="inner-fig-range-color-container">
        <div class="color-flex">
            <label for="color1CtrlInnerFigRangeInput">{ctrlLabelUp} inner figure color 1:</label>
            <input id="color1CtrlInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor1} on:input={handleCtrlInnerFigColorChange}>
        </div>
        <div class="color-flex">
            <label for="color2CtrlInnerFigRangeInput">{ctrlLabelUp} inner figure color 2:</label>
            <input id="color2CtrlInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigRangeColor2} on:input={handleCtrlInnerFigColorChange}>
        </div>
        <div class="range-input">
            <label for="definitionCtrlInnerFigColorInput">{ctrlLabelUp} inner figure definition:</label>
            <p>{$gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigColorRangeDef}</p>
        </div>
        <input id="definitionCtrlInnerFigColorInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigColorRangeDef} on:input={handleCtrlInnerFigColorChange}>
        <br>
        <div class="color-box">
            {#each $gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigInterpColors as color (color)}
                <div class="color-square" style="background-color: {color}"></div>
            {/each}
        </div>
    </div>
{:else}
    <div class="color-flex">
        <label for="ctrlPopElmntInnerFigColorInput">{ctrlLabelUp} {ctrlPopElmntLabel} inner figure color:</label>
        <input id="ctrlPopElmntInnerFigColorInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.CTRL].innerFigColor} on:input={handleUpdateRemotePreferences}>
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