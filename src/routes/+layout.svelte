<script>
    import NavButton from "./components/NavButton.svelte";
    import FolderImage from '$lib/assets/folder_open_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import ListImage from '$lib/assets/view_list_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import AddImage from '$lib/assets/add_circle_24dp_FILL0_wght400_GRAD0_opsz24.svg';
    import Logo from '$lib/assets/logo.svg';

    import {PageNameStore} from './mtd-store.js';
</script>


<div class="page">
    <nav>
        <a class="logo-space" href="/">
            <img src={Logo} alt="Alt text" />
        </a>
        <NavButton text="Project Board" iconSrc={ListImage} link="/board/"/>
        <NavButton text="My Projects" iconSrc={FolderImage} link="/myprojects/"/>
        <NavButton text="New Project" iconSrc={AddImage} link="/newproject"/>
    </nav>
    <div class="right">
        <div class="header">
            <h1 class="page-name">{$PageNameStore}</h1>
        </div>
        <div class="main-body">
            <slot />
        </div>
    </div>
</div>


<style>
    .page {
        display: flex;
    }
    :root {
        background-color: var(--clr-primary-5);
    }

    nav {
        position: fixed;
        background-color: var(--clr-primary-1);
        height: 100vh;
        width: 200px;
        z-index: 1;
    }   
    .logo-space {
        display: flex;
        margin-bottom: 20px;
        margin: 5%;
    }

    .right {
        position: relative;
        left: 200px;
        width: calc(100% - 200px);
    }
    .main-body {
        position: relative;
        top: 75px;
    }
    .header {
        width: 100%;
        position: fixed;
        background-color: white;
        height: 75px;
        z-index: 1;

        display: flex;
    }
    .page-name {
        margin: auto 0px auto 30px;
        font-weight: bold;
        transform: scale(1.1, 1);
    }
</style>