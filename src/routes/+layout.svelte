<script>
    import { PageNameStore } from '$lib/scripts/mtd-store.js';

    import ListContainerLineBreak from '$lib/components/ListContainerLineBreak.svelte'
    import NavButton from "$lib/components/NavButton.svelte";
    import FolderImage from '$lib/assets/folder_open_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import ListImage from '$lib/assets/view_list_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import AddImage from '$lib/assets/add_circle_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import HubImage from '$lib/assets/hub_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import Logo from '$lib/assets/logo.svg';

    import { Modals, closeModal } from 'svelte-modals';
</script>

<div class="page">
    <nav>
        <a class="logo-space" href="/">
            <img src={Logo} alt="Alt text" />
        </a>
        <NavButton text="Project Board" iconSrc={ListImage} link="/board/"/>
        <NavButton text="My Projects" iconSrc={FolderImage} link="/board/myprojects/"/>
        <NavButton text="New Project" iconSrc={AddImage} link="/newproject/"/>
        <NavButton text="(Test) Xero" iconSrc={HubImage} link="/clients/"/>
    </nav>
    <div class="content">
        <div class="header">
            <h1 class="page-name">{$PageNameStore}</h1>
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
    @media only screen and (max-width: 768px) {
        :root {
            background-color: var(--clr-primary-5);
        }
        nav {
            position: fixed;
            display: flex;
            justify-content: left;
            background-color: var(--clr-primary-1);
            width: 100vw;
            height: 50px;
        }
        .logo-space {
            /*display: flex;
            width: 50px;
            height: 50px;*/
            display: none;
        }
        .backdrop {
            position: fixed;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            background: rgba(0,0,0,0.50);
            border: none;
        }
        .header {
            width: 100%;
            position: fixed;
            top: 50px;
            background-color: white;
            width: 100vw;
            height: 50px;
            border-bottom: calc(var(--gap-listcontainer) / 2);
            border-bottom: var(--border-size-med) solid var(--clr-primary-5-1);
            display: flex;
            container-type: inline-size;
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

    @media only screen and (min-width: 768px) {
        .backdrop {
            position: fixed;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            background: rgba(0,0,0,0.50);
            border: none;
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
            height: 75px;
            display: flex;
            container-type: inline-size;
            width: 100%;
            border-bottom: calc(var(--gap-listcontainer) / 2);
            border-bottom: var(--border-size-med) solid var(--clr-primary-5-1);
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
            top: 75px;
        }
    }
</style>