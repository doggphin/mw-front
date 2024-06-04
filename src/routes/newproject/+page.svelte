<script>
    import {PageNameStore} from '../mtd-store.js';
    import {onMount} from 'svelte';

    onMount(async() => {
        PageNameStore.set("Create New Project");
    });
</script>