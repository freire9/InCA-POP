<script>
    import { onMount } from 'svelte';
	import { appSettings, speechCorrect, speechExcellent, speechExitGame, speechGameBackgroundTouched, speechGameEndedByCondition, speechGameEndedByInactivity, speechGameModeStarted, speechIsBeingRestored, speechMenuBackgroundTouched, speechSettings, voices } from '../../stores';
    import { Fa } from 'inca-utils';
    import { faPlay } from '@fortawesome/free-solid-svg-icons';
    import lodash from 'lodash';
	import { updatePreferences } from '$lib/preferences';
	import NumericInput from './NumericInput.svelte';

    const { debounce } = lodash;
    let noCustomCorrect;
    let noCustomExcellent;

    $:{
        if($speechIsBeingRestored){
            $speechSettings.voice = $voices[0];
            changeAllSpeechesConfigs();
            $speechIsBeingRestored = false;
        }
    }

    function readText(speech){
        if(!$speechSettings.voice || !speech.text){
            alert('Please select a voice and enter a correct speech');
            return;
        }
        window.speechSynthesis.speak(speech);
    }

    function saveSpeechConfigLocal() {
        const config = {
            selectedVoiceURI: $speechSettings.voice ? $speechSettings.voice.voiceURI : '',
            speechCorrect: $speechSettings.speechCorrect,
            speechExcellent: $speechSettings.speechExcellent,
            speechGameModeStarted: $speechSettings.speechGameModeStarted,
            speechMenuBackgroundTouched: $speechSettings.speechMenuBackgroundTouched,
            speechExitGame: $speechSettings.speechExitGame,
            speechGameBackgroundTouched: $speechSettings.speechGameBackgroundTouched,
            speechGameEndedByCondition: $speechSettings.speechGameEndedByCondition,
            speechGameEndedByInactivity: $speechSettings.speechGameEndedByInactivity,
            volume: $speechSettings.volume,
            pitch: $speechSettings.pitch,
            rate: $speechSettings.rate,
        };
        localStorage.setItem('speechConfig', JSON.stringify(config));

        console.log('Speech config saved to local storage')
    }

    onMount(() => {
        noCustomCorrect = new Audio('/sounds/correct.mp3');
        noCustomExcellent = new Audio('/sounds/excellent.mp3');
    })

    export function correctSpeechChange(){
        $speechCorrect.text = $speechSettings.speechCorrect;
        saveSpeechConfigLocal();
    }
    export function excellentSpeechChange(){
        $speechExcellent.text = $speechSettings.speechExcellent;
        saveSpeechConfigLocal();
    }
    export function exitGameSpeechChange(){
        $speechExitGame.text = $speechSettings.speechExitGame;
        saveSpeechConfigLocal();
    }
    export function gameEndedByConditionSpeechChange(){
        $speechGameEndedByCondition.text = $speechSettings.speechGameEndedByCondition;
        saveSpeechConfigLocal();
    }
    export function gameEndedByInactivitySpeechChange(){
        $speechGameEndedByInactivity.text = $speechSettings.speechGameEndedByInactivity;
        saveSpeechConfigLocal();
    }
    export function gameBackgroundTouchedSpeechChange(){
        $speechGameBackgroundTouched.text = $speechSettings.speechGameBackgroundTouched;
        saveSpeechConfigLocal();
    }
    export function menuBackgroundTouchedSpeechChange(){
        $speechMenuBackgroundTouched.text = $speechSettings.speechMenuBackgroundTouched;
        saveSpeechConfigLocal();
    }
    export function gameModeStartedSpeechChange(){
        if(!$speechSettings.speechGameModeStarted.includes("{gameMode}")){
            $speechSettings.speechGameModeStarted = $speechSettings.speechGameModeStartedDefault;
            $speechGameModeStarted.text = $speechSettings.speechGameModeStartedDefault;
            alert('Please include "{gameMode}" in the speech. This make the speech more dynamic reading the selected game mode.');
        }else{
            $speechGameModeStarted.text = $speechSettings.speechGameModeStarted;
        }
        saveSpeechConfigLocal();
    }

    export function voiceChange(){
        $speechCorrect.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        $speechExcellent.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        $speechGameModeStarted.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        $speechMenuBackgroundTouched.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        $speechExitGame.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        $speechGameBackgroundTouched.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        $speechGameEndedByCondition.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        $speechGameEndedByInactivity.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        saveSpeechConfigLocal();
    }
    export function volumeChange(){
        $speechCorrect.volume = $speechSettings.volume;
        $speechExcellent.volume = $speechSettings.volume;
        $speechGameModeStarted.volume = $speechSettings.volume;
        $speechMenuBackgroundTouched.volume = $speechSettings.volume;
        $speechExitGame.volume = $speechSettings.volume;
        $speechGameBackgroundTouched.volume = $speechSettings.volume;
        $speechGameEndedByCondition.volume = $speechSettings.volume;
        $speechGameEndedByInactivity.volume = $speechSettings.volume;
        saveSpeechConfigLocal();
    }
    export function pitchChange(){
        $speechCorrect.pitch = $speechSettings.pitch;
        $speechExcellent.pitch = $speechSettings.pitch;
        $speechGameModeStarted.pitch = $speechSettings.pitch;
        $speechMenuBackgroundTouched.pitch = $speechSettings.pitch;
        $speechExitGame.pitch = $speechSettings.pitch;
        $speechGameBackgroundTouched.pitch = $speechSettings.pitch;
        $speechGameEndedByCondition.pitch = $speechSettings.pitch;
        $speechGameEndedByInactivity.pitch = $speechSettings.pitch;
        saveSpeechConfigLocal();
    }
    export function rateChange(){
        $speechCorrect.rate = $speechSettings.rate;
        $speechExcellent.rate = $speechSettings.rate;
        $speechGameModeStarted.rate = $speechSettings.rate;
        $speechMenuBackgroundTouched.rate = $speechSettings.rate;
        $speechExitGame.rate = $speechSettings.rate;
        $speechGameBackgroundTouched.rate = $speechSettings.rate;
        $speechGameEndedByCondition.rate = $speechSettings.rate;
        $speechGameEndedByInactivity.rate = $speechSettings.rate;
        saveSpeechConfigLocal();
    }

    export function changeAllSpeechesConfigs(){
        rateChange();
        pitchChange();
        volumeChange();
        voiceChange();
        gameModeStartedSpeechChange();
        menuBackgroundTouchedSpeechChange();
        gameBackgroundTouchedSpeechChange();
        gameEndedByInactivitySpeechChange();
        gameEndedByConditionSpeechChange();
        exitGameSpeechChange();
        excellentSpeechChange();
        correctSpeechChange();
    }

    function handleNoCustomCorrect(){
        noCustomCorrect.currentTime = 0;
        noCustomCorrect.play();
    }
    function handleNoCustomExcellent(){
        noCustomExcellent.currentTime = 0;
        noCustomExcellent.play();
    }

    const handleCorrectSpeechChange = debounce(correctSpeechChange, 500);
    const handleExcellentSpeechChange = debounce(excellentSpeechChange, 500);
    const handleExitGameSpeechChange = debounce(exitGameSpeechChange, 500);
    const handleGameEndedByConditionSpeechChange = debounce(gameEndedByConditionSpeechChange, 500);
    const handleGameEndedByInactivitySpeechChange = debounce(gameEndedByInactivitySpeechChange, 500);
    const handleGameBackgroundTouchedSpeechChange = debounce(gameBackgroundTouchedSpeechChange, 500);
    const handleMenuBackgroundTouchedSpeechChange = debounce(menuBackgroundTouchedSpeechChange, 500);
    const handleGameModeStartedSpeechChange = debounce(gameModeStartedSpeechChange, 500);
    const handleVoiceChange = debounce(voiceChange, 500);
    const handleVolumeChange = debounce(volumeChange, 500);
    const handlePitchChange = debounce(pitchChange, 500);
    const handleRateChange = debounce(rateChange, 500);
