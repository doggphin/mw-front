<script>
    import {PageNameStore, ProjectBoardStore } from '$lib/scripts/mtd-store.js';
    import { PUBLIC_IP_HTTP_BACKEND } from '$env/static/public';
    import {onMount} from 'svelte';
    import ListContainer from "$lib/components/ListContainer.svelte";
    import ListContainerLineBreak from "$lib/components/ListContainerLineBreak.svelte";
    import TempMessage from "$lib/components/TempMessage.svelte";

    onMount(async() => {
        PageNameStore.set("Project Board");
        if($ProjectBoardStore.length === 0) {
            const endpoint = `${PUBLIC_IP_HTTP_BACKEND}/projects/board/`;
            const response = await fetch(endpoint, {method: "GET"});
            const data = await response.json();
            ProjectBoardStore.set(data);
        }
    });
</script>


<ListContainer minWidthRem=40>
    {#if $ProjectBoardStore.length > 0}
        <div class="listing">
            <div>Location</div>
            <div>Name</div>
            <div>Received</div>
            <div>Due</div>
            <div>Status</div>
            <div>Comments</div>
        </div>
        <ListContainerLineBreak />
        {#each $ProjectBoardStore as projectListing, i}
            <div class="listing">
                <div class="listing-info">
                    {projectListing['location']}
                </div>
                <div class="listing-info">
                    <a href="/board/{projectListing['id']}">{projectListing.client_name_last}, {projectListing.client_name_first}</a>
                </div>
                <div class="listing-info">
                    <p>
                        {projectListing.date_in_formatted}
                    </p>
                </div>
                <div class="listing-info">
                    <p style="{projectListing.is_hard_due ? "color:red;font-weight:bold" : ""}">
                        {projectListing.date_due_formatted}
                    </p>
                </div>
                <ol class="media-container">
                    {#each projectListing.media_types as mediaType}
                        <li class="media"
                            style="border: 2px solid var(--clr-{mediaType.toLowerCase()}); background-color: var(--clr-{mediaType.toLowerCase()}-1);">
                            {mediaType}
                        </li>
                    {/each}
                </ol>     
                <div class="listing-info">{projectListing.comments}</div>
            </div>
            {#if i < $ProjectBoardStore.length - 1}
                <ListContainerLineBreak dotted={true}/>
            {/if}
        {/each}
    {:else}
        <TempMessage message="Loading..."/>
    {/if}
</ListContainer>


<style>
    .listing {
        display: grid;
        grid-template-columns: max(5rem, 10%) max(10rem,20%) max(5rem,10%) max(5rem,10%) max(15rem,30%) max(10rem,20%);
        padding: 10px 0px 10px 10px;
    }
    .media-container {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }
    .media {
        margin: 0px 5px 5px 0px;
        padding: 3px;
        border-radius: 10px;
        
        height: 1rem;
    }
    .listing-info {
        margin: auto 0px auto 0px;
    }
</style>