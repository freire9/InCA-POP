<script>
	import {subjectName} from '../../stores.js';
    import {bubbleSpeed} from '../../stores.js';
    import {bubbleSize} from '../../stores.js';
    import {gameModes} from '../../stores.js';
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
        Bubble Speed:
        <select bind:value={$bubbleSpeed}>
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
        </select>
    </label>
    <label>
        Bubble size:
        <select bind:value={$bubbleSize}>
            <option value="small">Small</option>
            <option value="normal">Normal</option>
            <option value="big">Big</option>
        </select>
    </label>
    <div class="flex-column">
        Game Modes (trajectory of the bubbles):
        <label class="flex-label">
            Left to right:
            <input type="checkbox" bind:checked={$gameModes.leftToRight}>
        </label>
        <label class="flex-label">
            Right to left:
            <input type="checkbox" bind:checked={$gameModes.rightToLeft}>
        </label>
        <label class="flex-label">
            Top to bottom:
            <input type="checkbox" bind:checked={$gameModes.topToBottom}>
        </label>
        <label class="flex-label">
            Bottom to top:
            <input type="checkbox" bind:checked={$gameModes.bottomToTop}>
        </label>
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
