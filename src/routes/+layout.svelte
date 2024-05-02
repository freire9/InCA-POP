<script>
    import 'inca-utils/styles.css';
    import { user, isLoggedIn, appSettings, isIphone, isFirefox, modifyingConfig, speechCorrect, speechSettings, speechExcellent, voices, syncPreferencesFromRemote, fluidTransitions } from '../stores';
    import { auth, db, dbUsersCollectionName } from '$lib/firebaseConfig';
    import { onAuthStateChanged } from 'firebase/auth';
    import { doc, getDoc } from 'firebase/firestore';
	import { onMount } from 'svelte';
    import packageJson from '../../package.json';
	import { syncPreferencesToStores } from '$lib/firebaseFunctions';
	import { loadSubjectNameLocal, setLocalPreferencesToStores, setLocalUserId } from '$lib/localPreferences';

    const appVersion = packageJson.version;

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
            if($syncPreferencesFromRemote) await syncPreferencesFromFirestore();
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

    onMount(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        $isIphone = /iphone/.test(userAgent);
        $isFirefox = userAgent.indexOf('firefox') > -1;
        // $fluidTransitions = $isFirefox ? false : true;
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        if($speechCorrect.rate != $speechSettings.rate || $speechExcellent.rate != $speechSettings.rate){
            $speechCorrect.rate = $speechSettings.rate;
            $speechExcellent.rate = $speechSettings.rate;
        }
        loadSubjectNameLocal();
        setLocalUserId();
        if(!$syncPreferencesFromRemote) setLocalPreferencesToStores();
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