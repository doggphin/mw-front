<script>
    import SetNavName from '$lib/components/SetNavName.svelte';
    import { openNewTab, getBaseRequestHeader } from '$lib/scripts/helpers.js';
    import { onMount } from 'svelte';
    import { gotoLoginIfNotLoggedIn } from "$lib/scripts/login.js";
    import { PUBLIC_IP_HTTP_BACKEND, PUBLIC_XERO_FRONTEND_URL } from '$env/static/public';

    onMount( async () => {
        /*
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get('code');
        */

        if(!gotoLoginIfNotLoggedIn()) {
            return;
        }
    });

    async function startManualAuth() {
        const endpoint = `${PUBLIC_IP_HTTP_BACKEND}/xero/access_token_url/`;
        const request = getBaseRequestHeader("GET");
        console.log(request);
        const response = await fetch(endpoint, request);
        const jsonResponse = await response.json()
        
        console.log(jsonResponse);

        if(response.status == 200) {
            window.location = jsonResponse["url"];
        }
    }
</script>



<SetNavName name="External Integrations"/>
<div class="base-container">
    <button on:click={ () => openNewTab(`${PUBLIC_XERO_FRONTEND_URL}/dashboard`)}>
        <h3>Xero Page</h3>
    </button>
    <button on:click={ () => startManualAuth() }>
        <h3>Manual Auth</h3>
    </button>
</div>



<style>
    button {
        background-color: white;
    }
    button:hover {
        background-color: var(--clr-primary-5-1);
    }
</style>