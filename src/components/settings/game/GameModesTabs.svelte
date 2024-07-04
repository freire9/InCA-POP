<script>
	import { USE_FIREBASE } from "$lib/firebaseConfig";
    import { syncPreferencesFromFirestore, updateRemotePreferences } from "$lib/firebaseFunctions";
	import { updateLocalPreferences } from "$lib/localPreferences";
	import { capitalizeFirstLetter } from "$lib/utils";
	import { Fa } from "inca-utils";
	import { availableGameModes, isLoggedIn, loadPreferencesFromRemote, savePreferencesToRemote, syncGameSettingsFromRemote, syncGameSettingsToRemote, user, useRemoteDb } from "../../../stores";
    import Game from "./Game.svelte";
    import { faCloudDownload, faCloudUpload } from '@fortawesome/free-solid-svg-icons';
    import lodash from 'lodash';

    const { debounce } = lodash;

    let activeTabValue = 1;
    let loadingSaveRemotePreferences = false;
    let loadingLoadRemotePreferences = false;

    const handleClick = tabValue => () => (activeTabValue = tabValue);
    
    let gameModeTabs;
    // List of tab game modes, values and assigned components
    $: gameModeTabs = Object.keys(availableGameModes).map((mode, index) => ({
        label: capitalizeFirstLetter(mode),
        value: index + 1,
        component: Game,
        mode: mode
    }));
    
    async function saveRemotePreferences(){
        loadingSaveRemotePreferences = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        $savePreferencesToRemote = true; // Flag to save the game settings to remote
        $syncGameSettingsToRemote = true; // Flag to sync the game settings to remote
        updateRemotePreferences();
        $savePreferencesToRemote = false; // Flag to save the game settings to remote
        $syncGameSettingsToRemote = false; // Flag to sync the game settings to remote
        loadingSaveRemotePreferences = false;
        alert('Game modes preferences saved to remote database')
    }
    async function loadRemotePreferences(){
        loadingLoadRemotePreferences = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        $syncGameSettingsFromRemote = true; // Flag to sync the game settings from remote
        await syncPreferencesFromFirestore();
        updateLocalPreferences();
        $syncGameSettingsFromRemote = false; // Flag to sync the game settings from remote
        loadingLoadRemotePreferences = false;
        alert('Game modes preferences loaded from remote database')

    }

    const handleClickLoadRemotePreferences = debounce(loadRemotePreferences, 1500);
    const handleClickSaveRemotePreferences = debounce(saveRemotePreferences, 1500);
</script>

<div class='game-modes-title-wrapper'>
    <h2>Game modes</h2>
    {#if USE_FIREBASE && $isLoggedIn && $user && $useRemoteDb}
        <div class='remote-preferences-btn-wrapper'>
            <button class="save-remote-preferences-btn" on:click={handleClickSaveRemotePreferences}>
                {#if loadingSaveRemotePreferences}
                    <span class="loading"></span> Saving preferences to remote...
                {:else}
                    <Fa icon={faCloudUpload} />
                    Save preferences to remote
                {/if}
            </button>
            <button class="load-remote-preferences-btn" on:click={handleClickLoadRemotePreferences}>
                {#if loadingLoadRemotePreferences}
                    <span class="loading"></span> Loading preferences from remote...
                {:else}
                    <Fa icon={faCloudDownload} />
                    Load preferences from remote
                {/if}
            </button>
        </div>
    {/if}
</div>
<div>
    <ul>
        {#each gameModeTabs as tab}
            <li class={activeTabValue === tab.value ? 'active' : ''}>
                <button on:click={handleClick(tab.value)}>{tab.label}</button>
            </li>
        {/each}
    </ul>
    {#each gameModeTabs as tab}
        {#if activeTabValue == tab.value}
            <div class="box">
                <svelte:component this={tab.component} mode={tab.mode}/>
            </div>
        {/if}
    {/each}
</div>

<style>
    .box {
        margin-bottom: 10px;
        padding: 40px;
        border: 1px solid #dee2e6;
        border-radius: 0 0 .5rem .5rem;
        border-top: 0;
    }
    ul {
        display: flex;
        flex-wrap: wrap;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        border-bottom: 1px solid #dee2e6;
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 2;
        height: 65px;
    }
    li {
        margin-bottom: -1px;
        text-align: center;
        opacity: 0.3;
    }

    button {
        border: 1px solid transparent;
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
        display: block;
        padding: 0.5rem 2rem;
        cursor: pointer;
        height: 100%;
    }

    button:hover {
        border-color: #e9ecef #e9ecef #dee2e6;
    }
    li.active {
        opacity: 1;
    }

    li.active > button {
        /* color: #495057; */
        background-color: #fff;
        border-color: #dee2e6 #dee2e6 #fff;
        font-weight: bold;
    }
    .remote-preferences-btn-wrapper{
        display: flex;
        gap: 10px;
    }
    .game-modes-title-wrapper{
        display: flex;
        gap: 80px;
        align-items: center;
    }
    @media (max-width: 600px) {
        ul{
            flex-wrap: unset;
        }
        li{
            font-size: xx-small;
        }
        button{
            padding: 0.25rem 0.7rem;
        }
        .game-modes-title-wrapper{
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
        }
        .remote-preferences-btn-wrapper{
            margin-bottom: 30px;
        }
        button.save-remote-preferences-btn,
        button.load-remote-preferences-btn{
            width: 220px;
        }
        .remote-preferences-btn-wrapper{
            flex-direction: column;
            gap: 10px;
        }
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        ul{
            flex-wrap: unset;
        }
        button.save-remote-preferences-btn,
        button.load-remote-preferences-btn{
            width: 230px;
        }
    }
    
    @media (min-width: 1024px){
        button.save-remote-preferences-btn,
        button.load-remote-preferences-btn{
            width: 300px;
        }
    }
    button.save-remote-preferences-btn,
    button.load-remote-preferences-btn{
        background-color: beige;
        border-radius: 10px;
        padding: 10px;
        text-align: center;
    }
    button.save-remote-preferences-btn:hover,
    button.load-remote-preferences-btn:hover{
        background-color: #e6e6e6;
    }
    button.save-remote-preferences-btn:focus,
    button.load-remote-preferences-btn:focus{
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }
    .loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #000;
        animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>