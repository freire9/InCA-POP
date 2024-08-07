<script>
    import 'inca-utils/styles.css';
    import { user, isLoggedIn, isIphone, modifyingConfig, speechCorrect, speechSettings, speechExcellent, voices, loadPreferencesFromRemote, speechGameModeStarted, speechMenuBackgroundTouched, speechExitGame, speechGameBackgroundTouched, speechGameEndedByCondition, speechGameEndedByInactivity, useRemoteDb, gameSettings, appSettings, menuSettings, subjectName } from '../stores';
    import { auth, db, dbUsersCollectionName, USE_FIREBASE } from '$lib/firebaseConfig';
    import { onAuthStateChanged } from 'firebase/auth';
	import { onMount } from 'svelte';
    import packageJson from '../../package.json';
	import { syncPreferencesFromFirestore } from '$lib/firebaseFunctions';
	import { loadSubjectNameLocal, setLocalPreferencesToStores, setLocalUserId } from '$lib/localPreferences';
	import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
	import { deepCopy } from '$lib/utils';

    const appVersion = packageJson.version;

    function loadVoices() {
        $voices = window.speechSynthesis.getVoices();
        if($voices.length > 0 && !$speechSettings.voice){
            $speechSettings.voice = $voices[0];
            $speechCorrect.voice = $voices[0];
            $speechExcellent.voice = $voices[0];
            $speechGameModeStarted.voice = $voices[0];
            $speechMenuBackgroundTouched.voice = $voices[0];
            $speechExitGame.voice = $voices[0];
            $speechGameBackgroundTouched.voice = $voices[0];
            $speechGameEndedByCondition.voice = $voices[0];
            $speechGameEndedByInactivity.voice = $voices[0];
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
            $speechSettings.speechGameModeStarted = parsedConfig.speechGameModeStarted;
            $speechSettings.speechMenuBackgroundTouched = parsedConfig.speechMenuBackgroundTouched;
            $speechSettings.speechExitGame = parsedConfig.speechExitGame;
            $speechSettings.speechGameBackgroundTouched = parsedConfig.speechGameBackgroundTouched;
            $speechSettings.speechGameEndedByCondition = parsedConfig.speechGameEndedByCondition;
            $speechSettings.speechGameEndedByInactivity = parsedConfig.speechGameEndedByInactivity;
            
            $speechSettings.volume = parsedConfig.volume;
            $speechSettings.pitch = parsedConfig.pitch;
            $speechSettings.rate = parsedConfig.rate;

            $speechCorrect.volume = parsedConfig.volume;
            $speechExcellent.volume = parsedConfig.volume;
            $speechGameModeStarted.volume = parsedConfig.volume;
            $speechMenuBackgroundTouched.volume = parsedConfig.volume;
            $speechExitGame.volume = parsedConfig.volume;
            $speechGameBackgroundTouched.volume = parsedConfig.volume;
            $speechGameEndedByCondition.volume = parsedConfig.volume;
            $speechGameEndedByInactivity.volume = parsedConfig.volume;

            $speechCorrect.pitch = parsedConfig.pitch;
            $speechExcellent.pitch = parsedConfig.pitch;
            $speechGameModeStarted.pitch = parsedConfig.pitch;
            $speechMenuBackgroundTouched.pitch = parsedConfig.pitch;
            $speechExitGame.pitch = parsedConfig.pitch;
            $speechGameBackgroundTouched.pitch = parsedConfig.pitch;
            $speechGameEndedByCondition.pitch = parsedConfig.pitch;
            $speechGameEndedByInactivity.pitch = parsedConfig.pitch;

            $speechCorrect.rate = parsedConfig.rate;
            $speechExcellent.rate = parsedConfig.rate;
            $speechGameModeStarted.rate = parsedConfig.rate;
            $speechMenuBackgroundTouched.rate = parsedConfig.rate;
            $speechExitGame.rate = parsedConfig.rate;
            $speechGameBackgroundTouched.rate = parsedConfig.rate;
            $speechGameEndedByCondition.rate = parsedConfig.rate;
            $speechGameEndedByInactivity.rate = parsedConfig.rate;

            $speechCorrect.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechExcellent.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechGameModeStarted.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechMenuBackgroundTouched.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechExitGame.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechGameBackgroundTouched.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechGameEndedByCondition.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);
            $speechGameEndedByInactivity.voice = $voices.find(voice => voice.voiceURI === parsedConfig.selectedVoiceURI);

            $speechCorrect.text = parsedConfig.speechCorrect;
            $speechExcellent.text = parsedConfig.speechExcellent;
            $speechGameModeStarted.text = parsedConfig.speechGameModeStarted;
            $speechMenuBackgroundTouched.text = parsedConfig.speechMenuBackgroundTouched;
            $speechExitGame.text = parsedConfig.speechExitGame;
            $speechGameBackgroundTouched.text = parsedConfig.speechGameBackgroundTouched;
            $speechGameEndedByCondition.text = parsedConfig.speechGameEndedByCondition;
            $speechGameEndedByInactivity.text = parsedConfig.speechGameEndedByInactivity;

            console.log('Speech config loaded from local storage')
        }
    }

    onMount(() => {
        if(auth && USE_FIREBASE){
            onAuthStateChanged(auth||null, async authUser => {
                if(!USE_FIREBASE) return;
    
                $user = authUser;
                $isLoggedIn = !!authUser;
                if (!$user || !$isLoggedIn) {
                    $modifyingConfig = false;
                    return;
                }
                
                try {
                    const userDocRef = doc(db, dbUsersCollectionName, $user.uid);
                    const existingDoc = await getDoc(userDocRef);
                    if (existingDoc.exists()){

                        let forUpdateData = {
                            lastAccess: new Date(),
                        };

                        if(!existingDoc.data().incaPopPreferences){
                            forUpdateData.incaPopPreferences = {
                                gameSettings: deepCopy($gameSettings),
                                appSettings: deepCopy($appSettings),
                                menuSettings: deepCopy($menuSettings),
                            };
                        }
                        if(!existingDoc.data().learners || !existingDoc.data().learners.includes($subjectName)){
                            forUpdateData.learners = arrayUnion($subjectName);
                        }

                        if(!existingDoc.data().teachers || !existingDoc.data().teachers.includes($appSettings.instructorName)){
                            forUpdateData.teachers = arrayUnion($appSettings.instructorName);
                        }
                        if(!existingDoc.data().name){
                            forUpdateData.name = $user.displayName;
                        }
                        if(!existingDoc.data().role){
                            forUpdateData.role = 'usuario';
                        }
                        if(!existingDoc.data().email){
                            forUpdateData.email = $user.email;
                        }

                        await updateDoc(userDocRef, forUpdateData);

                        } else {
                            await setDoc(userDocRef, {
                                name: $user.displayName,
                                role: 'usuario',
                                email: $user.email,
                                teachers: [$appSettings.instructorName],
                                learners: [$subjectName],
                                lastAccess: new Date(),
                                incaPopPreferences:{
                                    gameSettings: $gameSettings, 
                                    appSettings: $appSettings, 
                                    menuSettings: $menuSettings,
                                },
                            });
                        }

                    if($loadPreferencesFromRemote) await syncPreferencesFromFirestore();
                } catch(error) {
                    console.error(error);
                } finally{
                    $modifyingConfig = false;
                };
            });
        }


        const userAgent = navigator.userAgent.toLowerCase();
        $isIphone = /iphone/.test(userAgent);
        if(localStorage.getItem('useRemoteDb') !== null) $useRemoteDb = localStorage.getItem('useRemoteDb') === 'true';
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        if($speechCorrect.rate != $speechSettings.rate || 
            $speechExcellent.rate != $speechSettings.rate ||
            $speechGameModeStarted.rate != $speechSettings.rate ||
            $speechMenuBackgroundTouched.rate != $speechSettings.rate ||
            $speechExitGame.rate != $speechSettings.rate ||
            $speechGameBackgroundTouched.rate != $speechSettings.rate ||
            $speechGameEndedByCondition.rate != $speechSettings.rate ||
            $speechGameEndedByInactivity.rate != $speechSettings.rate){
                $speechCorrect.rate = $speechSettings.rate;
                $speechExcellent.rate = $speechSettings.rate;
                $speechGameModeStarted.rate = $speechSettings.rate;
                $speechMenuBackgroundTouched.rate = $speechSettings.rate;
                $speechExitGame.rate = $speechSettings.rate;
                $speechGameBackgroundTouched.rate = $speechSettings.rate;
                $speechGameEndedByCondition.rate = $speechSettings.rate;
                $speechGameEndedByInactivity.rate = $speechSettings.rate;
        }
        loadSubjectNameLocal();
        setLocalUserId();
        setLocalPreferencesToStores();
    });
</script>

<style>
    @import '/styles.css';
    .app-version{
        position: fixed;
        right: 0;
        bottom: 0;
        font-size: small;
        z-index: 3;
        user-select: none;
        text-align: center;
    }
    @media (min-width: 600px){
        .app-version{
            font-size: medium;
        }
        br.version-br{
            display: none;
        }
    }
</style>

<p class="app-version">InCA-Pop <br class="version-br"> v{appVersion}</p>
<slot />