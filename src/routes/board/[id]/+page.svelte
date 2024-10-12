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
    import TrashColumn from "./components/TrashColumn.svelte";
    import TitleRow from './components/TitleRow.svelte';
    import IndexColumn from './components/IndexColumn.svelte';
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
    function getMaxGroupNumber(groups) {
        if(!groups) {
            return 0;
        }
        return Math.max(...groups.maxPrintsGroupNumber(o => o['group_number']))
    }
    $: slidesGroups = project?.["slides_job"]?.["groups"];
    $: printsGroups = project?.["prints_job"]?.["groups"];
    $: negativesGroups = project?.["negatives_job"]?.["groups"];
    $: maxGroupNumbers = {
        "slides" : 0,
        "prints" : 0,
        "negatives" : 0
    }

    let project;

    let job_dict = {
            "slides_job" : {
                TAB_NAME : "Slides",
                SHORT_NAME : "slides",
            },
            "prints_job" : {
                TAB_NAME : "Prints",
                SHORT_NAME : "prints"
            },
            "negatives_job" : {
                TAB_NAME : "Negatives",
                SHORT_NAME : "negatives"
            }
        }
    
    function tabNameToJobName(tabName) {
        console.log(`converting ${tabName}`);
        for(const [key, value] of Object.entries(job_dict)) {
            if(value['TAB_NAME'] == tabName) {
                return key;
            }
        }
        return null;
    }

    function sortJobsByGroupNumber(resetTab = false) {
        for(const [key, value] of Object.entries(job_dict)) {
            // If project contains this job,
            if(project.hasOwnProperty(key)) {
                if(resetTab) {
                    tabsCache.push(value["TAB_NAME"]);
                }

                // Sort received groups in each job type not only to display correctly, but also find the max group number value for each job
                project[key]["groups"].sort((a, b) => {
                    if (a["group_number"] < b["group_number"]) {
                        return -1
                    }
                    if (a["group_number"] > b["group_number"]) {
                        return 1;
                    }
                    return 0;
                });

                // Set the max group number for this job to 0 if no groups exist; otherwise find the max
                maxGroupNumbers[value["SHORT_NAME"]] = project[key]["groups"].length > 0 ?
                    project[key]["groups"].at(-1)["group_number"] :
                    0
                maxGroupNumbers = maxGroupNumbers; // Update page

                project = project;
            }
        }
    }
    setContext("sortJobsByGroupNumber", sortJobsByGroupNumber);

    // Requests this project's jobs from the database
    async function getProjectData(resetTab = true) {
        if(resetTab) {
            tabsCache = [];
        }
        const endpoint = `${PUBLIC_IP_HTTP_BACKEND}/projects/${data.id}`;
        const response = await fetch(endpoint, {method: "GET"});
        if(response.status == 200) {
            project = await response.json();

            PageNameStore.set(project["formatted_project_name"]);

            sortJobsByGroupNumber(resetTab);

            if(tabsCache.length > 0 && resetTab) {
                CurrentMainTab.set(tabsCache[0]);
            }
        } else {
            PageNameStore.set("Error retrieving project");
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
            if($CurrentMainTab == groupUpdateQueue.data.updates[i].job && idx === groupUpdateQueue.data.updates[i].idx && col === groupUpdateQueue.data.updates[i].col) {
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
    // Send off queued changes every 500ms
    setInterval(sendGroupUpdates, 500);

    function validateChangeGroupNumber(from, to) {
        if(from == to) {
            console.log("Trying to change index from and to current. Skipping...");
            return true;
        }
        let jobName = tabNameToJobName($CurrentMainTab);
        let groups = project[jobName]["groups"];
        for (const group of groups) {
            if(group["group_number"] == to) {
                return false;
            }
        }
        addGroupUpdate(from, "group_number", to);
        return true;

        // TODO:
        // might be worthwhile to check through the update queue to check if already trying to change any index values, and if so, don't allow the change to go through
    }
    setContext("validateChangeGroupNumber", validateChangeGroupNumber);

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

    // Send a request to the server to delete a group with the specified index
    function sendDeleteIdxRequest(idx) {
        let request = {
            "type" : "delete_group",
            "data" : {
                "job" : $CurrentMainTab,
                "idx" : idx
            }
        }
        $ProjectWebsocket.send(JSON.stringify(request));
    }
    setContext("sendDeleteIdxRequest", sendDeleteIdxRequest);

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
                    console.log(`Receiving an update for ${msg['idx']}`);
                    // If the token on this update is the same as my current token, that means I sent it, so it can be ignored
                    if(msg['token'] === myIdentifierToken) {
                        return;
                    }

                    let idx = msg['idx']
                    let col = msg['col']
                    let val = msg['val']
                    let groups = null;
                    switch(msg['job']) {
                        case 'slides_job':
                            groups = slidesGroups;
                            break;
                        case 'prints_job':
                            groups = printsGroups;
                            break;
                        case 'negatives_job':
                            groups = negativesGroups;
                            break;
                    }
                    let group = groups.find(o => o["group_number"] == idx);
                    if (group) {
                        group[col] = val;
                    } else {
                        console.log("Error reading websocket message : Invalid job!");
                    }
                
                case "projects.force_update":
                    getProjectData(false);
                    break;
            }
            
        } catch(e) {
            console.log(`Error reading websocket message : ${e}`);
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


<div style="position: absolute; background-color: red; width: 10px; height: 10px; right: 20px; top: 30px;">

</div>
<ListContainer minWidthRem={listContainerMinWidthRem} minWidthPx={listContainerMinWidthPx} tabs={tabsCache}>
    {#if project}

        {#if $CurrentMainTab == "Slides" && slidesGroups}
            <ol>
                <TitleRow titles={widths.slides}/>
            </ol>
            {#if maxGroupNumbers["slides"] > 0}
                <ListContainerLineBreak insertAtIdx=1/>
            {/if}
            {#each Object.entries(slidesGroups || {}) as [idx, groupData], i}
                <ol>
                    <TrashColumn idx={groupData['group_number']}/>
                    <IndexColumn bind:groupData idx={groupData['group_number']} name="group_number"/>
                    <DpiColumn bind:groupData idx={groupData['group_number']} defaultTo={1250} options={[1250, 2500, 5000]} name="dpi"/>
                    <YNColumn bind:groupData idx={groupData['group_number']} defaultTo={"N"} name="correct"/>
                    <CountColumn bind:groupData idx={groupData['group_number']} name="scanner_count"/>
                    <CountColumn bind:groupData idx={groupData['group_number']} name="hs_count"/>
                    <EditingColumn bind:groupData idx={groupData['group_number']} value={"N/A"} name="editing_time"/>
                    <TextColumn bind:groupData idx={groupData['group_number']} name="comments"/>
                    <ComputeColumn project_id = {data['group_number']} group_idx={groupData['group_number']} media_type="slides"/>
                </ol>
                {#if i < Object.entries(slidesGroups).length - 1}
                    <ListContainerLineBreak insertAtIdx={groupData['group_number'] + 1} dotted={true}/>
                {/if}
            {/each}
            <ListContainerLineBreak insertAtIdx={maxGroupNumbers["slides"] + 1} endOfContainerInsert = {true}/>

        {:else if $CurrentMainTab == "Prints"}
            <ol>
                <TitleRow titles={widths.prints}/>
            </ol>
            {#if maxGroupNumbers["prints"] > 0}
                <ListContainerLineBreak insertAtIdx=1/>
            {/if}
            {#each Object.entries(printsGroups || {}) as [idx, groupData], i}
                <ol>
                    <TrashColumn idx={groupData['group_number']}/>
                    <IndexColumn bind:groupData idx={groupData['group_number']} name="group_number"/>
                    <DpiColumn bind:groupData idx={groupData['group_number']} defaultTo={300} options={[300, 600, 1200]} name="dpi"/>
                    <YNColumn bind:groupData idx={groupData['group_number']} defaultTo={"N"} name="correct"/>
                    <CountColumn bind:groupData idx={groupData['group_number']} name="lp_count"/>
                    <CountColumn bind:groupData idx={groupData['group_number']} name="hs_count"/>
                    <CountColumn bind:groupData idx={groupData['group_number']} name="oshs_count"/>
                    <TextColumn bind:groupData idx={groupData['group_number']} name="comments"/>
                </ol>
                {#if i < Object.entries(printsGroups).length - 1}
                    <ListContainerLineBreak insertAtIdx={groupData['group_number'] + 1} dotted={true}/>
                {/if}
            {/each}
            <ListContainerLineBreak insertAtIdx={maxGroupNumbers["prints"] + 1} endOfContainerInsert = {true}/>

        {:else if $CurrentMainTab == "Negatives"}
            <ol>
                <TitleRow titles={widths.negatives}/>
            </ol>
            {#if maxGroupNumbers["negatives"] > 0}
                <ListContainerLineBreak insertAtIdx=1/>
            {/if}
            {#each Object.entries(negativesGroups || {}) as [idx, groupData], i}
                <ol>
                    <TrashColumn idx={groupData['group_number']}/>
                    <IndexColumn bind:groupData idx={groupData['group_number']} name="group_number"/>
                    <DpiColumn bind:groupData idx={groupData['group_number']} defaultTo={1200} options={[1250, 1500, 2500, 3000, 4000, 5000]} name="dpi"/>
                    <YNColumn bind:groupData idx={groupData['group_number']} defaultTo={"N"} name="correct"/>
                    <CountColumn bind:groupData idx={groupData['group_number']} name="strip_count"/>
                    <CountColumn bind:groupData idx={groupData['group_number']} name="images_count"/>
                    <CountColumn bind:groupData idx={groupData['group_number']} name="hs_count"/>
                    <TextColumn bind:groupData idx={groupData['group_number']} name="comments"/>
                </ol>
                {#if i < Object.entries(negativesGroups).length - 1}
                    <ListContainerLineBreak insertAtIdx={groupData['group_number'] + 1} dotted={true}/>
                {/if}
            {/each}
            <ListContainerLineBreak insertAtIdx={maxGroupNumbers["negatives"] + 1} endOfContainerInsert = {true}/>

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