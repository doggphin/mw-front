<script>
    import {PageNameStore} from '../mtd-store.js';
    import {onMount} from 'svelte';

    onMount(async() => {
        PageNameStore.set("Project Board");
    });
</script>


<div class="listings-container">
    <div class="listing">
        <div>Name</div>
        <div>Media</div>
        <div>Due By</div>
        <div>Status</div>
    </div>
    <div class="line-break"></div>
    <div class="listing">
        <div class="listing-info">Lancaster, Brendan</div>
        <ol class="media-container">
            <li class="media">Slides</li>
            <li class="media">Negatives</li>
            <li class="media">Photos</li>
        </ol>       
        <div class="listing-info">6/20/24</div>
        <div class="listing-info">Scanning in progress</div>
    </div>
</div>


<style>
    .listings-container {
        position: relative;
        width: max(40rem, calc(100% - calc(var(--gap-small) * 2)));
        top: var(--gap-small);
        left: var(--gap-small);
        background-color: white;

        border-radius: calc(var(--gap-small) / 2);
        border: 3px solid var(--clr-primary-5-1);
        
        margin-right: var(--gap-small);
    }
    .line-break {
        width: 100%;
        background-color: var(--clr-primary-5-1);
        height: 3px;
    }
    .listing {
        display: grid;
        grid-template-columns: max(10rem,25%) max(10rem,25%) max(10rem,25%) max(10rem,25%);
        padding: 5px 0px 5px 0px;
    }
    .media-container {
        display: flex;
        flex-wrap: wrap;
    }
    .media {
        margin: 0px 5px 5px 0px;
        padding: 3px;
        border: 2px solid var(--clr-primary-3);
        border-radius: 20px;
        background-color: var(--clr-primary-4);
    }
    .listing-info {
        margin: auto 0px auto 0px;
    }
</style>