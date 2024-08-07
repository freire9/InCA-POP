<script>
    import { menuSettings, appSettings, user, isIphone, modifyingConfig, subjectName, localUserId, isLoggedIn, gameId, availableGameModes, gameSettings, currentGameMode, speechGameModeStarted, speechSettings, speechMenuBackgroundTouched } from "../stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { TrainerButton, Fa } from 'inca-utils';
    import { faGear, faExpand, faInfo, faLeftLong, faRightLong, faUpLong, faDownLong } from '@fortawesome/free-solid-svg-icons';
    import { deepCopy, getRandomColorFromPalette, toogleFullscreen } from "$lib/utils";
    import StaticBalloon from "../components/StaticBalloon.svelte";
    import { addLog } from "$lib/logService";

    let fullscreen;
    let orderedModes = Object.keys($menuSettings.availableGameModes).sort((a, b) => availableGameModes[a].position - availableGameModes[b].position);

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
            Object.keys(availableGameModes).forEach(function(mode) {
                $menuSettings.availableGameModes[mode].color = getRandomColorFromPalette();
            });
        }
        if($menuSettings.enableModesRandomPos){
            const modeKeys = Object.keys($menuSettings.availableGameModes);
            const positions = Array.from({ length: modeKeys.length }, (_, index) => index);
            // Shuffle the positions array randomly
            for (let i = positions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [positions[i], positions[j]] = [positions[j], positions[i]];
            }
            modeKeys.forEach((mode, index) => {
                $menuSettings.availableGameModes[mode].position = positions[index];
            });
        }
        orderedModes = Object.keys($menuSettings.availableGameModes).sort((a, b) => $menuSettings.availableGameModes[a].position - $menuSettings.availableGameModes[b].position);
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
        if($appSettings.enableCustomSpeeches){
            $speechSettings.speechGameModeStarted = $speechSettings.speechGameModeStarted.replace("{gameMode}", "{" + event.detail.toString() + "}");
            $speechGameModeStarted.text = $speechSettings.speechGameModeStarted;
            playCustomGameModeStarted();
            $speechSettings.speechGameModeStarted = $speechSettings.speechGameModeStarted.replace("{" + event.detail.toString() + "}", "{gameMode}");
            $speechGameModeStarted.text = $speechSettings.speechGameModeStarted;
        }
        startGame(event.detail);
        const gameStartedLog = {
            ...setGeneralLogs('Game started'), 
            details: deepCopy({gameMode: event.detail, menuBackgroundColor: $menuSettings.menuBackgroundColor, color: $menuSettings.availableGameModes[event.detail].color, gameId: $gameId, position: $menuSettings.availableGameModes[event.detail].position})
        };
        addLog(gameStartedLog);
    }

    async function handleBackgroundClick(event){
        if($appSettings.enableCustomSpeeches) playCustomMenuBackgroundTouched();
        const backgroundClickLog = {...setGeneralLogs('Menu background click'), details: deepCopy({x: event.clientX, y: event.clientY, menuBackgroundColor: $menuSettings.menuBackgroundColor})};
        addLog(backgroundClickLog);
    }

    async function handleBackgroundKeyboard(event){
        return;
    }

    function startGame(mode){
        $currentGameMode = mode;
        $gameId = crypto.randomUUID();
        goto('/game');
    }

    const icons = {
        'faLeftLong': faLeftLong,
        'faRightLong': faRightLong,
        'faUpLong': faUpLong,
        'faDownLong': faDownLong,
    };

    function playCustomGameModeStarted(){
        const text = new SpeechSynthesisUtterance($speechSettings.speechGameModeStarted);
        text.voice = $speechSettings.voice;
        text.volume = $speechSettings.volume;
        text.pitch = $speechSettings.pitch;
        text.rate = $speechSettings.rate;
        window.speechSynthesis.speak(text);
    }
    function playCustomMenuBackgroundTouched(){
        window.speechSynthesis.speak($speechMenuBackgroundTouched);
    }
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
            <h1>InCA-Pop</h1>
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
                {#if $menuSettings.availableGameModes[mode].enabled}
                    <StaticBalloon 
                        on:modeClicked={handleClick}
                        mode={mode}
                        icon={icons[$menuSettings.availableGameModes[mode].icon]} --bg-pseudo={$menuSettings.availableGameModes[mode].color} 
                    />
                {/if}
            {/each}
        </div>
    </main>

</div>
