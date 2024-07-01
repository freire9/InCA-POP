<script>
	import { syncPreferencesFromFirestore, updateRemotePreferences } from "$lib/firebaseFunctions";
	import { capitalizeFirstLetter } from "$lib/utils";
	import { availableGameModes, loadPreferencesFromRemote, savePreferencesToRemote, syncAppSettingsToRemote, syncGameSettingsFromRemote, syncGameSettingsToRemote, syncMenuSettingsFromRemote, syncMenuSettingsToRemote } from "../../../stores";
	import SliderInput from "../SliderInput.svelte";
    import Game from "./Game.svelte";
    import lodash from 'lodash';

    const { debounce } = lodash;

    let activeTabValue = 1;

    const handleClick = tabValue => () => (activeTabValue = tabValue);
    
    let gameModeTabs;
    // List of tab game modes, values and assigned components
    $: gameModeTabs = Object.keys(availableGameModes).map((mode, index) => ({
        label: capitalizeFirstLetter(mode),
        value: index + 1,
        component: Game,
        mode: mode
    }));
    
    function handleToggle(checked) {
        if (checked) toggleSaveRemotePreferences(true);
        else toggleSaveRemotePreferences(false);
    }
    function handleToggleLoad(checked) {
        if (checked) toggleLoadRemotePreferences(true);
        else toggleLoadRemotePreferences(false);
    }
    const toggleSaveRemotePreferences = (toggle) => {
        if(toggle){
            if($syncGameSettingsToRemote || $syncAppSettingsToRemote || $syncMenuSettingsToRemote){
                $savePreferencesToRemote = true;
                updateRemotePreferences();
            } else $savePreferencesToRemote = false;
            localStorage.setItem('savePreferencesToRemote', $savePreferencesToRemote.toString());
            localStorage.setItem('syncGameSettingsToRemote', $syncGameSettingsToRemote.toString());
        }
    }
    async function toggleLoadRemotePreferences(toggle) {
        if(toggle){
            if($syncGameSettingsFromRemote || $syncMenuSettingsFromRemote){
                $loadPreferencesFromRemote = true;
                await syncPreferencesFromFirestore();
            } else $loadPreferencesFromRemote = false;
            localStorage.setItem('loadPreferencesFromRemote', $loadPreferencesFromRemote.toString());
            localStorage.setItem('syncGameSettingsFromRemote', $syncGameSettingsFromRemote.toString());
        }
    }
    const handleToggleSaveRemotePreferences = debounce((toggle) => handleToggle(toggle), 1500);
    const handleToggleLoadRemotePreferences = debounce((toggle) => handleToggleLoad(toggle), 1500);
</script>

<div class='game-modes-title-wrapper'>
    <h2>Game modes</h2>
    <div class='remote-preferences-btn-wrapper'>
        <SliderInput 
            bind:value={$syncGameSettingsToRemote}
            label={"Save preferences remotely"}
            on:change={handleToggleSaveRemotePreferences}
        />
        <SliderInput
            bind:value={$syncGameSettingsFromRemote}
            label={"Load preferences remotely"}
            on:change={handleToggleLoadRemotePreferences}
        />
    </div>
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
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        ul{
            flex-wrap: unset;
        }
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
</style>