<script>
    import { onMount } from 'svelte';
    import { PageNameStore, ProjectDetailStore, BACKENDIP } from '../../mtd-store.js';
    import ListContainer from '$lib/components/ListContainer.svelte'

    export let data;
    let project = null;
    let error = 0;

    let tab = "prints";

    onMount(async function() {
        PageNameStore.set("")
        const endpoint = `${BACKENDIP}/projects/${data.id}`;
        const response = await fetch(endpoint);
        if(response.status == 200) {
            const data = await response.json();
            ProjectDetailStore.set(data);
            project = data;
            PageNameStore.set(data["client_name_last"] + ", " + data["client_name_first"])
        } else {
            PageNameStore.set("Error")
            error = 1;
        }
        //const data = await response.json();
        //ProjectDetailStore.set(data);
        //console.log(data);
    })
</script>

<ListContainer>
    {#if project}
        {#if tab == "slides"}
            {#each $ProjectDetailStore["slides_job"]["groups"] as detail}
                <p> test </p>
            {/each}



        {:else if tab == "prints"}
            {#if $ProjectDetailStore["prints_job"]}
                {#each $ProjectDetailStore["prints_job"]["groups"] as printGroup}
                    <p>{printGroup["dpi"]}</p>
                {/each}
            {:else}
                <p class="temp-message">No groups found for prints!</p>
            {/if}



        {:else if tab == "negatives_job"}
            {#each $ProjectDetailStore["negatives_job"]["groups"] as detail}
                <p> test </p>
            {/each}
        {/if}
    {:else}

        {#if error}
            <p class="temp-message"> 404 Error: No project found with ID {data.id}!</p>
        {:else}
            <p class="temp-message"> Loading... </p>
        {/if}
    {/if}
</ListContainer>

<style>
    .temp-message {
        width: 100%;
        text-align: center;
        padding: 20px 0px;
    }
</style>