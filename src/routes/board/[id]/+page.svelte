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
    let slidesDefaultDpi = 1250;
    let slidesDefaultCorrect = "N"
    let printsDefaultDpi = 1250;
    let printsDefaultCorrect = "N"
    let negativesDefaultDpi = 3000;
    let negativesDefaultCorrect = "N"
    function boolToString(boolean) {
        return boolean ? "Y" : "N";
    }
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
                slidesDefaultDpi = data['slides_job']['default_dpi'];
                slidesDefaultCorrect = boolToString(data['slides_job']['default_dpi'])
            };
            if(data.hasOwnProperty("prints_job")) {
                tabsCache.push('Prints');
                printsDefaultDpi = data['prints_job']['default_dpi'];
                printsDefaultCorrect = boolToString(data['prints_job']['default_dpi'])
            };
            if(data.hasOwnProperty("negatives_job")) {
                tabsCache.push('Negatives');
                negativesDefaultDpi = data['negatives_job']['default_dpi'];
                negativesDefaultCorrect = boolToString(['negatives_job']['default_dpi'])
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
            {#each Object.entries($ProjectDetailStore["slides_job"]["groups"]) as [index, data]}
                <div class="slides-group">
                    <div>{index}</div>
                    <div>{"dpi" in data ? data["dpi"] : slidesDefaultDpi}</div>
                    <div>{"correct" in data ? boolToString(data["correct"]) : slidesDefaultCorrect}</div>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={data["intake_scanner_count"] ?? 0}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={data["intake_hs_count"] ?? 0}>
                    <input placeholder={data["name_folder"] ?? ""}>
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
            {#each Object.entries($ProjectDetailStore["prints_job"]["groups"]) as [index, data]}
                <div class="prints-group">
                    <div>{index}</div>
                    <div>{"dpi" in data ? data["dpi"] : printsDefaultDpi}</div>
                    <div>{"correct" in data ? boolToString(data["correct"]) : printsDefaultCorrect}</div>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={data["intake_lp_count"] ?? 0}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={data["intake_hs_count"] ?? 0}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={data["intake_oshs_count"] ?? 0}>
                    <input placeholder={data["name_folder"] ?? ""}>
                </div>
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
            {#each Object.entries($ProjectDetailStore["negatives_job"]["groups"]) as [index, data]}
                <div class="negatives-group">
                    <div>{index}</div>
                    <div>{"dpi" in data ? data["dpi"] : negativesDefaultDpi}</div>
                    <div>{"correct" in data ? boolToString(data["correct"]) : negativesDefaultCorrect}</div>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={data["intake_strip_count"] ?? 0}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={data["intake_hs_count"] ?? 0}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={data["intake_images_count"] ?? 0}>
                    <input placeholder={data["name_folder"] ?? ""}>
                </div>
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