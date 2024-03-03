<script>
    import { goto } from "$app/navigation";
    import { ActionButton } from "inca-utils";
</script>

<style>
    main{
        padding: 0 2rem;
    }
</style>

<nav>
    <ActionButton mode="exit" on:click={() => goto('/')}/>
</nav>
<main>
    <h1>About InCA-POP!</h1>
    <p>This is the about page.</p>
</main>