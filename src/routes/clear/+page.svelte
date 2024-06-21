<script>
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";

    onMount(() => {
        localStorage.clear();
        goto('/')
    });
</script>

<main>
    <h1>Cleaning local storage...</h1>
</main>