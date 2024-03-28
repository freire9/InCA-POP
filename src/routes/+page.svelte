<script>
    import { gameSettings, menuSettings, appSettings, isLoggedIn, user, gameDirection, isIphone, modifyingConfig } from "../stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { TrainerButton, Fa } from 'inca-utils';
    import { faGear, faExpand, faInfo, faLeftLong, faRightLong, faUpLong, faDownLong } from '@fortawesome/free-solid-svg-icons';
    import { deepCopy, getRandomHexColor } from "$lib/utils";
    import StaticBalloon from "../components/StaticBalloon.svelte";
    import { addLog } from "$lib/logService";
    import packageJson from '../../package.json';

    const appVersion = packageJson.version;
    let fullscreen;
    const randomColors = {};

    onMount(async () => {
        ({fullscreen} = await import('inca-utils/api'));
    })

    onMount(() => {
        $modifyingConfig;
    });

    $:{
        if(!$modifyingConfig){
            handleAuthFinally();
        }
    }


    function handleAuthFinally(){
        console.log('evento recibido')
        if($menuSettings.mainMenuRandomColors){
            Object.keys($gameSettings.availableModes).forEach(function(mode) {
                const color = getRandomHexColor();
                randomColors[mode] = color;
                $gameSettings.availableModes[mode].color = color;
                console.log($gameSettings.availableModes[mode].color)
            });
            console.log('colores random seteados')
        }
    }

    function handleClick(event){
        addLog(
            'Game started', 
            {gameDirection: deepCopy(event.detail), 
                ...deepCopy($gameSettings), 
                ...deepCopy($menuSettings), 
                ...deepCopy($appSettings)
            },
            $isLoggedIn ? deepCopy($user.uid) : null
        );
        console.log("LOG GUARDADO ENTRAR MODO")
        console.log($gameSettings.availableModes[event.detail].color);
        console.log("OTROS COLORES:")
        Object.keys($gameSettings.availableModes).forEach(function(mode){
            console.log($gameSettings.availableModes[mode].color)
        })
        startGame(event.detail);
    }

    function handleBackgroundClick(event){
        addLog(
            'Menu background click', 
            {...deepCopy($gameSettings),
                ...deepCopy($menuSettings),
                ...deepCopy($appSettings)
            },
            $isLoggedIn ? deepCopy($user.uid) : null
        );
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
    .app-version{
        position: absolute;
        right: 0;
        bottom: 0;
        font-size: small;
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
            <p class="app-version">v{appVersion}</p>
            <nav>
                <TrainerButton label="Settings" on:click={() => goto('/settings')}>
                    <Fa icon={faGear} />
                </TrainerButton>
                <TrainerButton label="About" on:click={() => goto('/about')}>
                    <Fa icon={faInfo} />
                </TrainerButton>
                {#if !$isIphone}
                    <TrainerButton on:click={fullscreen} label="Fullscreen">
                        <Fa icon={faExpand} />
                    </TrainerButton>
                {/if}
            </nav>
        </header>
        <div class="game-modes">
            {#each Object.keys($gameSettings.availableModes) as mode}
                {#if $gameSettings.availableModes[mode].enabled}
                    <StaticBalloon 
                        on:modeClicked={handleClick}
                        mode={mode}
                        icon={icons[$gameSettings.availableModes[mode].icon]} --bg-pseudo={$menuSettings.mainMenuRandomColors ? randomColors[mode] : $gameSettings.availableModes[mode].color} 
                    />
                {/if}
            {/each}
        </div>
    </main>

</div>
