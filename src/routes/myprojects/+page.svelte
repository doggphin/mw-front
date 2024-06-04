<script>
    import {PageNameStore} from '../mtd-store.js';
    import {onMount} from 'svelte';

    onMount(async() => {
        PageNameStore.set("My Projects");
    });
</script>