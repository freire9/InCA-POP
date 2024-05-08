<script>
    import { gameSettings, appSettings, menuSettings, isLoggedIn, user, isFullScreen, menuSettingsDEFAULT, appSettingsDEFAULT, gameSettingsDEFAULT, subjectName, popElmntDirections, localUserId, modifyingConfig, syncPreferencesFromRemote } from '../../stores.js';
    import { deepCopy, toCamelCase, capitalizeFirstLetter } from '$lib/utils.js'
    import { Fa } from 'inca-utils';
    import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
    import Profile from '../../components/settings/Profile.svelte';
    import UserNavBar from '../../components/UserNavBar.svelte';
    import Speeches from '../../components/settings/Speeches.svelte';
    import lodash from 'lodash';
    import { downloadLogs } from '$lib/logService.js';
    import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
    import { db, dbUsersCollectionName } from '$lib/firebaseConfig.js';
    import { updatePreferences } from '$lib/preferences.js';
    import GameModesTabs from '../../components/settings/game/GameModesTabs.svelte';
	import { updateRemotePreferences } from '$lib/firebaseFunctions.js';
	import { updateLocalPreferences } from '$lib/localPreferences.js';
    
    const { debounce } = lodash;
    let modesByPositions = {};
    let positionByModes = {};

    $:{
        if(!$modifyingConfig){
            handleAuthFinally();
        }
    }

    function handleRemoteJsonDownload (){
        if ($isLoggedIn && $user) downloadLogs('json', $user.uid);
        else downloadLogs('json', $localUserId);
    }
    function handleRemoteCsvDownload(){
        if ($isLoggedIn && $user) downloadLogs('csv', $user.uid);
        else downloadLogs('csv', $localUserId);
    }

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

    async function saveSubjectName(){
        localStorage.setItem('subjectName', $subjectName);
        console.log('Subject name saved to local storage')
        if($isLoggedIn && $user) {
            const userDocRef = doc(db, dbUsersCollectionName, $user.uid);
            const userDoc = await getDoc(userDocRef);
            if(!userDoc.data().learners || !userDoc.data().learners.includes($subjectName)){
                    await updateDoc(userDocRef, {
                        learners: arrayUnion($subjectName),
                    });
                }
        }
    }

    async function saveInstructorName(){
        if($isLoggedIn && $user) {
            const userDocRef = doc(db, dbUsersCollectionName, $user.uid);
            const userDoc = await getDoc(userDocRef);
            let forUpdateData = {
                incaPopPreferences: {
                    appSettings: {
                        instructorName: $appSettings.instructorName,
                    }
                }
            };
            if(!userDoc.data().teachers || !userDoc.data().teachers.includes($appSettings.instructorName)){
                forUpdateData.teachers = arrayUnion($appSettings.instructorName);
            }
            await updateDoc(userDocRef, forUpdateData);
        }
    }

    function handleAuthFinally(){
        modesByPositions = Object.fromEntries(Object.keys($menuSettings.availableModes).map(mode => [$menuSettings.availableModes[mode].position, mode]));
        positionByModes = Object.fromEntries(Object.keys($menuSettings.availableModes).map(mode => [mode, $menuSettings.availableModes[mode].position]));
    }

    function managePositionChange(newModeInPos){
        if($menuSettings.enableModesRandomPos || Object.keys(modesByPositions).length === 0 || Object.keys(positionByModes).length === 0) return;
        
        const newPosition = $menuSettings.availableModes[newModeInPos].position;
        const oldModeInPos = modesByPositions[newPosition];
        const oldPos = positionByModes[newModeInPos];

        // Update position of the mode that was in the new position
        $menuSettings.availableModes[oldModeInPos].position = oldPos;

        modesByPositions[newPosition] = newModeInPos;
        positionByModes[newModeInPos] = newPosition;
        modesByPositions[oldPos] = oldModeInPos;
        positionByModes[oldModeInPos] = oldPos;
        
        if($syncPreferencesFromRemote && $isLoggedIn && $user) updateRemotePreferences();
        else updateLocalPreferences();
    }

    const handlePositionChange = debounce((NewModeInPos) => managePositionChange(NewModeInPos), 1500);
    const handleSaveSubject = debounce(saveSubjectName, 1500);
    const handleSaveInstructor = debounce(saveInstructorName, 1500);
</script>

