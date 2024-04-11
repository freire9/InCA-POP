<script>
    import { calculateInterpolatedColors, handleUpdateRemotePreferences, updateRemotePreferences } from "$lib/utils";
    import { gameSettings, isLoggedIn, user } from "../../../stores";
    import lodash from 'lodash';
    
    const { debounce } = lodash;
    const handleColorChange = debounce(setNormalInterpolatedColors, 500);

    function setNormalInterpolatedColors(){
        const colors = calculateInterpolatedColors($gameSettings.normalBalloonRangeColorDefinition, $gameSettings.normalBalloonRangeColor1, $gameSettings.normalBalloonRangeColor2);
        $gameSettings.normalBalloonInterpolatedColors = colors;
        if ($isLoggedIn && $user) updateRemotePreferences();
    }
</script>

<div class="checkbox-flex">
    <label for="randomizeColorsCheckbox">Randomize normal balloons colors?</label>
    <input id="randomizeColorsCheckbox" type="checkbox" bind:checked={$gameSettings.normalBalloonRandomColor} on:input={handleUpdateRemotePreferences}>
</div>

{#if !$gameSettings.normalBalloonRandomColor}
    <div class="checkbox-flex">
        <label for="colorRangeCheckbox">Enable normal range color?</label>
        <input id="colorRangeCheckbox" type="checkbox" bind:checked={$gameSettings.enableNormalBalloonRangeColor} on:input={handleUpdateRemotePreferences}>
    </div>

    {#if !$gameSettings.enableNormalBalloonRangeColor}
        <div class="color-flex">
            <label for="normalBalloonColorInput">Normal balloon color:</label>
            <input id="normalBalloonColorInput" class="color-input" type="color" bind:value={$gameSettings.normalBalloonColor} on:input={handleUpdateRemotePreferences}>
        </div>
    {:else}
        <div class="balloon-range-color-container">
            <div class="color-flex">
                <label for="color1RangeInput">Normal color 1:</label>
                <input id="color1RangeInput" class="color-input" type="color" bind:value={$gameSettings.normalBalloonRangeColor1} on:input={handleColorChange} />
            </div>

            <div class="color-flex">
                <label for="color2RangeInput">Normal color 2:</label>
                <input id="color2RangeInput" class="color-input" type="color" bind:value={$gameSettings.normalBalloonRangeColor2} on:input={handleColorChange} />
            </div>

            <div class="range-input">
                <label for="definitionInput">Normal Definition:</label>
                <p>{$gameSettings.normalBalloonRangeColorDefinition}</p>
            </div>
            <input id="definitionInput" type="range" min="1" max="100" step="1" bind:value={$gameSettings.normalBalloonRangeColorDefinition} on:input={handleColorChange}>
            <br>
            <div class="color-box">
                {#each $gameSettings.normalBalloonInterpolatedColors as color (color)}
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
    .checkbox-flex,
    .color-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    label{
        margin-top: 25px;
    }
</style>