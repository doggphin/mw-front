<script>
    import { onMount } from 'svelte';
    import { PageNameStore, ProjectDetailStore, BACKENDIP } from '../../mtd-store.js';

    export let data;
    let project = null;
    let error = 0;

    onMount(async function() {
        PageNameStore.set("Project Name Goes Here")
        const endpoint = `${BACKENDIP}/projects/${data.id}`;
        const response = await fetch(endpoint);
        if(response.status == 200) {
            const data = await response.json();
            ProjectDetailStore.set(data);
            project = data;
        } else {
            error = 1;
        }
        //const data = await response.json();
        //ProjectDetailStore.set(data);
        //console.log(data);
    })
</script>

{#if project}
    <p> Project found! </p>
{:else}
    {#if error}
        <p> 404 Error: No project found with ID. {data.id}!</p>
    {:else}
        <p> Loading... </p>
    {/if}
{/if}