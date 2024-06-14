<script>
    import { onMount } from 'svelte';
    import { PageNameStore, CurrentMainTab, BACKENDIP } from '$lib/scripts/mtd-store.js';
    import { boolToString, enforceNumericInput } from '$lib/scripts/helpers.js';
    import ListContainer from '$lib/components/ListContainer.svelte';
    import ListContainerLineBreak from '$lib/components/ListContainerLineBreak.svelte';

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

    $: slidesGroups = project?.["slides_job"]?.["groups"];
    $: printsGroups = project?.["prints_job"]?.["groups"];
    $: negativesGroups = project?.["negatives_job"]?.["groups"];

    let project = {};
    onMount(async function() {
        PageNameStore.set("");
        CurrentMainTab.set();
        const endpoint = `${BACKENDIP}/projects/${data.id}`;
        const response = await fetch(endpoint, {method: "GET"});
        if(response.status == 200) {
            project = await response.json();
            PageNameStore.set(project["client_name_last"] + ", " + project["client_name_first"])

            if(project.hasOwnProperty("slides_job")) {
                tabsCache.push('Slides');
                defaults.slidesDpi = project['slides_job']['default_dpi'];
                defaults.slidesCorrect = boolToString(project['slides_job']['default_dpi'])
            }
            if(project.hasOwnProperty("prints_job")) {
                tabsCache.push('Prints');
                defaults.printsDpi = project['prints_job']['default_dpi'];
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

    ///

    import { onDestroy } from 'svelte'

    const roomSocket = new WebSocket(`ws://localhost:8000/ws/project/${data.id}/`);
    // Close websocket when going to another page
    onDestroy(() => {
        if(roomSocket.readyState === 1) {
            roomSocket.close();
        }
    })

    roomSocket.onclose = function(e) {
        console.log('Websocket connection closed!');
    };

    roomSocket.onopen = function(e) {
        console.log("Websocket connection opened!");
    };

    roomSocket.onmessage = function(event) {
        try {
            const msg = (JSON.parse(event.data))['message'];
            switch(msg['job']) {
                // Reactive group elements need to be set directly, I don't think there's a way to clean this up
                case 'slides_job':
                    slidesGroups[msg['idx']][msg['col']] = msg['val'];
                    break;
                case 'prints_job':
                    printsGroups[msg['idx']][msg['col']] = msg['val'];
                    break;
                case 'negatives_job':
                    console.log("negatives received!");
                    negativesGroups[msg['idx']][msg['col']] = msg['val'];
                    break;
                default:
                    return;
            }
        } catch(Error) {
            error("Error reading websocket message.");
        }
    };

    function sendUpdate(idx, col, val) {
        console.log("Sending a message!");
        let msg = {
            'job' : $CurrentMainTab,
            'idx' : idx,
            'col' : col,
            'val' : val.target.value
        }
        roomSocket.send(JSON.stringify(msg));
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
                <li> Comments </li>
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
                    <input 
                        on:change={(text) => sendUpdate(idx, "comments", text)}
                        placeholder={groupData["comments"] ?? ""}
                        value={groupData["comments"] ?? ""}
                    >
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
                <li> Comments </li>
            </ol>
            <ListContainerLineBreak />
            {#each Object.entries(printsGroups) as [idx, groupData]}
                <div class="prints-group">
                    <div>{idx}</div>
                    <div>{"dpi" in groupData ? groupData["dpi"] : defaults.printsDpi}</div>
                    <div>{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.printsCorrect}</div>
                    <input 
                        on:input={(text) => enforceNumericInput(text)} 
                        placeholder={groupData["intake_lp_count"] ?? 0}
                        on:change={(val) => sendUpdate(idx, "final_lp_count", val)}
                        value={groupData["final_lp_count"] ?? ""}
                    >
                    <input 
                        on:input={(text) => enforceNumericInput(text)} 
                        placeholder={groupData["intake_hs_count"] ?? 0}
                        on:change={(val) => sendUpdate(idx, "final_hs_count", val)}
                        value={groupData["final_hs_count"] ?? ""}
                    >
                    <input
                        on:input={(text) => enforceNumericInput(text)}
                        placeholder={groupData["intake_oshs_count"] ?? 0}
                        on:change={(val) => sendUpdate(idx, "final_oshs_count", val)}
                        value={groupData["final_oshs_count"] ?? ""}
                    >
                    <input 
                        on:change={(val) => sendUpdate(idx, "comments", val)}
                        value={groupData["comments"] ?? ""}
                    >
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
                <li> Comments </li>
            </ol>
            <ListContainerLineBreak />
            {#each Object.entries(negativesGroups) as [idx, groupData]}
                <div class="negatives-group">
                    <div>{idx}</div>
                    <div>{"dpi" in groupData ? groupData["dpi"] : defaults.negativesDpi}</div>
                    <div>{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.negativesCorrect}</div>
                    <input 
                        on:input={(text) => enforceNumericInput(text)} 
                        placeholder={groupData["intake_strip_count"] ?? 0}
                        on:change={(val) => sendUpdate(idx, "final_strip_count", val)}
                        value={groupData["final_strip_count"] ?? ""}
                    >
                    <input 
                        on:input={(text) => enforceNumericInput(text)} 
                        placeholder={groupData["intake_hs_count"] ?? 0}
                        on:change={(val) => sendUpdate(idx, "final_hs_count", val)}
                        value={groupData["final_hs_count"] ?? ""}
                    >
                    <input
                        on:input={(text) => enforceNumericInput(text)}
                        placeholder={groupData["intake_images_count"] ?? 0}
                        on:change={(val) => sendUpdate(idx, "final_images_count", val)}
                        value={groupData["final_images_count"] ?? ""}
                    >
                    <input 
                        on:change={(val) => sendUpdate(idx, "comments", val)}
                        value={groupData["comments"] ?? ""}
                    >
                </div>
            {/each}

        {/if}
    {:else}
        {#if error}
            <p class="temp-message"> TestNo project found with ID {data.id}.</p>
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