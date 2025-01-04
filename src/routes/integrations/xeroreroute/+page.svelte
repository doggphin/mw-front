<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { goto } from '$app/navigation';
    import { getBaseRequestHeader } from '$lib/scripts/helpers.js'
    import { PUBLIC_IP_HTTP_BACKEND } from '$env/static/public';

    let error = "";

    async function leaveWithError(err) {
        error = err;
        setTimeout(function() { goto("/integrations") }, 2000);
    }

    onMount(async() => {
        const code = $page.url.searchParams.get('code');

        if(!code) {
            leaveWithError("No code found! Please go through the Xero manual auth process.");
            return;
        }

        let request = getBaseRequestHeader("POST");
        const endpoint = `${PUBLIC_IP_HTTP_BACKEND}/xero/authorize_app/${code}/`;
        console.log(endpoint);
        const response = await fetch(endpoint, request);
        console.log(response.code);

        if(response.status != 200) {
            leaveWithError(`Error with handling code on backend: ${response.body}`);
            return;
        }
        
        console.log("Success!");
        goto("/integrations");
    });
</script>



{#if error}
    {error}
{/if}