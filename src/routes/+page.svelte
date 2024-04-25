<script>
    import { gameSettings, menuSettings, appSettings, user, gameDirection, isIphone, modifyingConfig, subjectName, popElmntDirections, localUserId, isLoggedIn } from "../stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { TrainerButton, Fa } from 'inca-utils';
    import { faGear, faExpand, faInfo, faLeftLong, faRightLong, faUpLong, faDownLong } from '@fortawesome/free-solid-svg-icons';
    import { getRandomHexColor, toogleFullscreen } from "$lib/utils";
    import StaticBalloon from "../components/StaticBalloon.svelte";
    import { addLog } from "$lib/logService";

    let fullscreen;

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
                $gameSettings.availableModes[mode].color = getRandomHexColor();
            });
        }
    }

    function setGeneralLogs(action){
        const now = new Date;
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

    function handleClick(event){
        const gameStartedLog = {...setGeneralLogs('Game started'), details: {gameDirection: event.detail, backgroundColor: $menuSettings.menuBackgroundColor, color: $gameSettings.availableModes[event.detail].color}};
        addLog(gameStartedLog);
        startGame(event.detail);
    }

    function handleBackgroundClick(event){
        const backgroundClickLog = {...setGeneralLogs('Menu background click'), details: {x: event.clientX, y: event.clientY, backgroundColor: $menuSettings.menuBackgroundColor}};
        addLog(backgroundClickLog);
    }

    function handleBackgroundKeyboard(event){
        return;
    }

    function startGame(mode){
        $gameDirection = mode;
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
            {#each Object.values(popElmntDirections) as mode}
                {#if $gameSettings.availableModes[mode].enabled}
                    <StaticBalloon 
                        on:modeClicked={handleClick}
                        mode={mode}
                        icon={icons[$gameSettings.availableModes[mode].icon]} --bg-pseudo={$gameSettings.availableModes[mode].color} 
                    />
                {/if}
            {/each}
        </div>
    </main>

</div>
