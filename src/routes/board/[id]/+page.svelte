<script>
    let isNumberKey = (evt) => {
        var charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }
    
    import { onMount } from 'svelte';
    import { PageNameStore, ProjectDetailStore, CurrentMainTab, BACKENDIP } from '$lib/scripts/mtd-store.js';
    import { enforceNumericInput } from '$lib/scripts/helpers.js'
    import ListContainer from '$lib/components/ListContainer.svelte'
    import ListContainerLineBreak from '$lib/components/ListContainerLineBreak.svelte'

    export let data;
    let project = null;
    let error = 0;

    let tabsCache = [];
    onMount(async function() {
        PageNameStore.set("");
        CurrentMainTab.set();
        const endpoint = `${BACKENDIP}/projects/${data.id}`;
        const response = await fetch(endpoint);
        if(response.status == 200) {
            const data = await response.json();
            ProjectDetailStore.set(data);
            project = data;
            PageNameStore.set(data["client_name_last"] + ", " + data["client_name_first"])
            
            if(data.hasOwnProperty("slides_job")) {
                tabsCache.push('Slides');
            };
            if(data.hasOwnProperty("prints_job")) {
                tabsCache.push('Prints');
            };
            if(data.hasOwnProperty("negatives_job")) {
                tabsCache.push('Negatives');
            };

            if(tabsCache.length > 0) {
                CurrentMainTab.set(tabsCache[0]);
            }
        } else {
            PageNameStore.set("Error")
            error = 1;
        }
    })

    let listContainerWidth = 0;
    $: $CurrentMainTab, updateContainerWidth();
    function updateContainerWidth() {
        switch($CurrentMainTab) {
            case "Slides":
                listContainerWidth = 25.5;
                break;
            case "Prints":
                listContainerWidth = 28;
                break;
            case "Negatives":
                listContainerWidth = 26;
                break;
            default:
                break;
        }
    }

</script>

<ListContainer minWidthRem={listContainerWidth} tabs={tabsCache}>
    {#if project}
        {#if $CurrentMainTab == "Slides"}
            <ol class="slides-group">
                <li> # </li>
                <li> DPI </li>
                <li> Corr. </li>
                <li> Normal </li>
                <li> HS </li>
                <li> Folder Name </li>
            </ol>
            <ListContainerLineBreak />
            {#each $ProjectDetailStore["slides_job"]["groups"] as group}
                <div class="slides-group">
                    <div>{group["index"]}</div>
                    <div>{group["dpi"]}</div>
                    <div>{group["is_to_be_corrected"] === true ? "Y": "N"}</div>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={group["intake_scanner_count"]}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={group["intake_hs_count"]}>
                    <input placeholder={group["name_folder"]}>
                </div>
            {/each}

        {:else if $CurrentMainTab == "Prints"}
            <ol class="prints-group">
                <li> # </li>
                <li> DPI </li>
                <li> Corr. </li>
                <li> LP </li>
                <li> HS </li>
                <li> OSHS </li>
                <li> Folder Name </li>
            </ol>
            <ListContainerLineBreak />
            {#each $ProjectDetailStore["prints_job"]["groups"] as group}
                <ol class="prints-group">
                    <li>{group["index"]}</li>
                    <li>{group["dpi"]}</li>
                    <li>{group["is_to_be_corrected"] === true ? "Y": "N"}</li>
                    <input on:input={(text) => enforceNumericInput(text)} style="width:80%;" placeholder={group["intake_lp_count"]}>
                    <input on:input={(text) => enforceNumericInput(text)} style="width:80%;" placeholder={group["intake_hs_count"]}>
                    <input on:input={(text) => enforceNumericInput(text)} style="width:80%;" placeholder={group["intake_oshs_count"]}>
                    <input placeholder={group["name_folder"]}>
                </ol>
            {/each}

        {:else if $CurrentMainTab == "Negatives"}
            <ol class="negatives-group">
                <li> # </li>
                <li> DPI </li>
                <li> Corr. </li>
                <li> Strips </li>
                <li> HS </li>
                <li> # Images </li>
                <li> Folder Name </li>
            </ol>
            <ListContainerLineBreak />
            {#each $ProjectDetailStore["prints_job"]["groups"] as group}
                <ol class="negatives-group">
                    <li>{group["index"]}</li>
                    <li>{group["dpi"]}</li>
                    <li>{group["is_to_be_corrected"] === true ? "Y": "N"}</li>
                    <input on:input={(text) => enforceNumericInput(text)} style="width:80%;" placeholder={group["intake_strip_count"]}>
                    <input on:input={(text) => enforceNumericInput(text)} style="width:80%;" placeholder={group["intake_hs_count"]}>
                    <input on:input={(text) => enforceNumericInput(text)} style="width:80%;" placeholder={group["intake_images_count"]}>
                    <input placeholder={group["name_folder"]}>
                </ol>
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

<!-- https://stackoverflow.com/questions/23794713/how-can-i-have-two-fixed-width-columns-with-one-flexible-column-in-the-center -->
<!-- LOOK AT THIS STUFF ^ -->
<style>
    .slides-group {
        display: grid;
        grid-template-columns: max(3rem,11.76%) max(3rem,11.76%) max(2.5rem,9.80%) max(4rem,15.68%) max(3rem,11.76%) max(10rem,39.21%);

        column-gap: 0px;
        padding: 10px 0px 10px 0px;
    }
    .prints-group {
        display: grid;
        grid-template-columns: max(3rem,5%) max(3rem,5%) max(2.5rem,5%) max(3rem,5%) max(3rem,5%) max(3.5rem,5%) max(10rem,70%);
        padding: 10px 0px 10px 10px;
    }
    .negatives-group {
        display: grid;
        grid-template-columns: max(3rem,5%) max(3rem,5%) max(2.5rem,5%) max(3rem,5%) max(3rem,5%) max(4.5rem,5%) max(10rem,70%);
        padding: 10px 0px 10px 10px;
    }
    .temp-message {
        width: 100%;
        text-align: center;
        padding: 20px 0px;
    }
</style>