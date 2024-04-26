<script>
    import { onMount } from 'svelte';
	import { appSettings, speechCorrect, speechExcellent, speechSettings, voices } from '../../stores';
	import { handleUpdateRemotePreferences } from '$lib/firebaseFunctions';
    import { Fa } from 'inca-utils';
    import { faPlay } from '@fortawesome/free-solid-svg-icons';
    import lodash from 'lodash';

    const { debounce } = lodash;
    let noCustomCorrect;
    let noCustomExcellent;

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

    function correctSpeechChange(){
        $speechCorrect.text = $speechSettings.speechCorrect;
        saveSpeechConfigLocal();
    }
    function excellentSpeechChange(){
        $speechExcellent.text = $speechSettings.speechExcellent;
        saveSpeechConfigLocal();
    }
    function voiceChange(){
        $speechCorrect.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        $speechExcellent.voice = $voices.find(voice => voice.name === $speechSettings.voice.name);
        saveSpeechConfigLocal();
    }
    function volumeChange(){
        $speechCorrect.volume = $speechSettings.volume;
        $speechExcellent.volume = $speechSettings.volume;
        saveSpeechConfigLocal();
    }
    function pitchChange(){
        $speechCorrect.pitch = $speechSettings.pitch;
        $speechExcellent.pitch = $speechSettings.pitch;
        saveSpeechConfigLocal();
    }
    function rateChange(){
        $speechCorrect.rate = $speechSettings.rate;
        $speechExcellent.rate = $speechSettings.rate;
        saveSpeechConfigLocal();
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
    const handleVoiceChange = debounce(voiceChange, 500);
    const handleVolumeChange = debounce(volumeChange, 500);
    const handlePitchChange = debounce(pitchChange, 500);
    const handleRateChange = debounce(rateChange, 500);
</script>

<div class="checkbox-flex">
    <label for="enableCustomSpeechesCheckbox">Enable custom speeches:</label>
    <input id="enableCustomSpeechesCheckbox" type="checkbox" bind:checked={$appSettings.enableCustomSpeeches} on:input={handleUpdateRemotePreferences}>
</div>
{#if $appSettings.enableCustomSpeeches}
    <div>
        <label for="speechVoiceSelect">Voice:</label>
        <select id="speechVoiceSelect" bind:value={$speechSettings.voice} on:input={handleVoiceChange}>
            {#each $voices as voice}
                <option value={voice}>{voice.name}</option>
            {/each}
        </select>

        <label for="speechVolumeRange">Volume: {$speechSettings.volume}</label>
        <input id="speechVolumeRange" type="range" min="0" max="1" step="0.01" bind:value={$speechSettings.volume} on:input={handleVolumeChange}>

        <label for="speechPitchRange">Pitch: {$speechSettings.pitch}</label>
        <input id="speechPitchRange" type="range" min="0" max="2" step="0.1" bind:value={$speechSettings.pitch} on:input={handlePitchChange}>

        <label for="speechRateRange">Rate: {$speechSettings.rate}</label>
        <input id="speechRateRange" type="range" min="0.1" max="2" step="0.1" bind:value={$speechSettings.rate} on:input={handleRateChange}>


        <label for="speechCorrectInput">Correct speech:</label>
        <div class="speech-input">
            <input type="text" id="speechCorrectInput" bind:value={$speechSettings.speechCorrect} on:input={handleCorrectSpeechChange}>
            <button on:click={() => readText($speechCorrect)}>
                <Fa icon={faPlay} />
            </button>
        </div>

        <label for="speechExcellentInput">Excellent speech:</label>
        <div class="speech-input">
            <input type="text" id="speechExcellentInput" bind:value={$speechSettings.speechExcellent} on:input={handleExcellentSpeechChange}>
            <button on:click={() => readText($speechExcellent)}>
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
