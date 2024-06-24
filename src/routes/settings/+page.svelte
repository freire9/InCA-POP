<script>
    import { gameSettings, appSettings, menuSettings, isLoggedIn, user, isFullScreen, menuSettingsDEFAULT, appSettingsDEFAULT, gameSettingsDEFAULT, subjectName } from '../../stores.js';
    import { deepCopy } from '$lib/utils.js'

    import Profile from '../../components/settings/Profile.svelte';
    import UserNavBar from '../../components/UserNavBar.svelte';
    import Speeches from '../../components/settings/Speeches.svelte';
    import lodash from 'lodash';
    import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
    import { db, dbUsersCollectionName } from '$lib/firebaseConfig.js';
    import { updatePreferences } from '$lib/preferences.js';
    import GameModesTabs from '../../components/settings/game/GameModesTabs.svelte';
	import MainMenu from '../../components/settings/MainMenu.svelte';
	import Logs from '../../components/settings/Logs.svelte';
    
    const { debounce } = lodash;

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
            <Logs />
            
            <h2>Game modes</h2>
            <GameModesTabs />
    
            <h2>Main menu</h2>
            <MainMenu />

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
