<script>
    import 'inca-utils/styles.css';
    import { user, isLoggedIn, gameSettings, menuSettings, appSettings, isIphone, isFirefox, modifyingConfig, appSettingsDEFAULT, menuSettingsDEFAULT, gameSettingsDEFAULT, speechCorrect, speechSettings, speechExcellent, voices, subjectName, localUserId } from '../stores';
    import { auth, db, dbUsersCollectionName } from '$lib/firebaseConfig';
    import { onAuthStateChanged } from 'firebase/auth';
    import { doc, getDoc } from 'firebase/firestore';
	import { onMount } from 'svelte';
    import packageJson from '../../package.json';
	import { updateRemotePreferences } from '$lib/firebaseFunctions';

    const appVersion = packageJson.version;

    function updateSettingsWithDefault(settingsDEFAULT, userPreferences) {
        const updatedSettings = { ...settingsDEFAULT };
        let hasChanged = false;

        for (const key in userPreferences) {
            if (updatedSettings.hasOwnProperty(key)) {
                updatedSettings[key] = userPreferences[key];
            } else{ //if remote settings has a key that is not in the default settings, mark for update
                hasChanged = true;
            }
        }

        //if remote settings has less keys than the default settings, mark for update
        if(Object.keys(userPreferences).length !== Object.keys(updatedSettings).length){
            hasChanged = true;
        }

        return { settings: updatedSettings, hasChanged };
    }

    function syncPreferencesToStores(userData) {
        if (userData && userData.preferences) {
            const { settings: updatedAppSettings, hasChanged: appSettingsHasChanged } = updateSettingsWithDefault(appSettingsDEFAULT, userData.preferences.appSettings || {});
            const { settings: updatedGameSettings, hasChanged: gameSettingsHasChanged } = updateSettingsWithDefault(gameSettingsDEFAULT, userData.preferences.gameSettings || {});
            const { settings: updatedMenuSettings, hasChanged: menuSettingsHasChanged } = updateSettingsWithDefault(menuSettingsDEFAULT, userData.preferences.menuSettings || {});

            gameSettings.set(updatedGameSettings);
            menuSettings.set(updatedMenuSettings);
            appSettings.set(updatedAppSettings);
            
            console.log('User preferences loaded');

            if(appSettingsHasChanged || gameSettingsHasChanged || menuSettingsHasChanged) updateRemotePreferences();
        } else{ //if user has no preferences, update database with default settings
            updateRemotePreferences();
        }
    }

    async function syncPreferencesFromFirestore() {
        if ($user && $isLoggedIn) {
            $modifyingConfig = true;
            const userDocRef = doc(db, dbUsersCollectionName, $user.uid);
            const docSnapshot = await getDoc(userDocRef);
            const userData = docSnapshot.data();
            
            if(!userData) return;

            syncPreferencesToStores(userData);
        }
    }

    onAuthStateChanged(auth, async authUser => {
        $user = authUser;
        $isLoggedIn = !!authUser;
        if (!$user || !$isLoggedIn) {
            $modifyingConfig = false;
            return;
        }

        try {
            await syncPreferencesFromFirestore();
        } catch(error) {
            console.error(error);
        } finally{
            $modifyingConfig = false;
        };
    });

    function loadVoices() {
        $voices = window.speechSynthesis.getVoices();
        if($voices.length > 0 && !$speechSettings.voice){
            $speechSettings.voice = $voices[0];
            $speechCorrect.voice = $voices[0];
            $speechExcellent.voice = $voices[0];
        }
        loadSpeechConfigLocal();
    }

    function loadSpeechConfigLocal(){
        const config = localStorage.getItem('speechConfig');
        if(config){
            const parsedConfig = JSON.parse(config);
            $speechSettings.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechSettings.speechCorrect = parsedConfig.speechCorrect;
            $speechSettings.speechExcellent = parsedConfig.speechExcellent;
            $speechSettings.volume = parsedConfig.volume;
            $speechSettings.pitch = parsedConfig.pitch;
            $speechSettings.rate = parsedConfig.rate;
            $speechCorrect.volume = parsedConfig.volume;
            $speechExcellent.volume = parsedConfig.volume;
            $speechCorrect.pitch = parsedConfig.pitch;
            $speechExcellent.pitch = parsedConfig.pitch;
            $speechCorrect.rate = parsedConfig.rate;
            $speechExcellent.rate = parsedConfig.rate;
            $speechCorrect.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechExcellent.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechCorrect.text = parsedConfig.speechCorrect;
            $speechExcellent.text = parsedConfig.speechExcellent;

            console.log('Speech config loaded from local storage')
        }
    }

    function loadSubjectNameLocal(){
        const name = localStorage.getItem('subjectName');
        if(name){
            $subjectName = name;
        }

        console.log('Subject name loaded from local storage')
    }

    function setLocalUserId(){
        $localUserId = localStorage.getItem('localUserId');
        if(!$localUserId){
            const new_id = crypto.randomUUID();
            localStorage.setItem('localUserId', new_id);
            $localUserId = new_id;
        }
    }

    onMount(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        $isIphone = /iphone/.test(userAgent);
        $isFirefox = userAgent.indexOf('firefox') > -1;
        $appSettings.fluidTransitions = $isFirefox ? false : true;
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        if($speechCorrect.rate != $speechSettings.rate || $speechExcellent.rate != $speechSettings.rate){
            $speechCorrect.rate = $speechSettings.rate;
            $speechExcellent.rate = $speechSettings.rate;
        }
        loadSubjectNameLocal();
        setLocalUserId();
    });
</script>

<style>
    @import '/styles.css';
    .app-version{
        position: fixed;
        right: 0;
        bottom: 0;
        font-size: small;
        z-index: 1;
        user-select: none;
    }
</style>

<p class="app-version">v{appVersion}</p>
<slot />