<script>
    import { auth, db } from '$lib/firebaseConfig';
    import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
    import { isLoggedIn, user } from "../../stores";
	import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
    import { gameSettings, appSettings, menuSettings } from '../../stores';

    const login = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const res = await signInWithPopup(auth, provider);
            $user = res.user;
            $isLoggedIn = true;

            const userDocRef = doc(db, 'users', res.user.uid);

            const existingDoc = await getDoc(userDocRef);

            if (existingDoc.exists()){
                await updateDoc(userDocRef, {
                    lastAccessed: new Date(),
                });
            } else {
                await setDoc(userDocRef, {
                name: res.user.displayName,
                email: res.user.email,
                uid: res.user.uid,
                preferences:{
                    gameSettings: $gameSettings, 
                    appSettings: $appSettings, 
                    menuSettings: $menuSettings,
                },
                lastAccesed: new Date(),
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            $isLoggedIn = false;
            $user = {};
        } catch (error) {
            console.error(error);
        }
    };
</script>

<style>
    img{
        width: 100px;
        height: 100px;
        border-radius: 100px;
    }

    button.log-out-btn, 
    button.log-in-btn{
        background-color: beige;
        width: 200px;
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 10px;
        text-align: center;
    }

    button.log-out-btn:hover, 
    button.log-in-btn:hover{
        background-color: #e6e6e6;
    }

    button.log-out-btn:focus,
    button.log-in-btn:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }

    .profile-container{
        display: flex;
        align-items: center;
        margin-bottom: 40px;
    }
    p{
        margin-bottom: 15px;
    }
    @media (max-width: 600px) {
        .profile-container{
            flex-direction: column;
            text-align: center;
        }
    }
</style>

{#if !$isLoggedIn}
    <p>Log in to register/restore your configuration preferences:</p>
    <button class="log-in-btn" on:click={login}>Login with google</button>
{:else}
    <div class="profile-container">
        <div>
            <img src={$user.photoURL} alt={$user.displayName}>
            <h4>{$user.displayName}</h4>
            <p>{$user.email}</p>
        </div>
        <button class="log-out-btn" on:click={logout}>Log out</button>
    </div>
{/if}