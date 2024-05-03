<script>
	import { capitalizeFirstLetter } from "$lib/utils";
	import { popElmntDirections } from "../../../stores";
    import Game from "./Game.svelte";

    let activeTabValue = 1;

    const handleClick = tabValue => () => (activeTabValue = tabValue);

    let gameModeTabs;
    // List of tab game modes, values and assigned components
    $: gameModeTabs = [
        { label: capitalizeFirstLetter(popElmntDirections.BOTTOM_TO_TOP),
            value: 1,
            component: Game,
            mode: popElmntDirections.BOTTOM_TO_TOP
        },
        { label: capitalizeFirstLetter(popElmntDirections.TOP_TO_BOTTOM),
            value: 2,
            component: Game,
            mode: popElmntDirections.TOP_TO_BOTTOM
        },
        { label: capitalizeFirstLetter(popElmntDirections.LEFT_TO_RIGHT),
            value: 3,
            component: Game,
            mode: popElmntDirections.LEFT_TO_RIGHT
        },
        { label: capitalizeFirstLetter(popElmntDirections.RIGHT_TO_LEFT),
            value: 4,
            component: Game,
            mode: popElmntDirections.RIGHT_TO_LEFT
        },
    ];
</script>

<ul>
    {#each gameModeTabs as tab}
        <li class={activeTabValue === tab.value ? 'active' : ''}>
            <button on:click={handleClick(tab.value)}>{tab.label}</button>
        </li>
    {/each}
</ul>
{#each gameModeTabs as tab}
    {#if activeTabValue == tab.value}
        <div class="box">
            <svelte:component this={tab.component} mode={tab.mode}/>
        </div>
    {/if}
{/each}

<style>
    .box {
        margin-bottom: 10px;
        padding: 40px;
        border: 1px solid #dee2e6;
        border-radius: 0 0 .5rem .5rem;
        border-top: 0;
    }
    ul {
        display: flex;
        flex-wrap: wrap;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        border-bottom: 1px solid #dee2e6;
    }
    li {
        margin-bottom: -1px;
        text-align: center;
        opacity: 0.3;
    }

    button {
        border: 1px solid transparent;
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
        display: block;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }

    button:hover {
        border-color: #e9ecef #e9ecef #dee2e6;
    }
    li.active {
        opacity: 1;
    }

    li.active > button {
        /* color: #495057; */
        background-color: #fff;
        border-color: #dee2e6 #dee2e6 #fff;
        font-weight: bold;
    }
    @media (max-width: 600px) {
        ul{
            flex-wrap: unset;
        }
        li{
            font-size: xx-small;
        }
        button{
            padding: 0.25rem 0.4rem;
        }
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        ul{
            flex-wrap: unset;
        }
    }
</style>