<script>
    import { calculateInterpolatedColors, handleUpdateRemotePreferences, updateRemotePreferences } from "$lib/utils";
    import { gameSettings, innerFigureOptions, isLoggedIn, user } from "../../../stores";
    import lodash from 'lodash';
    
    const { debounce } = lodash;
    const handleColorChange = debounce(setCtrlInterpolatedColors, 500);
    const handleCtrlInnerFigColorChange = debounce(setCtrlInnerFigInterpolatedColors, 500);
    
    function setCtrlInnerFigInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.ctrlInnerFigColorDefinition, $gameSettings.ctrlInnerFigColorRange1, $gameSettings.ctrlInnerFigColorRange2);
        $gameSettings.ctrlInnerFigInterpolatedColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }
    
    function setCtrlInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.ctrlBalloonRangeColorDefinition, $gameSettings.ctrlBalloonRangeColor1, $gameSettings.ctrlBalloonRangeColor2);
        $gameSettings.ctrlBalloonInterpolatedColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }
</script>

<div class="range-input">
    <label for="ctrlBalloonsPropInput">Proportion of control balloons:</label>
    <p>{$gameSettings.ctrlBalloonsProp}% ({Math.floor($gameSettings.ctrlBalloonsProp/100 * $gameSettings.maxBalloonsQuantity)}/{$gameSettings.maxBalloonsQuantity}) (Floor rounded)</p>
</div>
<input id="ctrlBalloonsPropInput" min="0" max="{100 - $gameSettings.expBalloonsProp}" step="1" type="range" bind:value={$gameSettings.ctrlBalloonsProp} on:input={handleUpdateRemotePreferences}>

<div class="checkbox-flex">
    <label for="randomizeCtrlColorsCheckbox">Randomize control balloons colors?</label>
    <input id="randomizeCtrlColorsCheckbox" type="checkbox" bind:checked={$gameSettings.ctrlBalloonRandomColor} on:input={handleUpdateRemotePreferences}>
</div>

{#if !$gameSettings.ctrlBalloonRandomColor}
    <div class="checkbox-flex">
        <label for="ctrlColorRangeCheckbox">Enable control range color?</label>
        <input id="ctrlColorRangeCheckbox" type="checkbox" bind:checked={$gameSettings.enableCtrlBalloonRangeColor} on:input={handleUpdateRemotePreferences}>
    </div>

    {#if !$gameSettings.enableCtrlBalloonRangeColor}
        <div class="color-flex">
            <label for="ctrlBalloonColorInput">Control balloon color:</label>
            <input id="ctrlBalloonColorInput" class="color-input" type="color" bind:value={$gameSettings.ctrlBalloonColor} on:input={handleUpdateRemotePreferences}>
        </div>
    {:else}
        <div class="balloon-range-color-container">
            <div class="color-flex">
                <label for="ctrlColor1RangeInput">Control color 1:</label>
                <input id="ctrlColor1RangeInput" class="color-input" type="color" bind:value={$gameSettings.ctrlBalloonRangeColor1} on:input={handleColorChange} />
            </div>

            <div class="color-flex">
                <label for="ctrlColor2RangeInput">Control color 2:</label>
                <input id="ctrlColor2RangeInput" class="color-input" type="color" bind:value={$gameSettings.ctrlBalloonRangeColor2} on:input={handleColorChange} />
            </div>

            <div class="range-input">
                <label for="ctrlDefinitionInput">Control definition:</label>
                <p>{$gameSettings.ctrlBalloonRangeColorDefinition}</p>
            </div>
            <input id="ctrlDefinitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.ctrlBalloonRangeColorDefinition} on:input={handleColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings.ctrlBalloonInterpolatedColors as color (color)}
                    <div class="color-square" style="background-color: {color}"></div>
                {/each}
            </div>
        </div>
    {/if}
{/if}

<div class="checkbox-flex">
    <label for="enableCtrlBalloonInnerFigContour">Enable control balloon inner figure contour:</label>
    <input id="enableCtrlBalloonInnerFigContour" type="checkbox" bind:checked={$gameSettings.enableCtrlInnerFigContour} on:input={handleUpdateRemotePreferences}>
</div>

<label for="ctrlInnerFigSelect">Control balloon inner figure type:</label>
<select id="ctrlInnerFigSelect" bind:value={$gameSettings.ctrlInnerFigureType} on:input={handleUpdateRemotePreferences}>
    {#each Object.keys(innerFigureOptions) as innerFigOptionKey}
        <option value={innerFigOptionKey}>
            {innerFigOptionKey.charAt(0).toUpperCase() + innerFigOptionKey.slice(1).toLowerCase()}
        </option>
    {/each}
</select>

<div class="checkbox-flex">
    <label for="colorRangeCtrlInnerFigCheckbox">Enable control inner figure range color?</label>
    <input id="colorRangeCtrlInnerFigCheckbox" type="checkbox" bind:checked={$gameSettings.enableCtrlInnerFigRangeColor} on:input={handleUpdateRemotePreferences}>
</div>
{#if $gameSettings.enableCtrlInnerFigRangeColor}
    <div class="inner-fig-range-color-container">
        <div class="color-flex">
            <label for="color1CtrlInnerFigRangeInput">Control inner figure color 1:</label>
            <input id="color1CtrlInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings.ctrlInnerFigColorRange1} on:input={handleCtrlInnerFigColorChange}>
        </div>
        <div class="color-flex">
            <label for="color2CtrlInnerFigRangeInput">Control inner figure color 2:</label>
            <input id="color2CtrlInnerFigRangeInput" class="color-input" type="color" bind:value={$gameSettings.ctrlInnerFigColorRange2} on:input={handleCtrlInnerFigColorChange}>
        </div>
        <div class="range-input">
            <label for="definitionCtrlInnerFigColorInput">Control inner figure definition:</label>
            <p>{$gameSettings.ctrlInnerFigColorDefinition}</p>
        </div>
        <input id="definitionCtrlInnerFigColorInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.ctrlInnerFigColorDefinition} on:input={handleCtrlInnerFigColorChange}>
        <br>
        <div class="color-box">
            {#each $gameSettings.ctrlInnerFigInterpolatedColors as color (color)}
                <div class="color-square" style="background-color: {color}"></div>
            {/each}
        </div>
    </div>
{:else}
    <div class="color-flex">
        <label for="ctrlBalloonInnerFigColorInput">Control balloon inner figure color:</label>
        <input id="ctrlBalloonInnerFigColorInput" class="color-input" type="color" bind:value={$gameSettings.ctrlBalloonInnerFigColor} on:input={handleUpdateRemotePreferences}>
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