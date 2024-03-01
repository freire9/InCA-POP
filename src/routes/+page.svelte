<script>
    import { gameDirection, availableModes, mainMenuRandomColors } from "../stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { TrainerButton, Fa } from 'inca-utils';
    import { faGear, faExpand, faInfo, faLeftLong, faRightLong, faUpLong, faDownLong } from '@fortawesome/free-solid-svg-icons';
    import { getRandomColor } from "$lib/utils";

    let theme, fullscreen;
    onMount(async () => {
        ({fullscreen, theme} = await import('inca-utils/api'));
    })

    function startGame(mode){
        gameDirection.set(mode);
        goto('/game');
    }

    const icons = {
        'faLeftLong': faLeftLong,
        'faRightLong': faRightLong,
        'faUpLong': faUpLong,
        'faDownLong': faDownLong,
    };
</script>

<style>
    main{
        display: flex;
        flex-direction: column;
        height: 100vh;
        justify-content: center;
        align-items: center;
    }
    header{
        margin-bottom: 20px;
        display: flex;
        justify-content: space-evenly;
        width: 100%;
    }
    nav{
        display: flex;
        gap: 10px;
    }
    .game-modes {
        display: flex;
        align-items: center;
        gap: 50px;
  }
</style>

<main class="not-selectable">
    <header>
        <h1>InCA-POP!</h1>
        <nav>
            <TrainerButton on:click={fullscreen} label="Fullscreen">
                <Fa icon={faExpand} />
            </TrainerButton>
            <TrainerButton label="Settings" on:click={() => goto('/settings')}>
                <Fa icon={faGear} />
            </TrainerButton>
            <TrainerButton label="About" on:click={() => goto('/about')}>
                <Fa icon={faInfo} />
            </TrainerButton>
        </nav>
    </header>
    <div class="game-modes">
        {#each Object.keys($availableModes) as mode}
            {#if $availableModes[mode].enabled}
                <div class="static-balloon" on:click={() => startGame(mode)} style:--bg-balloon={$mainMenuRandomColors ? getRandomColor() : $availableModes[mode].color}>
                    <span class="balloon-span">
                        <Fa icon={icons[$availableModes[mode].icon]}/>
                    </span>
                    <div class="static-string"/>
                </div>
            {/if}
            
        {/each}
    </div>
</main>
