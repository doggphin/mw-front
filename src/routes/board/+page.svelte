<script>
    import {PageNameStore, ProjectBoardStore, BACKENDIP} from '$lib/scripts/mtd-store.js';
    import {onMount} from 'svelte';
    import ListContainer from "$lib/components/ListContainer.svelte";
    import ListContainerLineBreak from "$lib/components/ListContainerLineBreak.svelte";

    onMount(async() => {
        PageNameStore.set("Project Board");
        if($ProjectBoardStore.length === 0) {
            const endpoint = `${BACKENDIP}/projects/board/`;
            const response = await fetch(endpoint, {method: "GET"});
            const data = await response.json();
            ProjectBoardStore.set(data);
        }
    });
</script>


<ListContainer minWidthRem=40>
    <div class="listing">
        <div>Name</div>
        <div>Media</div>
        <div>Due By</div>
        <div>Status</div>
    </div>
    <ListContainerLineBreak />
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
            <p title="Taken in on {projectListing.date_in_formatted}" style="{projectListing.is_hard_due ? "color:red;font-weight:bold" : ""}">
                <u>{projectListing.date_due_formatted}</u>
            </p>
        </div>
        <div class="listing-info">{projectListing.comments}</div>
    </div>
    {/each}
</ListContainer>


<style>
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
    u {
        border-bottom: 1px dotted #000;
        text-decoration: none;
    }
</style>