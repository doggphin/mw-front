<script>
    import { onMount } from 'svelte';
    import { PageNameStore, CurrentMainTab, BACKENDIP } from '$lib/scripts/mtd-store.js';
    import { boolToString, enforceNumericInput } from '$lib/scripts/helpers.js'
    import ListContainer from '$lib/components/ListContainer.svelte'
    import ListContainerLineBreak from '$lib/components/ListContainerLineBreak.svelte'

    export let data;

    let error = 0;
    let tabsCache = [];
    let defaults = {
        slidesDpi : 1250,
        slidesCorrect : "N",

        printsDpi : 1250,
        printsCorrect : "N",

        negativesDpi : 3000,
        negativesCorrect : "N"
    };

    let project = {};
    onMount(async function() {
        PageNameStore.set("");
        CurrentMainTab.set();
        const endpoint = `${BACKENDIP}/projects/${data.id}`;
        const response = await fetch(endpoint, {method: "GET"});
        if(response.status == 200) {
            project = await response.json();
            PageNameStore.set(data["client_name_last"] + ", " + project["client_name_first"])
            
            if(project.hasOwnProperty("slides_job")) {
                tabsCache.push('Slides');
                defaults.slidesDpi = project['slides_job']['default_dpi'];
                defaults.slidesCorrect = boolToString(project['slides_job']['default_dpi'])
            }
            if(project.hasOwnProperty("prints_job")) {
                tabsCache.push('Prints');
                defaults.printsDpi = data['prints_job']['default_dpi'];
                defaults.printsCorrect = boolToString(project['prints_job']['default_dpi'])
            }
            if(project.hasOwnProperty("negatives_job")) {
                tabsCache.push('Negatives');
                defaults.negativesDpi = project['negatives_job']['default_dpi'];
                defaults.negativesCorrect = boolToString(['negatives_job']['default_dpi'])
            }

            if(tabsCache.length > 0) {
                CurrentMainTab.set(tabsCache[0]);
            }
        } else {
            PageNameStore.set("Error")
            error = 1;
        }
    });

    $: slidesGroups = project.hasOwnProperty("slides_job") ? project["slides_job"]["groups"] : null

    ///

    const roomSocket = new WebSocket(`ws://localhost:8000/ws/project/${data.id}/`);

    window.onbeforeunload = function() {
        roomSocket.onclose = function () {}; // disable onclose handler first
        roomSocket.close();
    };

    roomSocket.onmessage = function(event) {
        const msg = (JSON.parse(event.data))['message'];
        switch(msg['job']) {
            case 'Slides':
                // Since the reactive group elements need to be set directly, I don't think there's any way to simplify this..?
                slidesGroups[msg['idx']][msg['col']] = msg['val'];
                break;
            default:
                console.log("No job recognized!");
                return;
        }
    };

    roomSocket.onclose = function(e) {
        console.log('Websocket connection closed!');
    };

    roomSocket.onopen = function(e) {
        console.log("Websocket connection opened!");
    };

    function sendUpdate(idx, col, val) {
        let ret = {
            'job' : $CurrentMainTab,
            'idx' : idx,
            'col' : col,
            'val' : val.target.value
        }
        roomSocket.send(JSON.stringify(ret));
    }

    ///

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
    };
</script>


<ListContainer minWidthRem={listContainerWidth} tabs={tabsCache}>
    {#if project}
        {#if $CurrentMainTab == "Slides" && slidesGroups}
            <ol class="slides-group">
                <li> # </li>
                <li> DPI </li>
                <li> Corr. </li>
                <li> Normal </li>
                <li> HS </li>
                <li> Folder Name </li>
            </ol>
            <ListContainerLineBreak />
            {#each Object.entries(slidesGroups) as [idx, groupData]}
                <div class="slides-group">
                    <div>{idx}</div>
                    <div>{"dpi" in groupData ? groupData["dpi"] : defaults.slidesDpi}</div>
                    <div>{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.slidesCorrect}</div>
                    <input 
                        on:change={(val) => sendUpdate(idx, "final_scanner_count", val)} 
                        on:input={(text) => enforceNumericInput(text)} 
                        placeholder={groupData["intake_scanner_count"] ?? 0}
                        value={groupData["final_scanner_count"] ?? ""}
                    >
                    <input
                        on:change={(val) => sendUpdate(idx, "final_hs_count", val)} 
                        on:input={(text) => enforceNumericInput(text)} 
                        placeholder={groupData["intake_hs_count"] ?? 0}
                        value={groupData["final_hs_count"] ?? ""}
                    >
                    <input placeholder={groupData["name_folder"] ?? ""}>
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
            {#each Object.entries(project["prints_job"]["groups"]) as [index, groupData]}
                <div class="prints-group">
                    <div>{index}</div>
                    <div>{"dpi" in groupData ? groupData["dpi"] : defaults.printsDpi}</div>
                    <div>{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.printsCorrect}</div>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={groupData["intake_lp_count"] ?? 0}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={groupData["intake_hs_count"] ?? 0}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={groupData["intake_oshs_count"] ?? 0}>
                    <input placeholder={groupData["name_folder"] ?? ""}>
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
            {#each Object.entries(project["negatives_job"]["groups"]) as [index, groupData]}
                <div class="negatives-group">
                    <div>{index}</div>
                    <div>{"dpi" in groupData ? groupData["dpi"] : defaults.negativesDpi}</div>
                    <div>{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.negativesCorrect}</div>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={groupData["intake_strip_count"] ?? 0}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={groupData["intake_hs_count"] ?? 0}>
                    <input on:input={(text) => enforceNumericInput(text)} placeholder={groupData["intake_images_count"] ?? 0}>
                    <input placeholder={groupData["name_folder"] ?? ""}>
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



<style>
    /* https://stackoverflow.com/questions/23794713/how-can-i-have-two-fixed-width-columns-with-one-flexible-column-in-the-center
       LOOK AT THIS STUFF */
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