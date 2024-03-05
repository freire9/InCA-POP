<script>
    import { gameDirection, availableModes, mainMenuRandomColors } from "../stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { TrainerButton, Fa } from 'inca-utils';
    import { faGear, faExpand, faInfo, faLeftLong, faRightLong, faUpLong, faDownLong } from '@fortawesome/free-solid-svg-icons';
    import { getRandomColor } from "$lib/utils";
    import StaticBalloon from "../components/StaticBalloon.svelte";

    let fullscreen;
    onMount(async () => {
        ({fullscreen} = await import('inca-utils/api'));
    })

    function handleClick(event){
        startGame(event.detail);
    }

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
    @media (max-width: 600px) {
        header{
            font-size: 10px;
        }
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        header{
            font-size: 15px;
        }
    }
    @media (min-width: 1024px){
        header{
            font-size: 20px;
        }
    }
    main{
        height: 100vh;
        overflow: hidden;
    }
    header{
        display: flex;
        width: 100%;
        padding: 0.5rem;
        height: 30%;
        align-items: center;
    }
    nav{
        display: flex;
        gap: 10px;
    }
    .game-modes {
        display: flex;
        align-items: center;
        height: 70%;
        padding: 0.5rem;
        justify-content: space-evenly;
    }
    h1 {
        flex-grow: 1;
        text-align: center;
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
                <StaticBalloon 
                    on:modeClicked={handleClick}
                    mode={mode}
                    icon={icons[$availableModes[mode].icon]} --bg-pseudo={$mainMenuRandomColors ? getRandomColor() : $availableModes[mode].color} 
                />
            {/if}
        {/each}
    </div>
</main>
