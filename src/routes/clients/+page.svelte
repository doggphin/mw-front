<script>
    import SetNavName from '$lib/components/SetNavName.svelte';
    import { onMount } from 'svelte';
    import { PUBLIC_IP_HTTP_FRONTEND } from '$env/static/public';

    onMount( async () => {
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get('code');
        if(!code) {
            console.log("Going");
            window.location = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=CB3EAB746CAE461380D3DE5F2C0421BC&redirect_uri=${PUBLIC_IP_HTTP_FRONTEND}/clients&scope=offline_access accounting.transactions openid profile email accounting.contacts accounting.settings&state=123`;
        } else {
            console.log("test");
            console.log(code);
        }
    });

    console.log("bruh");
    
</script>
<SetNavName name="Clients"/>


<div>
    <a href="https://login.xero.com/identity/connect/authorize?response_type=code&client_id=CB3EAB746CAE461380D3DE5F2C0421BC&redirect_uri=${PUBLIC_IP_HTTP_FRONTEND}&scope=offline_access accounting.transactions openid profile email accounting.contacts accounting.settings&state=123">
        click me!
    </a>
</div>

<!--     /** @type {import('./$types').PageLoad} */
    onMount( async () => {
        console.log("test");
        
    }); -->