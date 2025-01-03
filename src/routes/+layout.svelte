<script>
    import { PageNameStore } from '$lib/scripts/mtd-store.js';
    import { page } from '$app/stores';
    import { logOut, getIsLoggedIn, tryLoadUserStoresWithCookies, gotoLoginIfNotLoggedIn } from '$lib/scripts/login.js';
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import { Modals, closeModal } from 'svelte-modals';

    import NavButton from "$lib/components/NavButton.svelte";
    import ListImage from '$lib/assets/view_list_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import AddImage from '$lib/assets/add_circle_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import DnsImage from '$lib/assets/dns_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
    import HubImage from '$lib/assets/hub_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import Logo from '$lib/assets/logo.svg';

    let isLoggedIn = false;

    
    function onPageChange() {
        console.log('Page changed:', $page.url.pathname);
        isLoggedIn = getIsLoggedIn();

        if(!isLoggedIn) {
            goto("/login");
        }
    }


    let unsubscribe;
    onMount(() => {
        console.log("asdf");
        if(gotoLoginIfNotLoggedIn()) {
            tryLoadUserStoresWithCookies();
        }


        unsubscribe = page.subscribe(($page) => {
            onPageChange();
        });

        return () => {
            unsubscribe(); // Cleanup the subscription on component unmount
        };
    });

</script>

<div class="page">
    <nav>
        <a class="logo-space" href="/">
            <img src={Logo} alt="Alt text" />
        </a>
        <NavButton text="Project Board" iconSrc={ListImage} link="/board/"/>
        <NavButton text="Servers" iconSrc={DnsImage} link="/servers/"/>
        <NavButton text="New Project" iconSrc={AddImage} link="/newproject/"/>
        <NavButton text="(Test) Xero" iconSrc={HubImage} link="/clients/"/>
    </nav>
    <div class="content">
        <div class="header">
            <h1 class="page-name">{$PageNameStore}</h1>
            <a class="login-container" href="/login/">
                {#if !isLoggedIn }
                    <button class="login-button" href="/login/">
                        <h3> Log In </h3>
                    </button>
                {:else}
                    <button class="login-button" on:click={ logOut }>
                        <h3> Log Out </h3>
                    </button>
                {/if}
            </a>
        </div>
        <div class="main-body">
            <slot />
        </div>
    </div>
</div>

<Modals>
    <button
        slot="backdrop"
        class="backdrop"
        style="z-index:100;"
        on:click={closeModal}
    />
</Modals>

<style>
    :root {
        --header-height: 60px;
    }

    .login-container {
        align-content: center;
        display: flex;
        margin: auto;
        margin-right: 225px;
        gap: 20px;
    }

    .login-button {
        padding: 5px;
        width: 100px;
        height: 35px;
        align-content: center;
    }

    @media only screen and (max-width: 768px) {
        .login-container {  
            align-content: center;
            margin-right: 25px;
            padding: 0;
        }
        .page {
            display: fixed;
            right: 0px;
            left: 0px;
            top: 0px;
        }
        :root {
            background-color: var(--clr-primary-5);
        }
        nav {
            position: fixed;
            display: flex;
            justify-content: left;
            background-color: var(--clr-primary-1);
            height: 50px;
            left: 0px;
            right: 0px;
            top: 0px;
            z-index: 50;
        }
        .header {
            position: fixed;
            justify-content: space-between;
            display: flex;
            top: 50px;
            left: 0px;
            right: 0px;
            height: 60px;
            background-color: white;
            border-bottom: calc(var(--gap-listcontainer) / 2);
            border-bottom: var(--border-size-med) solid var(--clr-primary-5-1);
            z-index: 50;
        }
        .logo-space {
            display: none;
        }
        .backdrop {
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            background: rgba(0,0,0,0.50);
            border: none;
        }
        .page-name {
            margin: auto 0px auto 20px;
            font-weight: bold;
            font-size: 20px;
        }
        .main-body {
            position: relative;
            top: 100px;
        }
    }

    @media only screen and (min-width: 769px) {
        .backdrop {
            position: fixed;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            background: rgba(0,0,0,0.50);
            border: none;
            z-index: 75;
        }
        .page {
            display: flex;
        }
        :root {
            background-color: var(--clr-primary-5);
        }
        .content {
            position: relative;
            left: 200px;
            width: calc(100% - 200px);
        }
        .header {
            width: 100%;
            position: fixed;
            background-color: white;
            height: var(--header-height);
            display: flex;
            container-type: inline-size;
            width: 100%;
            border-bottom: var(--border-size-med) solid var(--clr-primary-5-1);
            z-index: 10;
        }
        /* https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries */
        /* Try to use this instead */
        .page-name {
            margin: auto 0px auto 20px;
            font-weight: bold;
            font-size: 25px;
            width: calc(100% - 300px);
        }
        nav {
            position: fixed;
            background-color: var(--clr-primary-1);
            height: 100vh;
            width: 200px;
        }   
        .logo-space {
            display: flex;
            margin-bottom: 20px;
            margin: 5%;
            text-overflow: ellipsis;
        }
        .main-body {
            position: relative;
            top: var(--header-height);
        }
    }

    .header {
        align-content: center;
    }
</style>