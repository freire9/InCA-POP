<script>
    import { ActionButton, TrainerButton } from "inca-utils";
    import { faExpand } from '@fortawesome/free-solid-svg-icons';
    import { isIphone } from "../stores";
    import { Fa }  from "inca-utils";
    import { createEventDispatcher, onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { toogleFullscreen } from "$lib/utils";

    let fullscreen;
    const dispatch = createEventDispatcher();

    onMount(async () => {
        ({fullscreen} = await import('inca-utils/api'));
    })

    function handleExitClick(event){
        event.stopPropagation();
        dispatch('exit');
        goto('/');
    }
</script>

<style>
    nav{
        display: flex;
        justify-content: space-between;
        position: absolute;
        width: 100%;
    }
    .fullscreen-btn{
        margin: 10px;
    }
    @media (max-width: 600px) {
        :root{
            --nav-bar-height: 15vh;
        }
    }
    @media (min-width: 1024px){
        :root{
            --nav-bar-height: 20vh;
        }
    }
</style>

<nav class="not-selectable">
    <ActionButton mode="exit" on:click={handleExitClick} --width='var(--nav-bar-height)'/>
    {#if !$isIphone}
        <div class="fullscreen-btn">
            <TrainerButton on:click={() => {toogleFullscreen(fullscreen)}} --width='var(--nav-bar-height)'>
                <Fa icon={faExpand} />
            </TrainerButton>
        </div>
    {/if}
</nav>