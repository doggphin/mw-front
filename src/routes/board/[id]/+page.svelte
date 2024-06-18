<script>
    import { onMount } from 'svelte';
    import { PageNameStore, CurrentMainTab, ProjectWebsocket, BACKENDIP } from '$lib/scripts/mtd-store.js';
    import { boolToString } from '$lib/scripts/helpers.js';
    import { setContext } from 'svelte';
    import CountColumn from './components/CountColumn.svelte';
    import TextColumn from './components/TextColumn.svelte';
    import ListContainer from '$lib/components/ListContainer.svelte';
    import ListContainerLineBreak from '$lib/components/ListContainerLineBreak.svelte';

    function sendUpdate(idx, col, val) {
        let json = {
            'job' : $CurrentMainTab,
            'idx' : idx,
            'col' : col,
            'val' : val
        };
        console.log(json);
        $ProjectWebsocket.send(JSON.stringify(json));
    }
    setContext("sendGroupUpdate", sendUpdate);

    export let data;

    let error = 0;
    let tabsCache = [];
    let defaults = {
        slidesDpi : 1250,
        slidesCorrect : "N",
        printsDpi : 300,
        printsCorrect : "N",
        negativesDpi : 1500,
        negativesCorrect : "N"
    };

    $: slidesGroups = project?.["slides_job"]?.["groups"];
    $: printsGroups = project?.["prints_job"]?.["groups"];
    $: negativesGroups = project?.["negatives_job"]?.["groups"];

    let project = {};
    onMount(async () => {
        PageNameStore.set("");
        CurrentMainTab.set();
        const endpoint = `${BACKENDIP}/projects/${data.id}`;
        const response = await fetch(endpoint, {method: "GET"});
        if(response.status == 200) {
            project = await response.json();
            PageNameStore.set(project["formatted_project_name"]);

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
            PageNameStore.set("Error");
            error = 1;
        }
    });

    ///

    import { onDestroy } from 'svelte';

    // Close websocket when going to another page
    onDestroy(() => {
        if($ProjectWebsocket.readyState === 1) {
            $ProjectWebsocket.close();
        }
    })

    if($ProjectWebsocket != null) {
        $ProjectWebsocket.close();
    }
    ProjectWebsocket.set(new WebSocket(`ws://localhost:8000/ws/project/${data.id}/`));

    $ProjectWebsocket.onclose = (e) => {
        console.log('Websocket connection closed!');
    };

    $ProjectWebsocket.onopen = (e) => {
        console.log("Websocket connection opened!");
    };

    $ProjectWebsocket.onmessage = (event) => {
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
                    negativesGroups[msg['idx']][msg['col']] = msg['val'];
                    break;
                default:
                    console.error(`Unrecognized socket message where job = ${msg['job']}`);
                    return;
            }
        } catch(Error) {
            error("Error reading websocket message.");
        }
    };

    ///

    let widths = {
        // rem widths
        index: 2,
        dpi: 3,
        corr: 2.5,
        count: 4,
        comments: 10,

        get slides() {
            return [this.index, this.dpi,   this.corr,  this.count, this.count, this.comments];
        },
        get prints() {
            return [this.index, this.dpi,   this.corr,  this.count, this.count, this.count, this.comments];
        },
        get negatives() {
            return [this.index, this.dpi,   this.corr,  this.count, this.count, this.count, this.comments];
        },
        widthRem: function(name) {
            return this[name].reduce((a, b) => a + b, 0);   // Rem of all column types summed up
        },
        widthGaps: function(name) {
            let ret = (this[name].length - 1 + 2) * 10;    // Subtract one from length to get gaps, then add horizontal padding
            // Add 5px horizontal padding for every input field (this is fucky and WILL break if anything else is the same width as these)
            ret += this[name].reduce((a, b) => b === this.count || b === this.comments ? a + 10 : a, 0);    
            return ret;
        },
        getWidths: function(name) {
            return [this.widthRem(name), this.widthGaps(name)];
        }
    }

    let listContainerMinWidthRem = 0;
    let listContainerMinWidthPx = 0;
    $: $CurrentMainTab, setWidths()
    function setWidths() {
        if($CurrentMainTab && $CurrentMainTab != "") {
            [listContainerMinWidthRem, listContainerMinWidthPx] = widths.getWidths($CurrentMainTab.toLowerCase());
        }
    };
</script>