<div class="settings not-selectable {$isFullScreen ? 'fullscreen' : ''}">

    <UserNavBar />
    <main>
        <h1>Settings</h1>
        <div class="settings-form flex-column">
            
            <h2>Profile</h2>
            <Profile />
            
            <label for="subjectNameInput">Subject's name:</label>
            <input id="subjectNameInput" type='text' bind:value={$subjectName} on:input={handleSaveSubject}/>
            
            <label for="instructorNameInput">Instructor's name:</label>
            <input id="instructorNameInput" type="text" bind:value={$appSettings.instructorName} on:input={handleSaveInstructor}>
            
            <h2>Logs</h2>
            <div class="remote-logs-container">
                <button class="download-logs-btn" on:click={handleRemoteJsonDownload}>
                    <Fa icon={faFileArrowDown} />
                    Download remote database logs file (JSON)
                </button>
                <button class="download-logs-btn" on:click={handleRemoteCsvDownload}>
                    <Fa icon={faFileArrowDown} />
                    Download remote database logs file (CSV)
                </button>
            </div>

            <h2>Game modes</h2>
            <GameModesTabs />
    
            <h2>Main menu</h2>
            <p>Game modes to display (direction of pop elements):</p>
            <div class="flex-column">
                <div class="game-modes-container">
                    {#each Object.values(popElmntDirections) as mode}
                        <div class="checkbox-flex">
                            <label for={"gameMode" + toCamelCase(mode) + "Checkbox"}>{capitalizeFirstLetter(mode)}:</label>
                            <input id={"gameMode" + toCamelCase(mode) + "Checkbox"} type="checkbox" bind:checked={$menuSettings.availableModes[mode].enabled} on:input={updatePreferences}>
        
                            {#if !$menuSettings.mainMenuRandomColors}
                                <div class="color-flex">
                                    <label for={"gameMode" + mode + "ColorInput"}>Color:</label>
                                    <input id={"gameMode" + mode + "ColorInput"} class="color-input" type="color" bind:value={$menuSettings.availableModes[mode].color} on:input={updatePreferences}>
                                </div>
                            {/if}

                            {#if !$menuSettings.enableModesRandomPos}
                                <label for={"gameMode" + mode + "PositionSelect"}>Position:</label>
                                <select id={"gameMode" + mode + "PositionSelect"} bind:value={$menuSettings.availableModes[mode].position} on:input={() => handlePositionChange(mode)}>
                                    {#each Object.keys($menuSettings.availableModes) as position, index}
                                        <option value={index}>{index}</option>
                                    {/each}
                                </select>
                            {/if}
                        </div>
                    {/each}
                </div>
    
                <div class="checkbox-flex">
                    <label for="modeRandomColorsCheckbox">Enable random colors in mode representations:</label>
                    <input id="modeRandomColorsCheckbox" type="checkbox" bind:checked={$menuSettings.mainMenuRandomColors} on:input={updatePreferences}>
                </div>

                <div class="checkbox-flex">
                    <label for="randomModePosCheckbox">Randomize mode positions:</label>
                    <input id="randomModePosCheckbox" type="checkbox" bind:checked={$menuSettings.enableModesRandomPos} on:input={updatePreferences}>
                </div>

                <div class="color-flex">
                    <label for="menuBackgroundColor">Main menu background color:</label>
                    <input id="menuBackgroundColor" class="color-input" type="color" bind:value={$menuSettings.menuBackgroundColor} on:input={updatePreferences}>
                </div>
            </div>

            <h2>Speeches</h2>
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
    label{
        margin-top: 25px;
    }
    main{
        padding: 2rem;
    }
    .checkbox-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    .color-flex{
        display: flex;
        align-items: flex-end;
        gap: 10px;
    }
    .color-flex label{
        margin-bottom: 0px;
    }
    button.download-logs-btn,
    button.restore-btn{
        background-color: beige;
        border-radius: 10px;
        padding: 10px;
        text-align: center;
    }
    button.download-logs-btn{
        margin-top: 10px;
    }
    button.restore-btn{
        margin-top: 70px;
    }

    button.download-logs-btn:hover,
    button.restore-btn:hover{
        background-color: #e6e6e6;
    }

    button.download-logs-btn:focus,
    button.restore-btn:focus{
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }

    input.color-input{
        border: 1px solid black;
    }
    
    .remote-logs-container{
        display: flex;
        flex-direction: row;
        gap: 50px;
    }

    .game-modes-container{
        margin-left: 30px;
    }
    @media (max-width: 600px) {
        button.download-logs-btn{
            width: 220px;
        }
        .remote-logs-container{
            flex-direction: column;
            gap: 10px;
        }
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        button.download-logs-btn{
            width: 230px;
        }
    }
    @media (min-width: 1024px){
        button.download-logs-btn{
            width: 300px;
        }
    }
</style>
