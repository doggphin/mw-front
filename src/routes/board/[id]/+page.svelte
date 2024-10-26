<script>
    import { PageNameStore, CurrentMainTab, ProjectWebsocket, UpdateProject } from '$lib/scripts/mtd-store.js';
    import { boolToChar, getRandom } from '$lib/scripts/helpers.js';
    import { handleUpdateEditingTag, addTempEditingTag, removeEditingTag } from "$lib/scripts/project.js";
    import { PUBLIC_IP_HTTP_BACKEND, PUBLIC_IP_WS_BACKEND } from '$env/static/public';
    import { widths, widthConsts } from './widthConsts.js';
    import { setContext, onMount, onDestroy } from 'svelte';
    import { getKeyByValue } from "$lib/scripts/helpers.js";
    import { editingTypesToLabel } from "$lib/scripts/editing.js";
    import { videoTypes } from "$lib/scripts/video.js";
    import { dataTypes } from "$lib/scripts/data.js";

    import JobDisplay from "./components/JobDisplay.svelte";
    import ListContainer from '$lib/components/ListContainer.svelte';
    import TempMessage from '$lib/components/TempMessage.svelte';
    import ListContainerLineBreak from "$lib/components/ListContainerLineBreak.svelte";
    import TrashColumn from "./components/TrashColumn.svelte";
    import IndexColumn from './components/IndexColumn.svelte';
    import YNColumn from './components/YNColumn.svelte';
    import DropdownColumn from './components/DropdownColumn.svelte';
    import InputColumn from './components/InputColumn.svelte';
    import TextColumn from './components/TextColumn.svelte';
    import EditingColumn from './components/EditingColumn.svelte';
    import ComputeColumn from './components/ComputeColumn.svelte';

    export let data;    // Gets page number from page.js

    let error = false;
    let editingMode = false;
    export let project;
    let tabsCache = [];
    // An identifier token is attached to modification requests to (until profiles are set up) determine what session sent it
    // If a frontend session receives an update, if it came from themselves, it is ignored, or in some situations, used to update temporary values.
    const SESSION_TOKEN = getRandom(-2147483648, 2147483647);
    let groupUpdateQueue = {
        'token': SESSION_TOKEN,
        'type': "update_group",
        'data': {
            'token' : SESSION_TOKEN,
            'updates' : []
        }
    };

    $: slidesGroups = project?.["slides_job"]?.["groups"];
    $: printsGroups = project?.["prints_job"]?.["groups"];
    $: negativesGroups = project?.["negatives_job"]?.["groups"];
    $: videoGroups = project?.["video_job"]?.["groups"];
    $: dataGroups = project?.["data_job"]?.["groups"];
    $: maxGroupNumbers = {
        "slides" : 0,
        "prints" : 0,
        "negatives" : 0,
        "video" : 0,
        "groups" : 0
    }
    const jobDict = {
        "slides_job" : {
            TAB_NAME : "Slides",
            SHORT_NAME : "slides",
            GROUPS : slidesGroups
        },
        "prints_job" : {
            TAB_NAME : "Prints",
            SHORT_NAME : "prints",
            GROUPS : printsGroups
        },
        "negatives_job" : {
            TAB_NAME : "Negatives",
            SHORT_NAME : "negatives",
            GROUPS : negativesGroups
        },
        "video_job" : {
            TAB_NAME : "Video",
            SHORT_NAME : "video",
            GROUPS : videoGroups
        },
        "data_job" : {
            TAB_NAME : "Data",
            SHORT_NAME : "data",
            GROUPS : dataGroups
        }
    }

    function jobNameToGroups(job_name) {
        switch(job_name) {
            case 'slides_job':
                return slidesGroups;
            case 'prints_job':
                return printsGroups;
            case 'negatives_job':
                return negativesGroups;
            case 'video_job':
                return videoGroups;
            case 'data_job':
                return dataGroups;
            default:
                return null;
        }
    }

    function tabNameToJobName(tabName) {
        for(const [key, value] of Object.entries(jobDict)) {
            if(value['TAB_NAME'] == tabName) {
                return key;
            }
        }
        return null;
    }

    function sortJobsByGroupNumber(resetTab = false) {
        for(const [key, value] of Object.entries(jobDict)) {
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
            error = true;
        }
    }


    // When this page loads, reset the page name (will be set in getProjectData), reset the current tab and request this project's data
    onMount(async () => {
        PageNameStore.set("");
        CurrentMainTab.set();
        getProjectData();
    });
    

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

    /*
    Sends a JS object as a request to the server in JSON format.
    */
    function sendRequest(req) {
        $ProjectWebsocket.send(JSON.stringify(req));
    }

    /*
    Sends the group update queue off to the server to update the database.
    */
    function sendGroupUpdates() {
        if(groupUpdateQueue.data.updates.length > 0) {
            sendRequest(groupUpdateQueue);
            groupUpdateQueue.data.updates = [];
        }
    }
    setInterval(sendGroupUpdates, 500);         // Send off queued changes every 500ms


    /*
    Called when the user attempts to change the group number of a group.
    If this returns false, the user attempted to change its group number to something invalid.
    Otherwise, add a request to change a group number from "from" to "to" to the server request queue, then return true.
    */
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
        // might be worthwhile to check through the update queue to check if already trying to change any index values,
        // and if so, don't allow the change to go through
    }
    setContext("validateChangeGroupNumber", validateChangeGroupNumber);


    /*
    Send a request to the server to insert a group at the specified index.
    Logic for this is only done on the server (for now).
    */
    function sendInsertIdxRequest(idx) {
        sendRequest({
            "type" : "insert_group",
            "data" : {
                "token" : SESSION_TOKEN,
                "job" : $CurrentMainTab,
                "idx" : idx
            }
        });
    }
    setContext("sendInsertIdxRequest", sendInsertIdxRequest);


    /*
    Send a request to the server to delete a group with the specified index.
    Logic for this is only done on the server (for now).
    */
    function sendDeleteIdxRequest(idx) {
        console.log("test");
        sendRequest({
            "type" : "delete_group",
            "data" : {
                "token" : SESSION_TOKEN,
                "job" : $CurrentMainTab,
                "idx" : idx
            }
        });
        let jobName = tabNameToJobName($CurrentMainTab);
        let groups = project[jobName]["groups"];
        groups.forEach((item, index) => {
            console.log("checking...");
            if(item['group_number'] === idx) {
                console.log("deleting");
                groups.splice(index, 1);
            }
        });
        project = project;
    }
    setContext("sendDeleteIdxRequest", sendDeleteIdxRequest);


    /*
    Adds an update editing tag request for the editing tag with ID "tagId" in group with group number "idx"
    to the update queue for sending to the server.
    
    If editingType is null, it won't be included.
    If time is null, it won't be included.
    */
    function addEditingTagUpdateRequest(idx, tagId, editingType, time) {
        /* Backend expects an update with the following format:
        {
            ...
            "val" : {       # This is editing_tag_update_val
                "update_type" : "add" | "remove" | "modify",
                "id" : int,     # (only included if update type is "remove" or "modify")
                "time" : int (optional),
                "editing_type" : string (optional)
            }
        */
        let val = {
            "update_type" : "modify",
            "id" : tagId
        }
        // Make sure to convert back to database entry naming style ("Other" -> "NA")
        if(editingType !== null) {
            let dbEntryEditingType = getKeyByValue(editingTypesToLabel, editingType);
            val["editing_type"] = dbEntryEditingType;
        }
        if(time !== null) {
            val["time"] = time;
        }

        addGroupUpdate(idx, "editing_tags", val);
    }
    setContext("addEditingTagUpdateRequest", addEditingTagUpdateRequest);


    /*
    Updates the DOM to relay any nested object updates in the loaded project.
    */
    let updateProject = () => {
        project = project;
    }
    UpdateProject.set(updateProject);


    /*
    Sends a request to the server to add an editing tag for the currently
    opened job for group "idx".
    
    Temporarily creates an editing tag with a random ID. When the server tells
    clients a new editing tag is supposed to be added, this client updates its
    temporary editing tag ID (which is randomly generated) with the new editing
    tag's ID.
    */
    function addEditingTagAddRequest(idx) {
        // Until a confirmation is received from the server, temporarily create a new editing tag and assign
        // it a random id.
        const randomTempId = getRandom(-2147483648, 0);
        addGroupUpdate(idx, "editing_tags", {
            "update_type" : "add",
            "sender_temp_id" : randomTempId,
        });
        let groups = jobNameToGroups(tabNameToJobName($CurrentMainTab));
        let group = groups.find(group => group['group_number'] == idx);
        addTempEditingTag(group, randomTempId);
        project = project;
    }
    setContext("addEditingTagAddRequest", addEditingTagAddRequest);


    /*
    Adds a request to update an editing tag in the currently opened job for group
    "idx", with tag ID "tagID", to the update request cache.
    */
    function addEditingTagDeleteRequest(idx, tagId) {
        addGroupUpdate(idx, "editing_tags", {
            "update_type" : "delete",
            "id" : tagId
        });
        let groups = jobNameToGroups(tabNameToJobName($CurrentMainTab));
        let group = groups.find(group => group['group_number'] == idx);
        removeEditingTag(group, tagId);
    }
    setContext("addEditingTagDeleteRequest", addEditingTagDeleteRequest);


    // Websocket stuff
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
    function handleProjectUpdateIdx(msg) {
        console.log(`Receiving an update for ${msg['idx']}`);
        // If the token on this update is the same as my current token, that means I sent it, so it can be ignored

        let idx = msg['idx'];
        let col = msg['col'];
        let val = msg['val'];
        let groups = jobNameToGroups(msg['job']);
        let group = groups.find(o => o["group_number"] == idx);
        if (group) {
            switch(msg['col']) {
                case 'editing_tags':
                    handleUpdateEditingTag(group, val, msg['token'], SESSION_TOKEN);
                    break;
                default:
                    if(msg['token'] === SESSION_TOKEN) {
                        return;
                    }
                    group[col] = val;
                    break;
            }
            project = project;  // Update DOM
        } else {
            console.log("Error reading websocket message : Invalid job!");
        }
    }
    function handleProjectDeleteIdx(msg) {
        console.log(`Receiving a delete command for ${msg['idx']}`);

        let token = msg['token']

        if(SESSION_TOKEN == token) {
            console.log("Received a command to delete a group already deleted on client. Ignoring.");
            return;
        }

        let idx = msg['idx'];
        let job = msg['job'];
        console.log(`Deleting idx ${idx} and job ${job}`);
        let groups = jobNameToGroups(job);
        groups.forEach((item, index) => {
            if (item['group_number'] === idx) {
                groups.splice(index, 1);
                return;
            }
        });
        project = project;
    }
    $ProjectWebsocket.onmessage = (event) => {
        try {
            const event_json = JSON.parse(event.data);
            const msg = event_json['message'];
            switch(event_json['type']) {

                case "projects.update_idx":
                    handleProjectUpdateIdx(msg);
                    break;
                
                case "projects.delete_group":
                    handleProjectDeleteIdx(msg);
                    break;

                case "projects.force_update": //TODO : don't do this. introduces a shitton of lag
                    console.log("received a force update!");
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


    let listContainerMinWidthRem = 0;
    let listContainerMinWidthPx = 0;
    $: $CurrentMainTab, setWidths()
    function setWidths() {
        if($CurrentMainTab && $CurrentMainTab != "") {
            [listContainerMinWidthRem, listContainerMinWidthPx] = widths.getWidth($CurrentMainTab.toLowerCase());
        }
    };

    
    // Switches this project page between being in editing or normal mode
    function toggleEditingMode() {
        editingMode = !editingMode;
    }
</script>


{#if project}
    <button style="position: absolute; right: 20px; top: 15px; z-index: 100; padding:5px;" 
    on:click={toggleEditingMode}>
        {`Switch to ${editingMode ? "Normal" : "Editing"} Mode`}
    </button>
{/if}

<ListContainer minWidthRem={listContainerMinWidthRem} minWidthPx={listContainerMinWidthPx} tabs={tabsCache}>
    {#if project}

        {#if $CurrentMainTab == "Slides" && slidesGroups}
            <JobDisplay name="slides" maxGroupNumber={maxGroupNumbers["slides"]} editingMode={editingMode}>
                {#each Object.entries(slidesGroups || {}) as [_, groupData], i}
                    {@const idx = groupData['group_number']}
                    <ol>
                        <TrashColumn idx={idx}
                            editingMode={editingMode}/>
                        <IndexColumn bind:groupData idx={idx}
                            name="group_number"
                            editingMode = {editingMode}/>
                        <DropdownColumn bind:groupData idx={idx}
                            name="dpi"
                            options={[1250, 2500, 5000]}
                            editingMode={editingMode}
                            requireEditingMode={true}/>
                        <YNColumn bind:groupData idx={idx}
                            name="correct"
                            defaultTo={"N"}
                            editingMode = {editingMode}/>
                        <InputColumn bind:groupData idx={idx}
                            intakeName="intake_scanner_count"
                            finalName="final_scanner_count"
                            overlayCounts = {true}
                            warnOnDifferent = {true}
                            enforceNumbers = {true}
                            editingMode={editingMode}/>
                        <InputColumn bind:groupData idx={idx}
                            intakeName="intake_scanner_count"
                            finalName="final_hs_count"
                            overlayCounts = {true}
                            warnOnDifferent = {true}
                            enforceNumbers = {true}
                            editingMode={editingMode}/>
                        <EditingColumn bind:groupData idx={idx}/>
                        <TextColumn bind:groupData idx={idx}
                            name="comments"
                            widthName="comments"/>
                        <ComputeColumn
                            project_id = {data['group_number']}
                            group_idx={idx}
                            media_type="slides"/>
                    </ol>
                    {#if i < Object.entries(slidesGroups).length - 1}
                        <ListContainerLineBreak insertAtIdx={idx + 1} dotted={true}
                            drawInsert={editingMode}/>
                    {/if}
                {/each}
            </JobDisplay>


        {:else if $CurrentMainTab == "Prints"}
            <JobDisplay name="prints" maxGroupNumber={maxGroupNumbers["prints"]} editingMode={editingMode}>
                {#each Object.entries(printsGroups || {}) as [_, groupData], i}
                    {@const idx = groupData['group_number']}
                    <ol>
                        <TrashColumn idx={idx}
                            editingMode = {editingMode}/>
                        <IndexColumn bind:groupData idx={idx}
                            name="group_number"
                            editingMode = {editingMode}/>
                        <DropdownColumn bind:groupData idx={idx}
                            options={[300, 600, 1200]}
                            name="dpi"
                            editingMode = {editingMode}
                            requireEditingMode={true}/>
                        <YNColumn bind:groupData idx={idx}
                            defaultTo={"N"}
                            name="correct"
                            editingMode = {editingMode}/>
                        <InputColumn bind:groupData idx={idx}
                            intakeName="intake_lp_count"
                            finalName="final_lp_count"
                            overlayCounts = {true}
                            warnOnDifferent = {true}
                            enforceNumbers = {true}
                            editingMode = {editingMode}/>
                        <InputColumn bind:groupData idx={idx}
                            intakeName="intake_hs_count"
                            finalName="final_hs_count"
                            overlayCounts = {true}
                            warnOnDifferent = {true}
                            enforceNumbers = {true}
                            editingMode = {editingMode}/>
                        <InputColumn bind:groupData idx={idx}
                            intakeName="intake_oshs_count"
                            finalName="final_oshs_count"
                            overlayCounts = {true}
                            warnOnDifferent = {true}
                            enforceNumbers = {true}
                            editingMode = {editingMode}/>
                        <EditingColumn bind:groupData idx={idx}/>
                        <TextColumn bind:groupData idx={idx}
                            name="comments"
                            widthName="comments"/>
                        <ComputeColumn
                            project_id = {data['group_number']}
                            group_idx={idx}
                            media_type="prints"/>
                    </ol>
                    {#if i < Object.entries(printsGroups).length - 1}
                        <ListContainerLineBreak insertAtIdx={idx + 1} dotted={true}
                            drawInsert={editingMode}/>
                    {/if}
                {/each}
            </JobDisplay>


        {:else if $CurrentMainTab == "Negatives"}
            <JobDisplay name="negatives" maxGroupNumber={maxGroupNumbers["negatives"]} editingMode={editingMode}>
                {#each Object.entries(negativesGroups || {}) as [_, groupData], i}
                    {@const idx = groupData['group_number']}
                    <ol>
                        <TrashColumn idx={idx}
                            editingMode = {editingMode}/>
                        <IndexColumn bind:groupData idx={idx}
                            name="group_number"
                            editingMode = {editingMode}/>
                        <DropdownColumn bind:groupData idx={idx}
                            options={[1250, 1500, 2500, 3000, 4000, 5000]}
                            name="dpi"
                            editingMode = {editingMode}
                            requireEditingMode={true}/>
                        <YNColumn bind:groupData idx={idx}
                            defaultTo={"N"}
                            name="correct"
                            editingMode = {editingMode}/>
                        <InputColumn bind:groupData idx={idx}
                            intakeName = "intake_strip_count"
                            finalName = "final_strip_count"
                            overlayCounts = {true}
                            warnOnDifferent = {true}
                            enforceNumbers = {true}
                            editingMode = {editingMode}/>
                        <InputColumn bind:groupData idx={idx}
                            intakeName = "intake_images_count"
                            finalName = "final_images_count"
                            overlayCounts = {true}
                            warnOnDifferent = {true}
                            enforceNumbers = {true}
                            editingMode = {editingMode}/>
                        <InputColumn bind:groupData idx={idx}
                            intakeName = "intake_hs_count"
                            finalName = "final_hs_count"
                            overlayCounts = {true}
                            warnOnDifferent = {true}
                            enforceNumbers = {true}
                            editingMode = {editingMode}/>
                        <EditingColumn bind:groupData idx={idx}/>
                        <TextColumn bind:groupData idx={idx}
                            name="comments"
                            widthName="comments"/>
                        <ComputeColumn
                            project_id = {data['group_number']}
                            group_idx={idx}
                            media_type="negatives"/>
                    </ol>
                    {#if i < Object.entries(negativesGroups).length - 1}
                        <ListContainerLineBreak insertAtIdx={idx + 1}
                            dotted={true}
                            drawInsert={editingMode}/>
                    {/if}
                {/each}
            </JobDisplay>


        {:else if $CurrentMainTab == "Video"}
            <JobDisplay name="video" maxGroupNumber={maxGroupNumbers["video"]} editingMode={editingMode}>
                {#each Object.entries(videoGroups || {}) as [_, groupData], i}
                    {@const idx = groupData['group_number']}
                    <ol>
                        <TrashColumn idx={idx}
                            editingMode = {editingMode}/>
                        <IndexColumn bind:groupData idx={idx}
                            name="group_number"
                            editingMode = {editingMode}/>
                        <DropdownColumn bind:groupData idx={idx}
                            name="video_type"
                            options={videoTypes}
                            editingMode={editingMode}
                            requireEditingMode={true}/>
                        <InputColumn bind:groupData idx={idx}
                            intakeName = "est_dvd_number"
                            finalName = "act_dvd_number"
                            overlayCounts = {true}
                            enforceNumbers = {true}
                            editingMode = {editingMode}
                            widthName = "smallText"/>
                        <InputColumn bind:groupData idx={idx}
                            finalName = "vcr"
                            widthName = "smallText"/>
                        <InputColumn bind:groupData idx={idx}
                            finalName = "station_number"
                            widthName = "smallText"
                            enforceNumbers = {true}/>
                        <EditingColumn bind:groupData idx={idx}/>
                        <TextColumn bind:groupData idx={idx}
                            name="comments"
                            widthName="comments"/>
                        <ComputeColumn
                            project_id = {data['group_number']}
                            group_idx={idx}
                            media_type="video"/>
                    </ol>
                    {#if i < Object.entries(videoGroups).length - 1}
                        <ListContainerLineBreak insertAtIdx={idx + 1}
                            dotted={true}
                            drawInsert={editingMode}/>
                    {/if}
                {/each}
            </JobDisplay>

            {:else if $CurrentMainTab == "Data"}
                <JobDisplay name="data" maxGroupNumber={maxGroupNumbers["data"]} editingMode={editingMode}>
                    {#each Object.entries(dataGroups || {}) as [_, groupData], i}
                        {@const idx = groupData['group_number']}
                        <ol>
                            <TrashColumn idx={idx}
                                editingMode = {editingMode}/>
                            <IndexColumn bind:groupData idx={idx}
                                name="group_number"
                                editingMode = {editingMode}/>
                            <DropdownColumn bind:groupData idx={idx}
                                name="data_type"
                                options={dataTypes}
                                editingMode={editingMode}
                                requireEditingMode={true}/>
                            <EditingColumn bind:groupData idx={idx}/>
                            <TextColumn bind:groupData idx={idx}
                                name="comments"
                                widthName="comments"/>
                            <ComputeColumn
                                project_id = {data['group_number']}
                                group_idx={idx}
                                media_type="data"/>
                        </ol>
                        {#if i < Object.entries(dataGroups).length - 1}
                            <ListContainerLineBreak insertAtIdx={idx + 1}
                                dotted={true}
                                drawInsert={editingMode}/>
                        {/if}
                    {/each}
                </JobDisplay>


        {:else}
            <p class="temp-message">{"There's no media assigned to this project yet."}</p> 
        {/if}

    {:else}
        <TempMessage message={error ? `No project with ID ${data.id} exists.` : "Loading..."} />
    {/if}

</ListContainer>


<style>
    ol {
        display: flex;
        align-items: center;
        column-gap: 10px;
        padding: 7.5px 10px;
    }
</style>