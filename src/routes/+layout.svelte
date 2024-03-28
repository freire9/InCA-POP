<script>
    import 'inca-utils/styles.css';
    import { user, isLoggedIn, gameSettings, menuSettings, appSettings, isIphone, isFirefox, modifyingConfig } from '../stores';
    import { auth, db } from '$lib/firebaseConfig';
    import { onAuthStateChanged } from 'firebase/auth';
    import { doc, getDoc } from 'firebase/firestore';
	import { onMount } from 'svelte';

    function syncPreferencesToStores(userData) {
        if (userData && userData.preferences) {
            gameSettings.set(userData.preferences.gameSettings || $gameSettings);
            console.log('Game settings loaded');
            menuSettings.set(userData.preferences.menuSettings || $menuSettings);
            console.log('Menu settings loaded');
            appSettings.set(userData.preferences.appSettings || $appSettings);
            console.log('App settings loaded');
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
        $modifyingConfig = false;
        if (!$user || !$isLoggedIn) return;

        try {
            await syncPreferencesFromFirestore();
        } catch(error) {
            console.error(error);
        } finally{
            $modifyingConfig = false;
            console.log('finalizando carga, evento despachado')
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
</style>

<slot />