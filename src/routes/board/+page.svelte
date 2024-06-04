<script>
    import {PageNameStore} from '../mtd-store.js';
    import {onMount} from 'svelte';

    onMount(async() => {
        PageNameStore.set("Project Board");
    });
</script>


<div class="listings-container">
    <div class="listing">
        <div>
            hey
        </div>
        <div>
            yo
        </div>
    </div>
</div>


<style>
    .listings-container {
        position: relative;
        width: calc(100% - calc(var(--gap-small) * 2));
        top: var(--gap-small);
        left: var(--gap-small);
        background-color: white;
        border-radius: calc(var(--gap-small) / 2);
    }
    .listing {
        display: grid;
    }
</style>