<script>
    import { gameDirection } from "../stores";
    import { availableModes } from "../stores";
    import { goto } from "$app/navigation";

    function startGame(mode){
        gameDirection.set(mode);
        goto('/game');
    }
</script>

<h1>InCA-POP!</h1>
<p>Welcome</p>

<nav>
	<a href="/about">About</a>
    <a href="/settings">Settings</a>
    {#each Object.keys($availableModes) as mode}
        {#if $availableModes[mode].enabled}
            <button on:click={() => startGame(mode)}>{$availableModes[mode].label}</button>
        {/if}
    {/each}
</nav>