<script>
    import { PageNameStore, CurrentMainTab, ProjectWebsocket } from '$lib/scripts/mtd-store.js';
    import { boolToChar, getRandom } from '$lib/scripts/helpers.js';
    import { PUBLIC_IP_HTTP_BACKEND, PUBLIC_IP_WS_BACKEND } from '$env/static/public';
    import { widthConsts } from './widthConsts.js';
    import { setContext, onMount, onDestroy } from 'svelte';
    import ListContainer from '$lib/components/ListContainer.svelte';
    import TempMessage from '$lib/components/TempMessage.svelte';
    import Row from './components/Row.svelte';
    import ListContainerLineBreak from "$lib/components/ListContainerLineBreak.svelte";
    import TitleRow from './components/TitleRow.svelte';
    import YNColumn from './components/YNColumn.svelte';
    import DpiColumn from './components/DpiColumn.svelte';
    import CountColumn from './components/CountColumn.svelte';
    import TextColumn from './components/TextColumn.svelte';
    import EditingColumn from './components/EditingColumn.svelte';
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

    // Requests this project from the database
    async function getProjectData() {
        const endpoint = `${PUBLIC_IP_HTTP_BACKEND}/projects/${data.id}`;
        const response = await fetch(endpoint, {method: "GET"});
        if(response.status == 200) {
            project = await response.json();
            PageNameStore.set(project["formatted_project_name"]);
            
            // Function for sorting a job by ID.
            function compareGroups(a, b) {
                if (a["id"] < b["id"]) {
                    return -1
                }
                if (a["id"] > b["id"]) {
                    return 1;
                }
                return 0;
            }

            // REWRITE THIS
            if(project.hasOwnProperty("slides_job")) {
                tabsCache.push('Slides');
                defaults.slidesDpi = project['slides_job']['default_dpi'];
                defaults.slidesCorrect = boolToChar(project['slides_job']['correct'])
                project["slides_job"]["groups"].sort(compareGroups);
            }
            if(project.hasOwnProperty("prints_job")) {
                tabsCache.push('Prints');
                defaults.printsDpi = project['prints_job']['default_dpi'];
                defaults.printsCorrect = boolToChar(project['prints_job']['correct'])
                project["prints_job"]["groups"].sort(compareGroups);
            }
            if(project.hasOwnProperty("negatives_job")) {
                tabsCache.push('Negatives');
                defaults.negativesDpi = project['negatives_job']['default_dpi'];
                defaults.negativesCorrect = boolToChar(['negatives_job']['correct'])
                project["negatives_job"]["groups"].sort(compareGroups);
            }

            if(tabsCache.length > 0) {
                CurrentMainTab.set(tabsCache[0]);
            }
        } else {
            PageNameStore.set("Project does not exist");
            error = 1;
        }
    }

    // When this page loads, reset the page name (will be set in getProjectData), reset the current tab and request this project's data
    onMount(async () => {
        PageNameStore.set("");
        CurrentMainTab.set();
        getProjectData();
    });

    // An identifier token is attached to modification requests to (until profiles are set up) determine what session sent it
    // If a frontend session receives an update, if it came from themselves, it is ignored.
    let myIdentifierToken = getRandom(-2147483648, 2147483647);
    let groupUpdateQueue = {
        'token': myIdentifierToken,
        'type': "update_group",
        'data': {
            'token' : myIdentifierToken,
            'updates' : []
        }
    };
    // Adds an update to append to the list of updates to intermittently send to the server.
    function addGroupUpdate(idx, col, val) {
        // Try to replace any previous updates with this update if possible
        for(let i=0; i<groupUpdateQueue.data.updates.length; i++) {         
            if($CurrentMainTab == groupUpdateQueue.data.updates[i].job
            && idx === groupUpdateQueue.updates.data[i].idx
            && col === groupUpdateQueue.updates.data[i].col) {
                groupUpdateQueue.data.updates[i].val = val;
                return;
            }
        }
        groupUpdateQueue.data.updates.push({
            'job' : $CurrentMainTab,
            'idx' : idx,
            'col' : col,
            'val' : val
        });
    }
    setContext("addGroupUpdate", addGroupUpdate); 
    
    // Sends the group update queue off to the server to update the database
    function sendGroupUpdates() {
        if(groupUpdateQueue.data.updates.length > 0) {
            $ProjectWebsocket.send(JSON.stringify(groupUpdateQueue));
            groupUpdateQueue.data.updates = [];
        }
    }
    // Have this run every 500ms
    setInterval(sendGroupUpdates, 500);

    // Send a request to the server to insert a group at the specified index
    function sendInsertIdxRequest(idx) {
        let request = {
            "type" : "insert_group",
            "data" : {
                "job" : $CurrentMainTab,
                "idx" : idx
            }
        };
        $ProjectWebsocket.send(JSON.stringify(request));
    }
    setContext("sendInsertIdxRequest", sendInsertIdxRequest);

    if($ProjectWebsocket != null) {
        $ProjectWebsocket.close();
    }
    ProjectWebsocket.set(new WebSocket(`${PUBLIC_IP_WS_BACKEND}/ws/project/${data.id}/`));
    $ProjectWebsocket.onclose = (e) => {
        console.log('Websocket connection closed! Attempting to reconnect...');
        ProjectWebsocket.set(new WebSocket(`${PUBLIC_IP_WS_BACKEND}/ws/project/${data.id}/`));
    };
    $ProjectWebsocket.onopen = (e) => {
        console.log("Websocket connection opened!");
    };
    $ProjectWebsocket.onmessage = (event) => {
        try {
            const event_json = JSON.parse(event.data);
            const msg = event_json['message'];
            switch(event_json['type']) {

                case "projects.update_idx":
                    // If the token on this update is the same as my current token, that means I sent it, so it can be ignored
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
                    error("Error reading websocket message : Invalid job!");
                
                case "projects.force_update":
                    getProjectData();
                    break;
            }
            
        } catch(Error) {
            error("Error reading websocket message : Unknown error.");
        }
    };
    onDestroy(() => {       // Close websocket when going to another page
        if($ProjectWebsocket.readyState === 1) {
            $ProjectWebsocket.close();
        }
    })

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
            <ol>
                <TitleRow titles={widths.slides}/>
            </ol>
            <ListContainerLineBreak insertAtIdx=1/>
            {#each Object.entries(slidesGroups || {}) as [idx, groupData], i}
                <ol>
                    <div class="idx">{groupData.id}</div>
                    <DpiColumn bind:groupData idx={groupData.id} defaultTo={defaults.slidesDpi} options={[1250, 2500, 5000]} name="dpi"/>
                    <YNColumn bind:groupData idx={groupData.id} defaultTo={defaults.slidesCorrect} name="correct"/>
                    <CountColumn bind:groupData idx={groupData.id} name="scanner_count"/>
                    <CountColumn bind:groupData idx={groupData.id} name="hs_count"/>
                    <EditingColumn bind:groupData idx={groupData.id} value={"N/A"} name="editing_time"/>
                    <TextColumn bind:groupData idx={groupData.id} name="comments"/>
                    <ComputeColumn project_id = {data.id} group_idx={groupData.id} media_type="slides"/>
                </ol>
                {#if i < Object.entries(slidesGroups).length - 1}
                    <ListContainerLineBreak insertAtIdx={groupData.id + 1} dotted={true}/>
                {/if}
            {/each}

        {:else if $CurrentMainTab == "Prints"}
            <ol>
                <TitleRow titles={widths.prints}/>
            </ol>
            <ListContainerLineBreak insertAtIdx = 1/>
            {#each Object.entries(printsGroups || {}) as [idx, groupData], i}
                <ol>
                    <div class="idx">{groupData.id}</div>
                    <DpiColumn bind:groupData idx={groupData.id} defaultTo={defaults.printsDpi} options={[300, 600, 1200]} name="dpi"/>
                    <YNColumn bind:groupData idx={groupData.id} defaultTo={defaults.printsCorrect} name="correct"/>
                    <CountColumn bind:groupData idx={groupData.id} name="lp_count"/>
                    <CountColumn bind:groupData idx={groupData.id} name="hs_count"/>
                    <CountColumn bind:groupData idx={groupData.id} name="oshs_count"/>
                    <TextColumn bind:groupData idx={groupData.id} name="comments"/>
                </ol>
                {#if i < Object.entries(printsGroups).length - 1}
                    <ListContainerLineBreak insertAtIdx={groupData.id + 1} dotted={true}/>
                {/if}
            {/each}

        {:else if $CurrentMainTab == "Negatives"}
            <ol>
                <TitleRow titles={widths.negatives}/>
            </ol>
            <ListContainerLineBreak insertAtIdx = 1/>
            {#each Object.entries(negativesGroups || {}) as [idx, groupData], i}
                <ol>
                    <div class="idx">{groupData.id}</div>
                    <DpiColumn bind:groupData idx={groupData.id} defaultTo={defaults.negativesDpi} options={[1250, 1500, 2500, 3000, 4000, 5000]} name="dpi"/>
                    <YNColumn bind:groupData idx={groupData.id} defaultTo={defaults.negativesCorrect} name="correct"/>
                    <CountColumn bind:groupData idx={groupData.id} name="strip_count"/>
                    <CountColumn bind:groupData idx={groupData.id} name="images_count"/>
                    <CountColumn bind:groupData idx={groupData.id} name="hs_count"/>
                    <TextColumn bind:groupData idx={groupData.id} name="comments"/>
                </ol>
                {#if i < Object.entries(negativesGroups).length - 1}
                    <ListContainerLineBreak insertAtIdx={groupData.id + 1} dotted={true}/>
                {/if}
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
    ol {
        display: flex;
        align-items: center;
        column-gap: 10px;
        padding: 7.5px 10px;
    }
</style>