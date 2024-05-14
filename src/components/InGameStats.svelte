<script>
	import { getTextColorByContrast } from "$lib/utils";
    import { popElmntTypes, popElmntTypesShort } from "../stores";

    export let stats;
    export let gameBackgroundColor;

    function addSeparator(i){
        return i === Object.values(popElmntTypes).length - 1 ? "" : ", ";
    }
</script>

<style>
    p{
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
        font-size: small;
    }
    span{
        margin: 2px;
    }
    @media (min-width: 600px){
        br{
            display: none;
        }
        p{
            font-size: medium;
        }

    }
</style>

<p>
    {#each Object.values(popElmntTypes) as elmntType, i}
        {#if stats[elmntType]}
            <span style:color={getTextColorByContrast(gameBackgroundColor)}>{popElmntTypesShort[elmntType]} : {stats[elmntType].popped}/{stats[elmntType].total}{addSeparator(i)}</span>
            <br>
        {/if}
    {/each}
</p>