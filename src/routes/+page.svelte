<script>
    import { menuSettings, appSettings, user, gameDirection, isIphone, modifyingConfig, subjectName, popElmntDirections, localUserId, isLoggedIn, gameId, availableModes } from "../stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { TrainerButton, Fa } from 'inca-utils';
    import { faGear, faExpand, faInfo, faLeftLong, faRightLong, faUpLong, faDownLong } from '@fortawesome/free-solid-svg-icons';
    import { getRandomHexColor, toogleFullscreen } from "$lib/utils";
    import StaticBalloon from "../components/StaticBalloon.svelte";
    import { addLog } from "$lib/logService";

    let fullscreen;
    let orderedModes = Object.keys($menuSettings.availableModes).sort((a, b) => availableModes[a].position - availableModes[b].position);

    onMount(async () => {
        ({fullscreen} = await import('inca-utils/api'));
    })

    $:{
        if(!$modifyingConfig){
            handleAuthFinally();
        }
    }

    function handleAuthFinally(){
        if($menuSettings.mainMenuRandomColors){
            Object.values(popElmntDirections).forEach(function(mode) {
                $menuSettings.availableModes[mode].color = getRandomHexColor();
            });
        }
        if($menuSettings.enableModesRandomPos){
            const modeKeys = Object.keys($menuSettings.availableModes);
            const positions = Array.from({ length: modeKeys.length }, (_, index) => index);
            // Shuffle the positions array randomly
            for (let i = positions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [positions[i], positions[j]] = [positions[j], positions[i]];
            }
            modeKeys.forEach((mode, index) => {
                $menuSettings.availableModes[mode].position = positions[index];
            });
        }
        orderedModes = Object.keys($menuSettings.availableModes).sort((a, b) => $menuSettings.availableModes[a].position - $menuSettings.availableModes[b].position);
    }

    function setGeneralLogs(action){
        const now = new Date();
        const generalLogs = {
            timestamp: now,
            user: ($user && $isLoggedIn) ? $user.displayName : "Anonymous",
            userId: ($user && $isLoggedIn) ? $user.uid : $localUserId,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            teacher: $appSettings.instructorName,
            action: action.toString(),
            subject: $subjectName,
        }
        return generalLogs;
    }

    async function handleClick(event){
        startGame(event.detail);
        const gameStartedLog = {
            ...setGeneralLogs('Game started'), 
            details: {gameMode: event.detail, menuBackgroundColor: $menuSettings.menuBackgroundColor, color: $menuSettings.availableModes[event.detail].color, gameId: $gameId, position: $menuSettings.availableModes[event.detail].position}};
        addLog(gameStartedLog);
    }

    async function handleBackgroundClick(event){
        const backgroundClickLog = {...setGeneralLogs('Menu background click'), details: {x: event.clientX, y: event.clientY, menuBackgroundColor: $menuSettings.menuBackgroundColor}};
        addLog(backgroundClickLog);
    }

    async function handleBackgroundKeyboard(event){
        return;
    }

    function startGame(mode){
        $gameDirection = mode;
        $gameId = crypto.randomUUID();
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
<svelte:head>
    <style>
        body {
            overflow: hidden;
        }
    </style>
</svelte:head>

<div on:click={handleBackgroundClick} role="menu" aria-label="Main menu" tabindex="0" on:keydown={handleBackgroundKeyboard} >
    <main class="not-selectable" style:background-color={$menuSettings.menuBackgroundColor}>
        <header>
            <h1>InCA-POP!</h1>
            <nav>
                <TrainerButton label="Settings" on:click={() => goto('/settings')}>
                    <Fa icon={faGear} />
                </TrainerButton>
                <TrainerButton label="About" on:click={() => goto('/about')}>
                    <Fa icon={faInfo} />
                </TrainerButton>
                {#if !$isIphone}
                    <TrainerButton on:click={() => {toogleFullscreen(fullscreen)}} label="Fullscreen">
                        <Fa icon={faExpand} />
                    </TrainerButton>
                {/if}
            </nav>
        </header>
        <div class="game-modes">
            {#each orderedModes as mode}
                {#if $menuSettings.availableModes[mode].enabled}
                    <StaticBalloon 
                        on:modeClicked={handleClick}
                        mode={mode}
                        icon={icons[$menuSettings.availableModes[mode].icon]} --bg-pseudo={$menuSettings.availableModes[mode].color} 
                    />
                {/if}
            {/each}
        </div>
    </main>

</div>
