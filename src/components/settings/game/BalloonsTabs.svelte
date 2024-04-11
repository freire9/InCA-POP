<script>
    export let balloonTypes = [];
    export let activeTabValue = 1;

    const handleClick = tabValue => () => (activeTabValue = tabValue);
</script>
  
<ul>
    {#each balloonTypes as balloonType}
        <li class={activeTabValue === balloonType.value ? 'active' : ''}>
            <button on:click={handleClick(balloonType.value)}>{balloonType.label}</button>
        </li>
    {/each}
</ul>
{#each balloonTypes as balloonType}
    {#if activeTabValue == balloonType.value}
        <div class="box">
            <svelte:component this={balloonType.component}/>
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
        li{
            font-size: medium;
        }
    }
</style>