<ListContainer minWidthRem={listContainerMinWidthRem} minWidthPx={listContainerMinWidthPx} tabs={tabsCache}>
    {#if project}
        {#if $CurrentMainTab == "Slides" && slidesGroups}
            <ol class="group">
                <li class="idx"> # </li>
                <li class="dpi"> DPI </li>
                <li class="corr"> Corr. </li>
                <li class="count"> Normal </li>
                <li class="count"> HS </li>
                <li class="comments"> Comments </li>
            </ol>
            <ListContainerLineBreak />
            {#each Object.entries(slidesGroups || {}) as [idx, groupData]}
                <div class="group">
                    <div class="idx">{idx}</div>
                    <div class="dpi">{"dpi" in groupData ? groupData["dpi"] : defaults.slidesDpi}</div>
                    <div class="corr">{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.slidesCorrect}</div>
                    <CountColumn idx={idx} intakeAttr={groupData.intake_scanner_count} finalAttr={groupData.final_scanner_count} updateName="final_scanner_count"/>
                    <CountColumn idx={idx} intakeAttr={groupData.intake_hs_count} finalAttr={groupData.final_hs_count} updateName="final_hs_count"/>
                    <TextColumn idx={idx} currentValue={groupData.comments} updateName="comments"/>
                </div>
            {/each}

        {:else if $CurrentMainTab == "Prints"}
            <ol class="group">
                <li class="idx"> # </li>
                <li class="dpi"> DPI </li>
                <li class="corr"> Corr. </li>
                <li class="count"> LP </li>
                <li class="count"> HS </li>
                <li class="count"> OSHS </li>
                <li class="comments"> Comments </li>
            </ol>
            <ListContainerLineBreak />
            {#each Object.entries(printsGroups || {}) as [idx, groupData]}
                <div class="group">
                    <div class="idx">{idx}</div>
                    <div class="dpi">{"dpi" in groupData ? groupData["dpi"] : defaults.printsDpi}</div>
                    <div class="corr">{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.printsCorrect}</div>
                    <CountColumn idx={idx} intakeAttr={groupData.intake_lp_count} finalAttr={groupData.final_lp_count} updateName="final_lp_count"/>
                    <CountColumn idx={idx} intakeAttr={groupData.intake_hs_count} finalAttr={groupData.final_hs_count} updateName="final_hs_count"/>
                    <CountColumn idx={idx} intakeAttr={groupData.intake_oshs_count} finalAttr={groupData.final_oshs_count} updateName="final_oshs_count"/>
                    <TextColumn idx={idx} currentValue={groupData.comments} updateName="comments"/>
                </div>
            {/each}

        {:else if $CurrentMainTab == "Negatives"}
            <ol class="group">
                <li class="idx"> # </li>
                <li class="dpi"> DPI </li>
                <li class="corr"> Corr. </li>
                <li class="count"> Strips </li>
                <li class="count"> HS </li>
                <li class="count"> # Images </li>
                <li class="comments"> Comments </li>
            </ol>
            <ListContainerLineBreak />
            {#each Object.entries(negativesGroups || {}) as [idx, groupData]}
                <div class="group">
                    <div class="idx">{idx}</div>
                    <div class="dpi">{"dpi" in groupData ? groupData["dpi"] : defaults.negativesDpi}</div>
                    <div class="corr">{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.negativesCorrect}</div>
                    <CountColumn idx={idx} intakeAttr={groupData.intake_strip_count} finalAttr={groupData.final_strip_count} updateName="final_strip_count"/>
                    <CountColumn idx={idx} intakeAttr={groupData.intake_hs_count} finalAttr={groupData.final_hs_count} updateName="final_hs_count"/>
                    <CountColumn idx={idx} intakeAttr={groupData.intake_images_count} finalAttr={groupData.final_images_count} updateName="final_images_count"/>
                    <TextColumn idx={idx} currentValue={groupData.comments} updateName="comments"/>
                </div>
            {/each}

        {/if}
    {:else}
        {#if error}
            <p class="temp-message"> No project found with ID {data.id}.</p>
        {:else}
            <p class="temp-message"> Loading... </p>
        {/if}
    {/if}
</ListContainer>



<style>
    .group {
        display: flex;
        align-items: center;
        column-gap: 10px;
        padding: 7.5px 10px;
    }
    .idx {
        flex: 2 0 2rem; 
    }
    .dpi {
        flex: 3 0 3rem;
    }
    .corr {
        flex: 2.5 0 2.5rem;
    }
    .count {
        flex: 4 0 4rem;
    }
    .comments {
        flex: 10 0 10rem;
    }
    .temp-message {
        width: 100%;
        text-align: center;
        padding: 20px 0px;
    }
</style>