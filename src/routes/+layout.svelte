<script>
    import 'inca-utils/styles.css';
    import { user, isLoggedIn, gameSettings, menuSettings, appSettings, isIphone, isFirefox, modifyingConfig } from '../stores';
    import { auth, db } from '$lib/firebaseConfig';
    import { onAuthStateChanged } from 'firebase/auth';
    import { doc, getDoc } from 'firebase/firestore';
	import { onMount } from 'svelte';
    import packageJson from '../../package.json';

    const appVersion = packageJson.version;

    function syncPreferencesToStores(userData) {
        if (userData && userData.preferences) {
            gameSettings.set(userData.preferences.gameSettings || $gameSettings);
            menuSettings.set(userData.preferences.menuSettings || $menuSettings);
            appSettings.set(userData.preferences.appSettings || $appSettings);
            
            console.log('User preferences loaded');
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
    })
</script>

<style>
    @import '/styles.css';
    .app-version{
        position: absolute;
        right: 0;
        bottom: 0;
        font-size: small;
        z-index: 1;
        user-select: none;
    }
</style>

<p class="app-version">v{appVersion}</p>
<slot />