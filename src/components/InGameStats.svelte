<script>
    import { popElmntTypes, popElmntTypesShort } from "../stores";

    export let stats;

    function addSeparator(i){
        return i === Object.values(popElmntTypes).length - 1 ? "" : ", ";
    }
</script>

<style>
    p{
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
        font-size: x-small;
        z-index: 1;
    }
    span{
        margin: 2px;
    }
    @media (min-width: 600px){
        br{
            display: none;
        }

    }
</style>

<p>
    {#each Object.values(popElmntTypes) as elmntType, i}
        {#if stats[elmntType]}
            <span>{popElmntTypesShort[elmntType]} : {stats[elmntType].popped}/{stats[elmntType].total}{addSeparator(i)}</span>
            <br>
        {/if}
    {/each}
</p>