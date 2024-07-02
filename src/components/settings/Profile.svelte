<script>
    import { auth, db, dbUsersCollectionName, USE_FIREBASE } from '$lib/firebaseConfig';
    import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
    import { isLoggedIn, localUserId, subjectName, user, useRemoteDb } from "../../stores";
	import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
    import { gameSettings, appSettings, menuSettings } from '../../stores';
	import { deepCopy } from '$lib/utils';
    import lodash from 'lodash';
	import SliderInput from './SliderInput.svelte';

    const { debounce } = lodash;

    const login = async () => {
        if(!USE_FIREBASE) return;

        try {
            const provider = new GoogleAuthProvider();
            const res = await signInWithPopup(auth, provider);
            $user = res.user;
            $isLoggedIn = true;

            if(!$useRemoteDb) return;

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
        if(!USE_FIREBASE) return;

        try {
            await signOut(auth);
            $isLoggedIn = false;
            $user = {};
        } catch (error) {
            console.error(error);
        }
    };

    async function saveSubjectName(){
        localStorage.setItem('subjectName', $subjectName);
        console.log('Subject name saved to local storage')
        if($isLoggedIn && $user) {
            if(!$useRemoteDb) return;

            const userDocRef = doc(db, dbUsersCollectionName, $user.uid);
            const userDoc = await getDoc(userDocRef);

            if(!userDoc.exists()){
                await setDoc(userDocRef, {
                    learners: [$subjectName],
                });
                console.log('Document created with new learner');
            }else{
                if(!userDoc?.data()?.learners || !userDoc?.data()?.learners.includes($subjectName)){
                    await updateDoc(userDocRef, {
                        learners: arrayUnion($subjectName),
                    });
                }
                console.log('Learner added to existing document');
            }
        }
    }

    async function saveInstructorName(){
        let localPreferences = JSON.parse(localStorage.getItem('incaPopPreferences'));
        localPreferences.appSettings.instructorName = $appSettings.instructorName;
        localStorage.setItem('incaPopPreferences', JSON.stringify(localPreferences));
        if(USE_FIREBASE && $isLoggedIn && $user) {
            if(!$useRemoteDb) return;

            const userDocRef = doc(db, dbUsersCollectionName, $user.uid);
            const userDoc = await getDoc(userDocRef);
            let forUpdateData = {
                incaPopPreferences: {
                    appSettings: {
                        instructorName: $appSettings.instructorName,
                    }
                }
            };
            if(!userDoc.exists()){
                await setDoc(userDocRef, forUpdateData);
                console.log('Document created with new instructor');
            }else{
                if(!userDoc.data().teachers || !userDoc.data().teachers.includes($appSettings.instructorName)){
                    forUpdateData.teachers = arrayUnion($appSettings.instructorName);
                }
                await updateDoc(userDocRef, forUpdateData);
                console.log('Instructor added to existing document');
            }
        }
    }

    async function useRemoteDbChange(){
        localStorage.setItem('useRemoteDb', $useRemoteDb.toString());

        if(!USE_FIREBASE || !$isLoggedIn || !$user) return;

        try{
            const userDocRef = doc(db, dbUsersCollectionName, $user.uid);
    
            const existingDoc = await getDoc(userDocRef);
    
            if (existingDoc.exists()){
    
                let forUpdateData = {};
    
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
        } 
        catch (error) {
            console.error(error);
        }
    }

    const handleSaveSubject = debounce(saveSubjectName, 1500);
    const handleSaveInstructor = debounce(saveInstructorName, 1500);
    const handleUseRemoteDbChange = debounce(useRemoteDbChange, 1500);
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
    .local-id-warning-p,
    .remote-db-warning-p{
        font-size: 0.6rem;
        color: red;
    }
    .remote-db-warning-p{
        margin-top: 15px;
    }
    #instructorNameInput{
        margin-bottom: 40px;
    }
</style>

{#if !$isLoggedIn}
    <p class="selectable"><strong>Local user ID*:</strong> {$localUserId}</p>
    <p class="local-id-warning-p"><strong>*: This is a local ID saved in your browser.
        {#if USE_FIREBASE}
            If you delete local storage the logs saved in remote DB will be unreachable.
            Always preffer login with Google account.
        {/if}
        </strong></p>
    {#if USE_FIREBASE}
        <p class="login-p">Log in to associate the interaction logs to an account:</p>
        <button class="log-in-btn" on:click={login}>Login with google</button>
    {/if}
{:else}
    <div class="profile-container">
        <div>
            <img src={$user.photoURL} alt={$user.displayName}>
            <h4>{$user.displayName}</h4>
            <p>{$user.email}</p>
            <p class="selectable"><strong>User ID:</strong> {$user.uid}</p>
        </div>
        <button class="log-out-btn" on:click={logout}>Log out</button>
    </div>
{/if}

<label for="subjectNameInput">Subject's name:</label>
<input id="subjectNameInput" type='text' bind:value={$subjectName} on:input={handleSaveSubject}/>

<label for="instructorNameInput">Instructor's name:</label>
<input id="instructorNameInput" type="text" bind:value={$appSettings.instructorName} on:input={handleSaveInstructor}>

{#if USE_FIREBASE}
    <SliderInput
        label="Use remote database for save logs and preferences"
        bind:value={$useRemoteDb}
        on:change={handleUseRemoteDbChange}
    />
    <p class="remote-db-warning-p">
        <strong>
            *: Enable/disable remote database use for logs and preferences.<br>
            If disabled, logs will be saved in local and preferences will only be saved in local storage.<br>
            If enabled, logs will be saved in local storage and remote database.<br>
            If enabled, preferences will be saved in local storage and remote database if logged in and if enabled the save/load option in each setting section.
        </strong>
    </p>
{/if}
