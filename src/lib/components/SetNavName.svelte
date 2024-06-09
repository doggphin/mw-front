<script>
    import {PageNameStore} from '$lib/scripts/mtd-store.js';
    import {onMount} from 'svelte';
    export let name = "Unset Name";

    onMount(async() => {
        PageNameStore.set(name);
    });
</script>