<script>
    import { gameSettings, popElmntType } from "../../../stores";
    import NormalPopElmnts from "./NormalPopElmnts.svelte";
    import CtrlPopElmnts from "./CtrlPopElmnts.svelte";
    import ExpPopElmnts from "./ExpPopElmnts.svelte";

    let activeTabValue = 1;

    const handleClick = tabValue => () => (activeTabValue = tabValue);

    const normalLabelUp = popElmntType.NORMAL.charAt(0).toUpperCase() + popElmntType.NORMAL.slice(1);
    const ctrlLabelUp = popElmntType.CTRL.charAt(0).toUpperCase() + popElmntType.CTRL.slice(1);
    const expLabelUp = popElmntType.EXP.charAt(0).toUpperCase() + popElmntType.EXP.slice(1);
    let normalPopElmntLabel;
    let ctrlPopElmntLabel;
    let expPopElmntLabel;
    let tabs;

    $: normalPopElmntLabel = $gameSettings.popElmntConfig[popElmntType.NORMAL].shape;
    $: ctrlPopElmntLabel = $gameSettings.popElmntConfig[popElmntType.CTRL].shape;
    $: expPopElmntLabel = $gameSettings.popElmntConfig[popElmntType.EXP].shape;

    // List of tab pop elements with labels, values and assigned components
    $: tabs = [
        { label: `${normalLabelUp} ${normalPopElmntLabel}`,
            value: 1,
            component: NormalPopElmnts
        },
        { label: `${ctrlLabelUp} ${ctrlPopElmntLabel}`,
            value: 2,
            component: CtrlPopElmnts
        },
        { label: `${expLabelUp} ${expPopElmntLabel}`,
            value: 3,
            component: ExpPopElmnts
        }
    ];
</script>
  
<ul>
    {#each tabs as tab}
        <li class={activeTabValue === tab.value ? 'active' : ''}>
            <button on:click={handleClick(tab.value)}>{tab.label}</button>
        </li>
    {/each}
</ul>
{#each tabs as tab}
    {#if activeTabValue == tab.value}
        <div class="box">
            <svelte:component this={tab.component}/>
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