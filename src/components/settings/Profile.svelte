<script>
    import { auth, db, dbUsersCollectionName } from '$lib/firebaseConfig';
    import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
    import { isLoggedIn, localUserId, subjectName, user } from "../../stores";
	import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
    import { gameSettings, appSettings, menuSettings } from '../../stores';
	import { deepCopy } from '$lib/utils';

    const login = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const res = await signInWithPopup(auth, provider);
            $user = res.user;
            $isLoggedIn = true;

            const userDocRef = doc(db, dbUsersCollectionName, res.user.uid);

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

                await updateDoc(userDocRef, forUpdateData);

            } else {
                await setDoc(userDocRef, {
                    name: res.user.displayName,
                    role: 'usuario',
                    email: res.user.email,
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
    .login-p{
        margin-top: 20px;
    }
    .local-id-warning-p{
        font-size: 0.6rem;
        color: red;
    }
</style>

{#if !$isLoggedIn}
    <p><strong>Local user ID*:</strong> {$localUserId}</p>
    <p class="local-id-warning-p"><strong>*: This is a local ID saved in your browser.
        If you delete local storage the logs saved in remote DB will be unreachable.
        Always preffer login with Google account.</strong></p>
    <p class="login-p">Log in to register/restore your configuration preferences:</p>
    <button class="log-in-btn" on:click={login}>Login with google</button>
{:else}
    <div class="profile-container">
        <div>
            <img src={$user.photoURL} alt={$user.displayName}>
            <h4>{$user.displayName}</h4>
            <p>{$user.email}</p>
            <p><strong>User ID:</strong> {$user.uid}</p>
        </div>
        <button class="log-out-btn" on:click={logout}>Log out</button>
    </div>
{/if}