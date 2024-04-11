<script>
    import 'inca-utils/styles.css';
    import { user, isLoggedIn, gameSettings, menuSettings, appSettings, isIphone, isFirefox, modifyingConfig, appSettingsDEFAULT, menuSettingsDEFAULT, gameSettingsDEFAULT } from '../stores';
    import { auth, db } from '$lib/firebaseConfig';
    import { onAuthStateChanged } from 'firebase/auth';
    import { doc, getDoc } from 'firebase/firestore';
	import { onMount } from 'svelte';
    import packageJson from '../../package.json';
	import { updateRemotePreferences } from '$lib/utils';

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
            const { settings: updatedAppSettings, hasChanged: appSettingsHasChanged } = updateSettingsWithDefault(appSettingsDEFAULT, userData.preferences.appSettings);
            const { settings: updatedGameSettings, hasChanged: gameSettingsHasChanged } = updateSettingsWithDefault(gameSettingsDEFAULT, userData.preferences.gameSettings);
            const { settings: updatedMenuSettings, hasChanged: menuSettingsHasChanged } = updateSettingsWithDefault(menuSettingsDEFAULT, userData.preferences.menuSettings);

            gameSettings.set(updatedGameSettings);
            menuSettings.set(updatedMenuSettings);
            appSettings.set(updatedAppSettings);
            
            console.log('User preferences loaded');

            if(appSettingsHasChanged || gameSettingsHasChanged || menuSettingsHasChanged) updateRemotePreferences();
        }
    }

    async function syncPreferencesFromFirestore() {
        if ($user && $isLoggedIn) {
            $modifyingConfig = true;
            const userDocRef = doc(db, 'users', $user.uid);
            const docSnapshot = await getDoc(userDocRef);
            const userData = docSnapshot.data();

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

    onMount(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        $isIphone = /iphone/.test(userAgent);
        $isFirefox = userAgent.indexOf('firefox') > -1;
        $appSettings.fluidTransitions = $isFirefox ? false : true;
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