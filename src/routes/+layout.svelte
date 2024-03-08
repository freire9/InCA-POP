<script>
    import 'inca-utils/styles.css';
    import { user, isLoggedIn, gameSettings, menuSettings, appSettings } from '../stores';
    import { auth, db } from '$lib/firebaseConfig';
    import { onAuthStateChanged } from 'firebase/auth';
	import { doc, getDoc } from 'firebase/firestore';

    // function syncPreferencesToStores(userData) {
    //     if (userData && userData.preferences) {
    //         // Actualizar los stores con las preferencias desde Firestore
    //         gameSettings.set(userData.preferences.gameSettings || $gameSettings);
    //         menuSettings.set(userData.preferences.menuSettings || $menuSettings);
    //         appSettings.set(userData.preferences.appSettings || $appSettings);
    //     }
    // }

    // async function syncPreferencesFromFirestore() {
    //     if ($user && $isLoggedIn) {
            
    //         const userDocRef = doc(db, 'users', $user.uid);
    //         // Obtener las preferencias desde Firestore
    //         const docSnapshot = await getDoc(userDocRef);
    //         const userData = docSnapshot.data();

    //         // Actualizar los stores con las preferencias desde Firestore
    //         syncPreferencesToStores(userData);
    //     }
    // }

    onAuthStateChanged(auth, async authUser => {
        $user = authUser;
        $isLoggedIn = !!authUser;

        // try {
        //     await syncPreferencesFromFirestore();
        // } catch(error) {
        //     console.error(error);
        // };
    });
</script>

<style>
    @import '/styles.css';
</style>

<slot />