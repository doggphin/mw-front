<script>
    import { onMount } from 'svelte';
    import { PUBLIC_IP_HTTP_BACKEND } from '$env/static/public';
    import { PageNameStore } from '$lib/scripts/mtd-store.js'
    import ListContainer from "$lib/components/ListContainer.svelte";

    let routers = [];
    onMount(async() => {
        PageNameStore.set("Server Status");
        Object.entries(ROUTERIPS).map(async entry => {
            /*
            let response = await fetch(`http://${entry[1]}:7000/status`, {method: "GET"});
            let router = await response.json();

            response = await fetch(`http://${entry[1]}:7000/status/computeunits`, {method: "GET"});
            const computeUnits = await response.json();

            router.computeUnits = computeUnits;
            router.name = entry[0];
            routers.push(router);

            console.log(router);
            routers = routers;
            */
        });
    })
</script>

{#each routers as router}
    <div>
        {router.name} : {router.status}
    </div>
    <div>
        {#each router.computeUnits as computeUnit}
            {computeUnit.name} : {computeUnit.current_status}
        {/each}
    </div>
{/each}

