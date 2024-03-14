<script>
    import 'inca-utils/styles.css';
    import { user, isLoggedIn, gameSettings, menuSettings, appSettings, isIphone} from '../stores';
    import { auth, db } from '$lib/firebaseConfig';
    import { onAuthStateChanged } from 'firebase/auth';
    import { doc, getDoc, updateDoc } from 'firebase/firestore';
	import { onMount } from 'svelte';

    function syncPreferencesToStores(userData) {
        if (userData && userData.preferences) {
            gameSettings.set(userData.preferences.gameSettings || $gameSettings);
            menuSettings.set(userData.preferences.menuSettings || $menuSettings);
            appSettings.set(userData.preferences.appSettings || $appSettings);
        }
    }

    async function syncPreferencesFromFirestore() {
        if ($user && $isLoggedIn) {
            
            const userDocRef = doc(db, 'users', $user.uid);
            const docSnapshot = await getDoc(userDocRef);
            const userData = docSnapshot.data();

            syncPreferencesToStores(userData);
        }
    }

    async function updateRemotePreferences(){
        const userDocRef = doc(db, 'users', $user.uid);
        await updateDoc(userDocRef, {
            preferences: { gameSettings: $gameSettings, appSettings: $appSettings, menuSettings: $menuSettings},
        });
    }

    let unsubscribeGameSettings, unsubscribeMenuSettings, unsubscribeAppSettings;
    onAuthStateChanged(auth, async authUser => {
        $user = authUser;
        $isLoggedIn = !!authUser;
        if (!$user || !$isLoggedIn) return;

        try {
            await syncPreferencesFromFirestore();
        } catch(error) {
            console.error(error);
        };

        unsubscribeGameSettings = gameSettings.subscribe((newGameSettings) => {
            updateRemotePreferences();
            console.log('Updated game settings');
        });
        unsubscribeMenuSettings = menuSettings.subscribe((newMenuSettings) => {
            updateRemotePreferences();
            console.log('Updated menu settings');
        });
        unsubscribeAppSettings = appSettings.subscribe((newAppSettings) => {
            updateRemotePreferences();
            console.log('Updated app settings');
        });
    });

    onMount(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        $isIphone = /iphone/.test(userAgent);
    })
</script>

<style>
    @import '/styles.css';
</style>

<slot />