</script>

<h2>Speeches</h2>
<div class="checkbox-flex">
    <input id="enableCustomSpeechesCheckbox" type="checkbox" bind:checked={$appSettings.enableCustomSpeeches} on:input={updatePreferences}>
    <label for="enableCustomSpeechesCheckbox">Enable custom speeches:</label>
</div>
{#if $appSettings.enableCustomSpeeches}
    <div>
        <label for="speechVoiceSelect">Voice:</label>
        <select id="speechVoiceSelect" bind:value={$speechSettings.voice} on:input={handleVoiceChange}>
            {#each $voices as voice}
                <option value={voice}>{voice.name}</option>
            {/each}
        </select>

        <NumericInput
            inputType={"range"}
            id={"speechVolumeRange"}
            label={'Volume: ' + $speechSettings.volume.toString()}
            bind:value={$speechSettings.volume}
            min={0}
            max={1}
            step={0.1}
            on:input={handleVolumeChange}
        />

        <NumericInput
            inputType={"range"}
            id={"speechPitchRange"}
            label={'Pitch: ' + $speechSettings.pitch.toString()}
            bind:value={$speechSettings.pitch}
            min={0}
            max={2}
            step={0.1}
            on:input={handlePitchChange}
        />

        <NumericInput
            inputType={"range"}
            id={"speechRateRange"}
            label={'Rate: ' + $speechSettings.rate.toString()}
            bind:value={$speechSettings.rate}
            min={0.1}
            max={2}
            step={0.1}
            on:input={handleRateChange}
        />

        <label for="speechCorrectInput"><i>"Correct"</i> speech:</label>
        <div class="speech-input">
            <input type="text" id="speechCorrectInput" bind:value={$speechSettings.speechCorrect} on:input={handleCorrectSpeechChange}>
            <button on:click={() => readText($speechCorrect)}>
                <Fa icon={faPlay} />
            </button>
        </div>

        <label for="speechExcellentInput"><i>"Excellent"</i> speech:</label>
        <div class="speech-input">
            <input type="text" id="speechExcellentInput" bind:value={$speechSettings.speechExcellent} on:input={handleExcellentSpeechChange}>
            <button on:click={() => readText($speechExcellent)}>
                <Fa icon={faPlay} />
            </button>
        </div>

        <label for="speechExitGameInput"><i>"Exit game"</i> speech:</label>
        <div class="speech-input">
            <input type="text" id="speechExitGameInput" bind:value={$speechSettings.speechExitGame} on:input={handleExitGameSpeechChange}>
            <button on:click={() => readText($speechExitGame)}>
                <Fa icon={faPlay} />
            </button>
        </div>

        <label for="speechGameEndedByConditionInput"><i>"Game ended by condition"</i> speech:</label>
        <div class="speech-input">
            <input type="text" id="speechGameEndedByConditionInput" bind:value={$speechSettings.speechGameEndedByCondition} on:input={handleGameEndedByConditionSpeechChange}>
            <button on:click={() => readText($speechGameEndedByCondition)}>
                <Fa icon={faPlay} />
            </button>
        </div>

        <label for="speechGameEndedByInactivityInput"><i>"Game ended by inactivity"</i> speech:</label>
        <div class="speech-input">
            <input type="text" id="speechGameEndedByInactivityInput" bind:value={$speechSettings.speechGameEndedByInactivity} on:input={handleGameEndedByInactivitySpeechChange}>
            <button on:click={() => readText($speechGameEndedByInactivity)}>
                <Fa icon={faPlay} />
            </button>
        </div>

        <label for="speechGameBackgroundTouchedInput"><i>"Game background touched"</i> speech:</label>
        <div class="speech-input">
            <input type="text" id="speechGameBackgroundTouchedInput" bind:value={$speechSettings.speechGameBackgroundTouched} on:input={handleGameBackgroundTouchedSpeechChange}>
            <button on:click={() => readText($speechGameBackgroundTouched)}>
                <Fa icon={faPlay} />
            </button>
        </div>

        <label for="speechMenuBackgroundTouchedInput"><i>"Menu background touched"</i> speech:</label>
        <div class="speech-input">
            <input type="text" id="speechMenuBackgroundTouchedInput" bind:value={$speechSettings.speechMenuBackgroundTouched} on:input={handleMenuBackgroundTouchedSpeechChange}>
            <button on:click={() => readText($speechMenuBackgroundTouched)}>
                <Fa icon={faPlay} />
            </button>
        </div>

        <label for="speechGameModeStartedInput"><i>"Game mode started"</i> speech:</label>
        <div class="speech-input">
            <input type="text" id="speechGameModeStartedInput" bind:value={$speechSettings.speechGameModeStarted} on:input={handleGameModeStartedSpeechChange}>
            <button on:click={() => readText($speechGameModeStarted)}>
                <Fa icon={faPlay} />
            </button>
        </div>

    </div>
{:else}
    <label for="correct-dummy-input">Correct:</label>
    <div class="speech-input">
        <input id="correct-dummy-input" type="text" value="Correct!" disabled={true}>
        <button on:click={handleNoCustomCorrect}>
            <Fa icon={faPlay} />
        </button>
    </div>

    <label for="excellent-dummy-input">Excellent:</label>
    <div class="speech-input">
        <input id="excellent-dummy-input" type="text" value="Excellent!" disabled={true}>
        <button on:click={handleNoCustomExcellent}>
            <Fa icon={faPlay} />
        </button>
    </div>
{/if}

<style>
    .checkbox-flex{
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    .speech-input {
        display: flex;
        gap: 0.5rem;
    }
    .speech-input button {
        border-radius: 0.6rem;
        padding: 0.8rem 2em;
        background-color: var(--inca-primary-container);
        color: var(--inca-on-primary-container);
    }
</style>
