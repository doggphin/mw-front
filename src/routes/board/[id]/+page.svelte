<script>
    import { PageNameStore, CurrentMainTab, ProjectWebsocket, BACKENDIP } from '$lib/scripts/mtd-store.js';
    import { boolToString } from '$lib/scripts/helpers.js';
    import { widthConsts } from './widthConsts.js';
    import { setContext, onMount, onDestroy } from 'svelte';

    import ListContainer from '$lib/components/ListContainer.svelte';
    import ListContainerLineBreak from '$lib/components/ListContainerLineBreak.svelte';
    import Row from './components/Row.svelte';
    import TitleRow from './components/TitleRow.svelte';
    import CountColumn from './components/CountColumn.svelte';
    import TextColumn from './components/TextColumn.svelte';

    export let data;    // Gets page number from page.js

    /// IMPORT DATA ///

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

            // REWRITE THIS
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

    /// WEBSOCKETS ///

    function sendUpdate(idx, col, val) {
        let json = {
            'job' : $CurrentMainTab,
            'idx' : idx,
            'col' : col,
            'val' : val
        };
        $ProjectWebsocket.send(JSON.stringify(json));
    }
    setContext("sendGroupUpdate", sendUpdate);

    onDestroy(() => {       // Close websocket when going to another page
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
            let photoJob = null;
            switch(msg['job']) {
                case 'slides_job':
                    photoJob = slidesGroups;
                    break;
                case 'prints_job':
                    photoJob = printsGroups;
                    break;
                case 'negatives_job':
                    photoJob = negativesGroups;
                    break;
            }
            if(photoJob) {
                photoJob[msg['idx']][msg['col']] = msg['val'];
            } else {
                console.error(`Unrecognized socket message where job = ${msg['job']}`);
            }
        } catch(Error) {
            error("Error reading websocket message.");
        }
    };

    /// WIDTHS ///

    let widths = {
        get slides() {
            return {
                "#" : widthConsts.index,
                "DPI" : widthConsts.dpi,  
                "Corr." : widthConsts.corr, 
                "Scan" : widthConsts.number,
                "HS" : widthConsts.number,
                "Comments" : widthConsts.comments
            }
        },
        get prints() {
            return {
                "#" : widthConsts.index,
                "DPI" : widthConsts.dpi,  
                "Corr." : widthConsts.corr, 
                "LP" : widthConsts.number,
                "HS" : widthConsts.number,
                "OSHS" : widthConsts.number,
                "Comments" : widthConsts.comments
            }
        },
        get negatives() {
            return {
                "#" : widthConsts.index,
                "DPI" : widthConsts.dpi,  
                "Corr." : widthConsts.corr, 
                "Strips" : widthConsts.number,
                "HS" : widthConsts.number,
                "Count" : widthConsts.number,
                "Comments" : widthConsts.comments
            }
        },
        getSumColumnWidthsRem: function(name) {
            return Object.entries(this[name]).reduce((a, [key, value]) => a + value, 0);
        },
        getColumnGapsPx: function(name) {
            return 10 * (Object.entries(this[name]).length - 1 + 2);    // Subtracts one from length to get gaps between columns, then add horizontal padding
        },
        getWidth: function(name) {
            return [this.getSumColumnWidthsRem(name), this.getColumnGapsPx(name)];
        }
    }

    let listContainerMinWidthRem = 0;
    let listContainerMinWidthPx = 0;
    $: $CurrentMainTab, setWidths()
    function setWidths() {
        if($CurrentMainTab && $CurrentMainTab != "") {
            [listContainerMinWidthRem, listContainerMinWidthPx] = widths.getWidth($CurrentMainTab.toLowerCase());
        }
    };
</script>


<ListContainer minWidthRem={listContainerMinWidthRem} minWidthPx={listContainerMinWidthPx} tabs={tabsCache}>
    {#if project}
        {#if $CurrentMainTab == "Slides" && slidesGroups}
            <Row>
                <TitleRow titles={widths.slides}/>
            </Row>
            <ListContainerLineBreak/>
            {#each Object.entries(slidesGroups || {}) as [idx, groupData]}
                <Row>
                    <div class="idx">{idx}</div>
                    <div class="dpi">{"dpi" in groupData ? groupData["dpi"] : defaults.slidesDpi}</div>
                    <div class="corr">{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.slidesCorrect}</div>
                    <CountColumn idx={idx} intake={groupData.intake_scanner_count} final={groupData.final_scanner_count} name="final_scanner_count"/>
                    <CountColumn idx={idx} intake={groupData.intake_hs_count} final={groupData.final_hs_count} name="final_hs_count"/>
                    <TextColumn idx={idx} value={groupData.comments} name="comments"/>
                </Row>
            {/each}
        {:else if $CurrentMainTab == "Prints"}
            <Row>
                <TitleRow titles={widths.prints}/>
            </Row>
            <ListContainerLineBreak/>
            {#each Object.entries(printsGroups || {}) as [idx, groupData]}
                <Row>
                    <div class="idx">{idx}</div>
                    <div class="dpi">{"dpi" in groupData ? groupData["dpi"] : defaults.printsDpi}</div>
                    <div class="corr">{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.printsCorrect}</div>
                    <CountColumn idx={idx} intake={groupData.intake_lp_count} final={groupData.final_lp_count} name="final_lp_count"/>
                    <CountColumn idx={idx} intake={groupData.intake_hs_count} final={groupData.final_hs_count} name="final_hs_count"/>
                    <CountColumn idx={idx} intake={groupData.intake_oshs_count} final={groupData.final_oshs_count} name="final_oshs_count"/>
                    <TextColumn idx={idx} value={groupData.comments} name="comments"/>
                </Row>
            {/each}
        {:else if $CurrentMainTab == "Negatives"}
            <Row>
                <TitleRow titles={widths.negatives}/>
            </Row>
            <ListContainerLineBreak/>
            {#each Object.entries(negativesGroups || {}) as [idx, groupData]}
                <Row>
                    <div class="idx">{idx}</div>
                    <div class="dpi">{"dpi" in groupData ? groupData["dpi"] : defaults.negativesDpi}</div>
                    <div class="corr">{"correct" in groupData ? boolToString(groupData["correct"]) : defaults.negativesCorrect}</div>
                    <CountColumn idx={idx} intake={groupData.intake_strip_count} final={groupData.final_strip_count} name="final_strip_count"/>
                    <CountColumn idx={idx} intake={groupData.intake_hs_count} final={groupData.final_hs_count} name="final_hs_count"/>
                    <CountColumn idx={idx} intake={groupData.intake_images_count} final={groupData.final_images_count} name="final_images_count"/>
                    <TextColumn idx={idx} value={groupData.comments} name="comments"/>
                </Row>
            {/each}
        {/if}
    {:else}
        <p class="temp-message">{error ? "No project found with ID {data.id}." : "Loading..."}</p>
    {/if}
</ListContainer>


<style>
    .idx {
        flex: 2 0 2rem;
    }
    .dpi {
        flex: 3 0 3rem;
    }
    .corr {
        flex: 2.5 0 2.5rem;
    }
    .temp-message {
        width: 100%;
        text-align: center;
        padding: 20px 0px;
    }
</style>