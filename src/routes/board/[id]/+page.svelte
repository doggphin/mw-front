<script>
    import { PageNameStore, CurrentMainTab, ProjectWebsocket } from '$lib/scripts/mtd-store.js';
    import { boolToChar, getRandom } from '$lib/scripts/helpers.js';
    import { PUBLIC_IP_HTTP_BACKEND, PUBLIC_IP_WS_BACKEND } from '$env/static/public';
    import { widthConsts } from './widthConsts.js';
    import { setContext, onMount, onDestroy } from 'svelte';
    import ListContainer from '$lib/components/ListContainer.svelte';
    import TempMessage from '$lib/components/TempMessage.svelte';
    import Row from './components/Row.svelte';
    import TitleRow from './components/TitleRow.svelte';
    import YNColumn from './components/YNColumn.svelte';
    import CountColumn from './components/CountColumn.svelte';
    import TextColumn from './components/TextColumn.svelte';
    import TimerColumn from './components/TimerColumn.svelte';
    import ComputeColumn from './components/ComputeColumn.svelte';

    export let data;    // Gets page number from page.js

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
    let project;
    onMount(async () => {
        PageNameStore.set("");
        CurrentMainTab.set();
        const endpoint = `${PUBLIC_IP_HTTP_BACKEND}/projects/${data.id}`;
        const response = await fetch(endpoint, {method: "GET"});
        if(response.status == 200) {
            project = await response.json();
            PageNameStore.set(project["formatted_project_name"]);

            // REWRITE THIS
            if(project.hasOwnProperty("slides_job")) {
                tabsCache.push('Slides');
                defaults.slidesDpi = project['slides_job']['default_dpi'];
                defaults.slidesCorrect = boolToChar(project['slides_job']['correct'])
            }
            if(project.hasOwnProperty("prints_job")) {
                tabsCache.push('Prints');
                defaults.printsDpi = project['prints_job']['default_dpi'];
                defaults.printsCorrect = boolToChar(project['prints_job']['correct'])
            }
            if(project.hasOwnProperty("negatives_job")) {
                tabsCache.push('Negatives');
                defaults.negativesDpi = project['negatives_job']['default_dpi'];
                defaults.negativesCorrect = boolToChar(['negatives_job']['correct'])
            }

            if(tabsCache.length > 0) {
                CurrentMainTab.set(tabsCache[0]);
            }
        } else {
            PageNameStore.set("Project does not exist");
            error = 1;
        }
    });


    let myIdentifierToken = getRandom(-2147483648, 2147483647);
    let groupUpdateQueue = {
        'token': myIdentifierToken,
        'data': []
    };
    function addGroupUpdate(idx, col, val) {
        // Try to replace any previous updates with this update if possible
        for(let i=0; i<groupUpdateQueue.data.length; i++) {         
            if($CurrentMainTab == groupUpdateQueue.data[i].job && idx === groupUpdateQueue.data[i].idx && col === groupUpdateQueue.data[i].col) {
                groupUpdateQueue.data[i].val = val;
                return;
            }
        }
        groupUpdateQueue.data.push({
            'job' : $CurrentMainTab,
            'idx' : idx,
            'col' : col,
            'val' : val
        });
    }
    function sendUpdate() {
        if(groupUpdateQueue.data.length > 0) {
            $ProjectWebsocket.send(JSON.stringify(groupUpdateQueue));
            groupUpdateQueue.data = [];
        }
    }
    setInterval(sendUpdate, 500);
    setContext("addGroupUpdate", addGroupUpdate); 
    onDestroy(() => {       // Close websocket when going to another page
        if($ProjectWebsocket.readyState === 1) {
            $ProjectWebsocket.close();
        }
    })
    if($ProjectWebsocket != null) {
        $ProjectWebsocket.close();
    }
    ProjectWebsocket.set(new WebSocket(`${PUBLIC_IP_WS_BACKEND}/ws/project/${data.id}/`));
    $ProjectWebsocket.onclose = (e) => {
        console.log('Websocket connection closed!');
    };
    $ProjectWebsocket.onopen = (e) => {
        console.log("Websocket connection opened!");
    };
    $ProjectWebsocket.onmessage = (event) => {
        try {
            const msg = (JSON.parse(event.data))['message'];
            if(msg['token'] === myIdentifierToken) {
                return;
            }
            let photoJob = null;
            switch(msg['job']) {
                case 'slides_job':
                    //photoJob = slidesGroups;
                    slidesGroups[msg['idx']][msg['col']] = msg['val'];
                    break;
                case 'prints_job':
                    //photoJob = printsGroups;
                    printsGroups[msg['idx']][msg['col']] = msg['val'];
                    break;
                case 'negatives_job':
                    //photoJob = negativesGroups;
                    negativesGroups[msg['idx']][msg['col']] = msg['val'];
                    break;
            }
        } catch(Error) {
            error("Error reading websocket message.");
        }
    };


    let widths = {
        get slides() {
            return {
                "#" : widthConsts.index,
                "DPI" : widthConsts.dpi,
                "Corr." : widthConsts.corr, 
                "Scan" : widthConsts.number,
                "HS" : widthConsts.number,
                "Editing" : widthConsts.timer,
                "Comments" : widthConsts.comments,
                "" : widthConsts.compute
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
                "Count" : widthConsts.number,
                "HS" : widthConsts.number,
                "Comments" : widthConsts.comments
            }
        },
        getSumColumnWidthsRem: function(name) {
            return Object.entries(this[name]).reduce((a, [key, value]) => a + value, 0);
        },
        getColumnGapsPx: function(name) {
            // There is 7.5px of extra padding on either end of Row.svelte
            return 15 + (10 * (Object.entries(this[name]).length));    // Subtracts one from length to get gaps between columns, then add horizontal padding
        },
        getWidth: function(name) {
            let res = [this.getSumColumnWidthsRem(name), this.getColumnGapsPx(name)];
            return res;
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
            {#each Object.entries(slidesGroups || {}) as [idx, groupData], i}
                <Row showLine={i < Object.entries(slidesGroups).length - 1} dotted={true}>
                    <div class="idx">{idx}</div>
                    <div class="dpi">{"dpi" in groupData ? groupData["dpi"] : defaults.slidesDpi}</div>
                    <YNColumn bind:groupData idx={idx} defaultTo={defaults.slidesCorrect} name="correct"/>
                    <CountColumn bind:groupData idx={idx} name="scanner_count"/>
                    <CountColumn bind:groupData idx={idx} name="hs_count"/>
                    <TimerColumn idx={idx} value={"N/A"} name="editing_time"/>
                    <TextColumn bind:groupData idx={idx} name="comments"/>
                    <ComputeColumn project_id = {data.id} group_idx={idx} media_type="slides"/>
                </Row>
            {/each}
        {:else if $CurrentMainTab == "Prints"}
            <Row dotted={false}>
                <TitleRow titles={widths.prints}/>
            </Row>
            {#each Object.entries(printsGroups || {}) as [idx, groupData], i}
                <Row showLine={i < Object.entries(printsGroups).length - 1} dotted={true}>
                    <div class="idx">{idx}</div>
                    <div class="dpi">{"dpi" in groupData ? groupData["dpi"] : defaults.printsDpi}</div>
                    <YNColumn bind:groupData idx={idx} defaultTo={defaults.printsCorrect} name="correct"/>
                    <CountColumn bind:groupData idx={idx} name="lp_count"/>
                    <CountColumn bind:groupData idx={idx} name="hs_count"/>
                    <CountColumn bind:groupData idx={idx} name="oshs_count"/>
                    <TextColumn bind:groupData idx={idx} name="comments"/>
                </Row>
            {/each}
        {:else if $CurrentMainTab == "Negatives"}
            <Row>
                <TitleRow titles={widths.negatives}/>
            </Row>
            {#each Object.entries(negativesGroups || {}) as [idx, groupData], i}
                <Row showLine={i < Object.entries(negativesGroups).length - 1} dotted={true}>
                    <div class="idx">{idx}</div>
                    <div class="dpi">{"dpi" in groupData ? groupData["dpi"] : defaults.negativesDpi}</div>
                    <YNColumn bind:groupData idx={idx} defaultTo={defaults.negativesCorrect} name="correct"/>
                    <CountColumn bind:groupData idx={idx} name="strip_count"/>
                    <CountColumn bind:groupData idx={idx} name="images_count"/>
                    <CountColumn bind:groupData idx={idx} name="hs_count"/>
                    <TextColumn bind:groupData idx={idx} name="comments"/>
                </Row>
            {/each}
        {:else}
            <p class="temp-message">{"There's no media assigned to this project yet."}</p> 
        {/if}
    {:else}
        <TempMessage message={error ? `No project with ID ${data.id} exists.` : "Loading..."} />
    {/if}
</ListContainer>


<style>
    .idx {
        flex: 2 0 2rem;
    }
    .dpi {
        flex: 3 0 3rem;
    }
</style>