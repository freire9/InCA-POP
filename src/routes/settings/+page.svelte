<script>
    import { gameSettings, appSettings, menuSettings, isFullScreen, menuSettingsDEFAULT, appSettingsDEFAULT, gameSettingsDEFAULT } from '../../stores.js';
    import { deepCopy } from '$lib/utils.js'
    import Profile from '../../components/settings/Profile.svelte';
    import UserNavBar from '../../components/UserNavBar.svelte';
    import Speeches from '../../components/settings/Speeches.svelte';
    import { updatePreferences } from '$lib/preferences.js';
    import GameModesTabs from '../../components/settings/game/GameModesTabs.svelte';
	import MainMenu from '../../components/settings/MainMenu.svelte';
	import Logs from '../../components/settings/Logs.svelte';

    function handleRestoreDefaults(){
        gameSettings.set(deepCopy(gameSettingsDEFAULT));
        appSettings.set(deepCopy(appSettingsDEFAULT));
        menuSettings.set(deepCopy(menuSettingsDEFAULT));
        console.log('Default settings restored')
        updatePreferences();
    }

    function handleRestoreDefaultsWarning(){
        if(confirm('Are you sure you want to restore default settings? (if logged in, changes will be saved to the database!)')){
            handleRestoreDefaults();
        }
    }
</script>

<div class="settings not-selectable {$isFullScreen ? 'fullscreen' : ''}">

    <UserNavBar />
    <main>
        <h1>Settings</h1>
        <div class="settings-form flex-column">
            <Profile />
            <Logs />
            <GameModesTabs />
            <MainMenu />
            <Speeches />
            <button class="restore-btn" on:click={handleRestoreDefaultsWarning}><strong>Restore default settings</strong></button>
        </div>
    </main>
</div>

<style>
    .fullscreen{
        height: 100vh;
        overflow: auto;
    }
    .flex-column{
        display: flex;
        flex-direction: column;
    }
    main{
        padding: 2rem;
    }
    button.restore-btn{
        background-color: beige;
        border-radius: 10px;
        padding: 10px;
        text-align: center;
    }
    button.restore-btn{
        margin-top: 70px;
    }
    button.restore-btn:hover{
        background-color: #e6e6e6;
    }
    button.restore-btn:focus{
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }
</style>
