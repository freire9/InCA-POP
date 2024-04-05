<script>
    import { goto } from "$app/navigation";
    import { ActionButton, TrainerButton } from "inca-utils";
    import { faExpand } from '@fortawesome/free-solid-svg-icons';
    import { isIphone } from "../stores";
    import { Fa }  from "inca-utils";
    import { onMount } from "svelte";
	import { toogleFullscreen } from "$lib/utils";

    let fullscreen;

    onMount(async () => {
        ({fullscreen} = await import('inca-utils/api'));
    })
</script>

<style>
    .fullscreen-btn{
        margin: 10px;
    }
    nav{
        display: flex;
        justify-content: space-between;
    }
</style>

<nav>
    <ActionButton mode="exit" on:click={() => goto('/')}/>
    <div class="fullscreen-btn">
        {#if !$isIphone}
            <TrainerButton on:click={() => {toogleFullscreen(fullscreen)}} label="Fullscreen" longpressTime="0.1">
                <Fa icon={faExpand} />
            </TrainerButton>
        {/if}
    </div>
</nav>

