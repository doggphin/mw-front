<script>
    import {PageNameStore, ProjectBoardStore, BACKENDIP} from '../mtd-store.js';
    import {onMount} from 'svelte';

    onMount(async() => {
        PageNameStore.set("Project Board");
        if($ProjectBoardStore.length === 0) {
            const endpoint = `${BACKENDIP}/projects/board/`;
            const response = await fetch(endpoint);
            const data = await response.json();
            ProjectBoardStore.set(data);
            console.log($ProjectBoardStore);
        }
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
    {#each $ProjectBoardStore as projectListing}
    <div class="listing">
        <div class="listing-info">
            <a href="/board/{projectListing.id}">{projectListing.client_name_last}, {projectListing.client_name_first}</a>
        </div>
        <ol class="media-container">
            {#each projectListing.media_types as mediaType}
                <li class="media">{mediaType}</li>
            {/each}
        </ol>       
        <div class="listing-info">
            {#if projectListing.is_hard_due}
                {projectListing.date_due_formatted}
            {:else}
                <p style="color:red;font-weight:bold">{projectListing.date_due_formatted}</p>
            {/if}
        </div>
        <div class="listing-info">{projectListing.comments}</div>
    </div>
    {/each}
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
        padding: 10px 0px 10px 10px;
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