<script>
	import { handleUpdateRemotePreferences, updateRemotePreferences } from "$lib/firebaseFunctions";
    import { calculateInterpolatedColors, capitalizeFirstLetter } from "$lib/utils";
    import { gameSettings, isLoggedIn, popElmntInnerFigs, popElmntTypes, user } from "../../../stores";
    import lodash from 'lodash';
    
    const { debounce } = lodash;
    const handleColorChange = debounce(setExpInterpolatedColors, 500);
    const handleExpInnerFigColorChange = debounce(setExpInnerFigInterpolatedColors, 500);
    const expLabel = popElmntTypes.EXP;
    const expLabelUp = capitalizeFirstLetter(expLabel);
    let expPopElmntLabel;

    $: expPopElmntLabel = $gameSettings.popElmntConfig[popElmntTypes.EXP].shape;

    function setExpInnerFigInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigColorRangeDef, $gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigRangeColor1, $gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigRangeColor2);
        $gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigInterpColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }

    function setExpInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.popElmntConfig[popElmntTypes.EXP].colorRangeDef, $gameSettings.popElmntConfig[popElmntTypes.EXP].rangeColor1, $gameSettings.popElmntConfig[popElmntTypes.EXP].rangeColor2);
        $gameSettings.popElmntConfig[popElmntTypes.EXP].interpColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }
</script>

<div class="range-input">
    <label for="expPopElmntPropInput">Proportion of {expLabel} {expPopElmntLabel}:</label>
    <p>{$gameSettings.popElmntConfig[popElmntTypes.EXP].proportion}% ({Math.floor($gameSettings.popElmntConfig[popElmntTypes.EXP].proportion/100 * $gameSettings.maxPopElmntQty)}/{$gameSettings.maxPopElmntQty}) (Floor rounded)</p>
</div>
<input id="expPopElmntPropInput" min="0" max="{100-$gameSettings.popElmntConfig[popElmntTypes.EXP].proportion}" step="1" type="range" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].proportion} on:input={handleUpdateRemotePreferences}>

<div class="checkbox-flex">
    <label for="randomizeExpColorsCheckbox">Randomize {expLabel} {expPopElmntLabel} colors?</label>
    <input id="randomizeExpColorsCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.EXP].enableRandColor} on:input={handleUpdateRemotePreferences}>
</div>

{#if !$gameSettings.popElmntConfig[popElmntTypes.EXP].enableRandColor}
    <div class="checkbox-flex">
        <label for="expColorRangeCheckbox">Enable {expLabel} {expPopElmntLabel} range color?</label>
        <input id="expColorRangeCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.EXP].enableRangeColor} on:input={handleUpdateRemotePreferences}>
    </div>

    {#if !$gameSettings.popElmntConfig[popElmntTypes.EXP].enableRangeColor}
        <div class="color-flex">
            <label for="expPopElmntColorInput">{expLabelUp} {expPopElmntLabel} color:</label>
            <input id="expPopElmntColorInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].color} on:input={handleUpdateRemotePreferences}>
        </div>
    {:else}
        <div class="pop-elmnt-range-color-container">
            <div class="color-flex">
                <label for="expColor1RangeInput">{expLabelUp} color 1:</label>
                <input id="expColor1RangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].rangeColor1} on:input={handleColorChange} />
            </div>

            <div class="color-flex">
                <label for="expColor2RangeInput">{expLabelUp} color 2:</label>
                <input id="expColor2RangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].rangeColor2} on:input={handleColorChange} />
            </div>

            <div class="range-input">
                <label for="expDefinitionInput">{expLabelUp} definition:</label>
                <p>{$gameSettings.popElmntConfig[popElmntTypes.EXP].colorRangeDef}</p>
            </div>
            <input id="expDefinitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].colorRangeDef} on:input={handleColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings.popElmntConfig[popElmntTypes.EXP].interpColors as color (color)}
                    <div class="color-square" style="background-color: {color}"></div>
                {/each}
            </div>
        </div>
    {/if}
{/if}

<div class="checkbox-flex">
    <label for="enableExpPopElmntInnerFigContour">Enable {expLabel} {expPopElmntLabel} inner figure contour:</label>
    <input id="enableExpPopElmntInnerFigContour" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.EXP].enableInnerFigContour} on:input={handleUpdateRemotePreferences}>
</div>

<label for="expInnerFigSelect">{expLabelUp} {expPopElmntLabel} inner figure type:</label>
<select id="expInnerFigSelect" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigType} on:input={handleUpdateRemotePreferences}>
    {#each Object.values(popElmntInnerFigs) as innerFigOption}
        <option value={innerFigOption}>
            {capitalizeFirstLetter(innerFigOption)}
        </option>
    {/each}
</select>

<div class="checkbox-flex">
    <label for="colorRangeExpInnerFigCheckbox">Enable {expLabel} inner figure range color?</label>
    <input id="colorRangeExpInnerFigCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntTypes.EXP].enableInnerFigRangeColor} on:input={handleUpdateRemotePreferences}>
</div>
{#if $gameSettings.popElmntConfig[popElmntTypes.EXP].enableInnerFigRangeColor}
    <div class="inner-fig-range-color-container">
        <div class="color-flex">
            <label for="color1ExpInnerFigRangeInput">{expLabelUp} inner figure color 1:</label>
            <input id="color1ExpInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigRangeColor1} on:input={handleExpInnerFigColorChange}>
        </div>
        <div class="color-flex">
            <label for="color2ExpInnerFigRangeInput">{expLabelUp} inner figure color 2:</label>
            <input id="color2ExpInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigRangeColor2} on:input={handleExpInnerFigColorChange}>
        </div>
        <div class="range-input">
            <label for="definitionExpInnerFigColorInput">{expLabelUp} inner figure definition:</label>
            <p>{$gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigColorRangeDef}</p>
        </div>
        <input id="definitionExpInnerFigColorInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigColorRangeDef} on:input={handleExpInnerFigColorChange}>
        <br>
        <div class="color-box">
            {#each $gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigInterpColors as color (color)}
                <div class="color-square" style="background-color: {color}"></div>
            {/each}
        </div>
    </div>
{:else}
    <div class="color-flex">
        <label for="expPopElmntInnerFigColorInput">{expLabelUp} {expPopElmntLabel} inner figure color:</label>
        <input id="expPopElmntInnerFigColorInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntTypes.EXP].innerFigColor} on:input={handleUpdateRemotePreferences}>
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