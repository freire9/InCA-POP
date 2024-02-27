<script>
    import { 
        balloonSizeOptions, 
        subjectName,
        balloonSpeed,
        balloonSpeedOptions,
        balloonSize,
        availableModes,
        maxBalloonsQuantity,
        balloonRandomColor,
        balloonColor,
        gameBackgroundColor,
        balloonLetterColor,
    } from '../../stores.js';
</script>

<nav>
	<a href="/">Home</a>
</nav>

<h1>Settings</h1>
<p>This is the settings page.</p>
<div class="settings-form flex-column">
    <label>
        Subject name:
        <input bind:value={$subjectName}/>
    </label>
    <label>
        Max balloons quantity on screen:
        <input type="number" min="1" bind:value={$maxBalloonsQuantity}/>
    </label>
    <label>
        Balloon Speed:
        <select bind:value={$balloonSpeed}>
            {#each Object.keys(balloonSpeedOptions) as speedOptionKey}
                <option value={balloonSpeedOptions[speedOptionKey]}>
                    {speedOptionKey.charAt(0).toUpperCase() + speedOptionKey.slice(1).toLowerCase()}
                </option>
            {/each}
        </select>
    </label>
    <label>
        Balloon size:
        <select bind:value={$balloonSize}>
            {#each Object.keys(balloonSizeOptions) as sizeOptionKey}
                <option value={balloonSizeOptions[sizeOptionKey]}>
                    {sizeOptionKey.charAt(0).toUpperCase() + sizeOptionKey.slice(1).toLowerCase()}
                </option>
            {/each}
        </select>
    </label>
    <label>
        Randomize balloons colors?
        <input type="checkbox" bind:checked={$balloonRandomColor}>
    </label>
    {#if !$balloonRandomColor}
        <label>
            Balloon color:
            <input type="color" bind:value={$balloonColor}>
        </label>
    {/if}
    <label>
        Game background color:
        <input type="color" bind:value={$gameBackgroundColor}>
    </label>
    <label>
        Balloon letter color:
        <input type="color" bind:value={$balloonLetterColor}>
    </label>
    <div class="flex-column">
        Game Modes (trajectory of the balloon) availables in main menu:
        {#each Object.keys($availableModes) as mode}
            <label class="flex-label">
                {$availableModes[mode].label}:
                <input type="checkbox" bind:checked={$availableModes[mode].enabled}>
            </label>
        {/each}
    </div>
</div>

<style>
    .flex-column{
        display: flex;
        flex-direction: column;
        margin-top: 25px;
    }
    .flex-label{
        margin-left: 35px;
    }
    label{
        margin-top: 25px;
    }
</style>
