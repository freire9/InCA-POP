<script>
    import { calculateInterpolatedColors, handleUpdateRemotePreferences, updateRemotePreferences } from "$lib/utils";
    import { gameSettings, innerFigureOptions, isLoggedIn, popElmntType, user } from "../../../stores";
    import lodash from 'lodash';
    
    const { debounce } = lodash;
    const handleColorChange = debounce(setExpInterpolatedColors, 500);
    const handleExpInnerFigColorChange = debounce(setExpInnerFigInterpolatedColors, 500);
    
    function setExpInnerFigInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.popElmntConfig[popElmntType.EXP].innerFigColorRangeDef, $gameSettings.popElmntConfig[popElmntType.EXP].innerFigRangeColor1, $gameSettings.popElmntConfig[popElmntType.EXP].innerFigRangeColor2);
        $gameSettings.popElmntConfig[popElmntType.EXP].innerFigInterpColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }

    function setExpInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.popElmntConfig[popElmntType.EXP].colorRangeDef, $gameSettings.popElmntConfig[popElmntType.EXP].rangeColor1, $gameSettings.popElmntConfig[popElmntType.EXP].rangeColor2);
        $gameSettings.popElmntConfig[popElmntType.EXP].interpColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }
</script>

<div class="range-input">
    <label for="expPopElmntPropInput">Proportion of experimental balloons:</label>
    <p>{$gameSettings.popElmntConfig[popElmntType.EXP].proportion}% ({Math.floor($gameSettings.popElmntConfig[popElmntType.EXP].proportion/100 * $gameSettings.maxPopElmntQty)}/{$gameSettings.maxPopElmntQty}) (Floor rounded)</p>
</div>
<input id="expPopElmntPropInput" min="0" max="{100-$gameSettings.popElmntConfig[popElmntType.CTRL].proportion}" step="1" type="range" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].proportion} on:input={handleUpdateRemotePreferences}>

<div class="checkbox-flex">
    <label for="randomizeExpColorsCheckbox">Randomize experimental balloons colors?</label>
    <input id="randomizeExpColorsCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntType.EXP].enableRandColor} on:input={handleUpdateRemotePreferences}>
</div>

{#if !$gameSettings.popElmntConfig[popElmntType.EXP].enableRandColor}
    <div class="checkbox-flex">
        <label for="expColorRangeCheckbox">Enable experimental range color?</label>
        <input id="expColorRangeCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntType.EXP].enableRangeColor} on:input={handleUpdateRemotePreferences}>
    </div>

    {#if !$gameSettings.popElmntConfig[popElmntType.EXP].enableRangeColor}
        <div class="color-flex">
            <label for="expPopElmntColorInput">Experimental balloon color:</label>
            <input id="expPopElmntColorInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].color} on:input={handleUpdateRemotePreferences}>
        </div>
    {:else}
        <div class="balloon-range-color-container">
            <div class="color-flex">
                <label for="expColor1RangeInput">Experimental color 1:</label>
                <input id="expColor1RangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].rangeColor1} on:input={handleColorChange} />
            </div>

            <div class="color-flex">
                <label for="expColor2RangeInput">Experimental color 2:</label>
                <input id="expColor2RangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].rangeColor2} on:input={handleColorChange} />
            </div>

            <div class="range-input">
                <label for="expDefinitionInput">Experimental definition:</label>
                <p>{$gameSettings.popElmntConfig[popElmntType.EXP].colorRangeDef}</p>
            </div>
            <input id="expDefinitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].colorRangeDef} on:input={handleColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings.popElmntConfig[popElmntType.EXP].interpColors as color (color)}
                    <div class="color-square" style="background-color: {color}"></div>
                {/each}
            </div>
        </div>
    {/if}
{/if}

<div class="checkbox-flex">
    <label for="enableExpBalloonInnerFigContour">Enable experimental balloon inner figure contour:</label>
    <input id="enableExpBalloonInnerFigContour" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntType.EXP].enableInnerFigContour} on:input={handleUpdateRemotePreferences}>
</div>

<label for="expInnerFigSelect">Experimental balloon inner figure type:</label>
<select id="expInnerFigSelect" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].innerFigType} on:input={handleUpdateRemotePreferences}>
    {#each Object.keys(innerFigureOptions) as innerFigOptionKey}
        <option value={innerFigOptionKey}>
            {innerFigOptionKey.charAt(0).toUpperCase() + innerFigOptionKey.slice(1).toLowerCase()}
        </option>
    {/each}
</select>

<div class="checkbox-flex">
    <label for="colorRangeExpInnerFigCheckbox">Enable experimental inner figure range color?</label>
    <input id="colorRangeExpInnerFigCheckbox" type="checkbox" bind:checked={$gameSettings.popElmntConfig[popElmntType.EXP].enableInnerFigRangeColor} on:input={handleUpdateRemotePreferences}>
</div>
{#if $gameSettings.popElmntConfig[popElmntType.EXP].enableInnerFigRangeColor}
    <div class="inner-fig-range-color-container">
        <div class="color-flex">
            <label for="color1ExpInnerFigRangeInput">Experimental inner figure color 1:</label>
            <input id="color1ExpInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].innerFigRangeColor1} on:input={handleExpInnerFigColorChange}>
        </div>
        <div class="color-flex">
            <label for="color2ExpInnerFigRangeInput">Experimental inner figure color 2:</label>
            <input id="color2ExpInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].innerFigRangeColor2} on:input={handleExpInnerFigColorChange}>
        </div>
        <div class="range-input">
            <label for="definitionExpInnerFigColorInput">Experimental inner figure definition:</label>
            <p>{$gameSettings.popElmntConfig[popElmntType.EXP].innerFigColorRangeDef}</p>
        </div>
        <input id="definitionExpInnerFigColorInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].innerFigColorRangeDef} on:input={handleExpInnerFigColorChange}>
        <br>
        <div class="color-box">
            {#each $gameSettings.popElmntConfig[popElmntType.EXP].innerFigInterpColors as color (color)}
                <div class="color-square" style="background-color: {color}"></div>
            {/each}
        </div>
    </div>
{:else}
    <div class="color-flex">
        <label for="expPopElmntInnerFigColorInput">Experimental balloon inner figure color:</label>
        <input id="expPopElmntInnerFigColorInput" class="color-input" type="color" bind:value={$gameSettings.popElmntConfig[popElmntType.EXP].innerFigColor} on:input={handleUpdateRemotePreferences}>
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
    .balloon-range-color-container{
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