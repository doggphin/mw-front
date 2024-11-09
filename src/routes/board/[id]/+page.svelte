<script>
    import { PageNameStore, CurrentMainTab, ProjectWebsocket, UpdateProject } from '$lib/scripts/mtd-store.js';
    import { getRandom, characterComesBefore } from '$lib/scripts/helpers.js';
    import { handleUpdateEditingTag, addTempEditingTag, removeEditingTag } from "$lib/scripts/project.js";
    import { PUBLIC_IP_HTTP_BACKEND, PUBLIC_IP_WS_BACKEND } from '$env/static/public';
    import { widths, widthConsts } from './widthConsts.js';
    import { setContext, onMount, onDestroy } from 'svelte';
    import { getKeyByValue } from "$lib/scripts/helpers.js";
    import { editingTypesToLabel } from "$lib/scripts/editing.js";
    import { videoTypes } from "$lib/scripts/video.js";
    import { dataTypes } from "$lib/scripts/data.js";``
    import { audioTypes } from "$lib/scripts/audio.js";

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
    import BlankColumn from './components/BlankColumn.svelte';
    import StaticTextColumn from './components/StaticTextColumn.svelte';

    export let data;    // Gets page number from page.js

    let error = false;
    let editingMode = false;
    let project = null;
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

    $: projectJobs = project?.["jobs"];
    $: slidesGroups = projectJobs?.["slides"]?.["groups"];
    $: printsGroups = projectJobs?.["prints"]?.["groups"];
    $: negativesGroups = projectJobs?.["negatives"]?.["groups"];
    $: videoGroups = projectJobs?.["video"]?.["groups"];
    $: dataGroups = projectJobs?.["data"]?.["groups"];
    $: audioGroups = projectJobs?.["audio"]?.["groups"];

    const jobDict = {
        "slides" : {
            TAB_NAME : "Slides",
            MAX_GROUP_NUMBER : 0,
            GROUPS : () => slidesGroups
        },
        "prints" : {
            TAB_NAME : "Prints",
            MAX_GROUP_NUMBER : 0,
            GROUPS : () => printsGroups
        },
        "negatives" : {
            TAB_NAME : "Negatives",
            MAX_GROUP_NUMBER : 0,
            GROUPS : () => negativesGroups
        },
        "video" : {
            TAB_NAME : "Video",
            MAX_GROUP_NUMBER : 0,
            GROUPS : () => videoGroups
        },
        "data" : {
            TAB_NAME : "Data",
            MAX_GROUP_NUMBER : 0,
            GROUPS : () => dataGroups
        },
        "audio" : {
            TAB_NAME : "Audio",
            MAX_GROUP_NUMBER : 0,
            GROUPS : () => audioGroups
        }
    }

    function getCurrentGroups() {
        return jobDict[$CurrentMainTab].GROUPS();
    }

    function getGroupsSortedByGroupNumber(groups) {
        return groups ?
            Object.entries(groups)?.sort((a, b) => a[1]['group_number'] - b[1]['group_number']) :
            {}
    }

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

            for(const [jobName, jobData] of Object.entries(project['jobs'])) {
                if(resetTab) {
                    tabsCache.push(jobName);
                }

                jobDict[jobName].MAX_GROUP_NUMBER = Object.values(jobData['groups']).reduce((maxGroupNumber, groupToCheck) => {
                    return Math.max(maxGroupNumber, groupToCheck['group_number']);
                }, 0);
            }


            if(tabsCache.length > 0 && resetTab) {
                CurrentMainTab.set(tabsCache[0].toLowerCase());
            }
        } else {
            PageNameStore.set("Error retrieving project");
            error = true;
        }
    }


    // When this page loads, reset the page name (will be set in getProjectData), reset the current tab and request this project's data
    onMount(async () => {
        PageNameStore.set("");
        CurrentMainTab.set("");
        getProjectData();
    });
    

    // Adds an update to append to the list of updates to intermittently send to the server.
    function addGroupUpdate(groupPk, colName, val) {
        // Try to replace any previous updates with this update if possible
        for(let i=0; i<groupUpdateQueue.data.updates.length; i++) {         
            if($CurrentMainTab == groupUpdateQueue.data.updates[i]['job_name']
                && groupPk === groupUpdateQueue.data.updates[i]['group_pk']
                && colName === groupUpdateQueue.data.updates[i]['col_name'])
            {
                groupUpdateQueue.data.updates[i]['val'] = val;
                return;
            }
        }
        groupUpdateQueue.data.updates.push({
            'job_name' : $CurrentMainTab,
            'group_pk' : groupPk,
            'col_name' : colName,
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
    function addChangeGroupNumberUpdate(groupId, toGroupNumber) {
        addGroupUpdate(groupId, "group_number", toGroupNumber);
        return true;
    }
    setContext("addChangeGroupNumberUpdate", addChangeGroupNumberUpdate);


    /*
        Send a request to the server to insert a group at the specified index.
        Logic for this is only done on the server (for now).
    */
    function sendInsertGroupRequest(atGroupNumber) {
        sendRequest({
            "type" : "insert_group",
            "data" : {
                "token" : SESSION_TOKEN,
                "job" : $CurrentMainTab,
                "group_number" : atGroupNumber
            }
        });
    }
    setContext("sendInsertGroupRequest", sendInsertGroupRequest);


    /*
        Send a request to the server to delete a group with the specified index.
        Logic for this is only done on the server (for now).
    */
    function sendDeleteGroupByIdRequest(idToDelete) {
        sendRequest({
            "type" : "delete_group",
            "data" : {
                "token" : SESSION_TOKEN,
                "job" : $CurrentMainTab,
                "id" : idToDelete
            }
        });
        delete getCurrentGroups()[idToDelete];
    }
    setContext("sendDeleteGroupByIdRequest", sendDeleteGroupByIdRequest);


    /*
        Adds an update editing tag request for the editing tag with ID "tagId" in group with id "id"
        to the update queue for sending to the server.
        
        If editingType is null, it won't be included.
        If time is null, it won't be included.
    */
    function addEditingTagUpdateRequest(groupId, tagId, editingType, time) {
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

        addGroupUpdate(groupId, "editing_tags", val);
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
        opened job for group "id".
        
        Temporarily creates an editing tag with a random ID. When the server tells
        clients a new editing tag is supposed to be added, this client updates its
        temporary editing tag ID (which is randomly generated) with the new editing
        tag's ID.
    */
    function addEditingTagAddRequest(groupId) {
        // Until a confirmation is received from the server, temporarily create a new editing tag and assign
        // it a random id.
        const randomTempId = getRandom(-2147483648, 0);

        addTempEditingTag(getCurrentGroups()[groupId], randomTempId);

        addGroupUpdate(
            groupId, 
            "editing_tags", {
                "update_type" : "add",
                "sender_temp_id" : randomTempId
            }
        );

        updateProject();
    }
    setContext("addEditingTagAddRequest", addEditingTagAddRequest);


    /*
        Adds a request to update an editing tag in the currently opened job for group
        "id", with tag ID "tagID", to the update request cache.
    */
    function addEditingTagDeleteRequest(groupId, editingTagId) {
        let group = getCurrentGroups()[groupId];
        
        removeEditingTag(group, editingTagId);

        addGroupUpdate(
            id, 
            "editing_tags", {
                "update_type" : "delete",
                "id" : editingTagId
            }
        );
    }
    setContext("addEditingTagDeleteRequest", addEditingTagDeleteRequest);


    function handleReceiveGroupUpdate(msg) {
        // Unpack message
        let groupPk = msg['group_pk'];
        let colName = msg['col_name'];
        let val = msg['val'];
        let token = msg['token'];
        let jobName = msg['job_name'];

        let group = jobNameToGroups(jobName)[groupPk];

        if (group) {
            switch(colName) {
                case 'editing_tags':
                    handleUpdateEditingTag(group, val, token, SESSION_TOKEN);
                    break;
                default:
                    // If the token on this update is the same as my current token, that means I sent it, so it can be ignored
                    if(token === SESSION_TOKEN) {
                        return;
                    }
                    group[colName] = val;
                    break;
            }

            updateProject();  // Update DOM
        } else {
            console.log("Error reading websocket message : Invalid job!");
        }
    }


    function handleReceiveGroupDelete(receivedJson) {
        let token = receivedJson['token'];
        let id = receivedJson['id'];
        let job = receivedJson['job'];

        if(SESSION_TOKEN == token) {
            console.log("Ignoring a delete request sent from this client.");
            return;
        }

        delete jobNameToGroups(job)[groupPk];

        updateProject();
    }

    ProjectWebsocket.set(new WebSocket(`${PUBLIC_IP_WS_BACKEND}/ws/project/${data.id}/`));
    function createWebsocketConnection() {
        if($ProjectWebsocket != null) {
            $ProjectWebsocket.close();
        }
        ProjectWebsocket.set(new WebSocket(`${PUBLIC_IP_WS_BACKEND}/ws/project/${data.id}/`));
    }
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

                case "projects.update_group":
                    console.log("Received!");
                    handleReceiveGroupUpdate(msg);
                    break;
                
                case "projects.delete_group":
                    handleReceiveGroupDelete(msg);
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
        <JobDisplay
            name={$CurrentMainTab}
            maxGroupNumber={jobDict[$CurrentMainTab].MAX_GROUP_NUMBER}
            editingMode={editingMode}
        >
            {@const sortedGroups = getGroupsSortedByGroupNumber(getCurrentGroups())}
            {#each sortedGroups as [groupPk, groupData], i}
                {@const groupNumber = groupData['group_number']}
                
                <!-- These only matter if the current job is audio; hacky solution, this is done to increase variable scope -->
                {@const isAudio = $CurrentMainTab == "audio"}
                {@const mySide = isAudio ? groupData['side'] : null}
                {@const otherSides = isAudio ? Object.entries(audioGroups).reduce(
                    (acc, [otherGroupPk, otherGroupData]) => {
                        if(otherGroupPk != groupPk && otherGroupData['group_number'] == groupNumber) {
                            acc.push(otherGroupData['side']);
                        }
                        return acc;
                    }, []) : null}
                {@const isFirstSideInGroup = isAudio ? !otherSides.some(otherSide => 
                    characterComesBefore(otherSide, mySide)
                ) : null}
                {@const isLastSideInGroup = isAudio ? !otherSides.some(otherSide => 
                    characterComesBefore(mySide, otherSide)
                ) : null}

                <ol>
                    <!-- Audio is handled differently; these are added manually there -->
                    {#if !isAudio}
                        <TrashColumn groupPk={groupPk} editingMode={editingMode}/>
                        <IndexColumn bind:groupData groupPk={groupPk} editingMode = {editingMode}/>
                    {/if}
                        
                    {#if $CurrentMainTab == "slides" && slidesGroups}
                        <DropdownColumn bind:groupData groupPk={groupPk}
                            colName="dpi"
                            options={[1250, 2500, 5000]} editingMode={editingMode} requireEditingMode={true}/>
                        <YNColumn bind:groupData groupPk={groupPk}
                            colName="correct" defaultTo={"N"} editingMode = {editingMode}/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            intakeName="intake_scanner_count"
                            finalName="final_scanner_count" overlayCounts = {true} warnOnDifferent = {true} enforceNumbers = {true} editingMode={editingMode}/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            intakeName="intake_scanner_count"
                            finalName="final_hs_count" overlayCounts = {true} warnOnDifferent = {true} enforceNumbers = {true} editingMode={editingMode}/>


                    {:else if $CurrentMainTab == "prints"}
                        {@const groupNumber = groupData['group_number']}
                        <DropdownColumn bind:groupData groupPk={groupPk}
                            options={[300, 600, 1200]}
                            colName="dpi" editingMode = {editingMode} requireEditingMode={true}/>
                        <YNColumn bind:groupData groupPk={groupPk} defaultTo={"N"}
                            colName="correct" editingMode = {editingMode}/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            intakeName="intake_lp_count"
                            finalName="final_lp_count" overlayCounts = {true} warnOnDifferent = {true} enforceNumbers = {true} editingMode = {editingMode}/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            intakeName="intake_hs_count"
                            finalName="final_hs_count" overlayCounts = {true} warnOnDifferent = {true} enforceNumbers = {true} editingMode = {editingMode}/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            intakeName="intake_oshs_count"
                            finalName="final_oshs_count" overlayCounts = {true} warnOnDifferent = {true} enforceNumbers = {true} editingMode = {editingMode}/>


                    {:else if $CurrentMainTab == "negatives"}
                        <DropdownColumn bind:groupData groupPk={groupPk}
                            options={[1250, 1500, 2500, 3000, 4000, 5000]}
                            colName="dpi" editingMode = {editingMode}
                            requireEditingMode={true}/>
                        <YNColumn bind:groupData groupPk={groupPk} defaultTo={"N"}
                            colName="correct" editingMode = {editingMode}/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            intakeName = "intake_strip_count"
                            finalName = "final_strip_count" overlayCounts = {true} warnOnDifferent = {true} enforceNumbers = {true} editingMode = {editingMode}/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            intakeName = "intake_images_count"
                            finalName = "final_images_count" overlayCounts = {true} warnOnDifferent = {true} enforceNumbers = {true} editingMode = {editingMode}/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            intakeName = "intake_hs_count"
                            finalName = "final_hs_count" overlayCounts = {true} warnOnDifferent = {true} enforceNumbers = {true} editingMode = {editingMode}/>

                    {:else if $CurrentMainTab == "video"}
                        <DropdownColumn bind:groupData groupPk={groupPk}
                            colName="video_type" options={videoTypes} editingMode={editingMode} requireEditingMode={true}/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            intakeName = "est_dvd_number"
                            finalName = "act_dvd_number" overlayCounts = {true} enforceNumbers = {true} editingMode = {editingMode} widthName = "smallText"/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            finalName = "vcr"
                            widthName = "smallText"/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            finalName = "station_number" widthName = "smallText" enforceNumbers = {true}/>

                    {:else if $CurrentMainTab == "data"}
                        <DropdownColumn bind:groupData groupPk={groupPk}
                            colName="data_type" options={dataTypes} editingMode={editingMode} requireEditingMode={true}/>


                    {:else if $CurrentMainTab == "audio"}
                        {#if isFirstSideInGroup}
                            <TrashColumn groupPk={groupPk} editingMode = {editingMode}/>
                            <IndexColumn bind:groupData groupPk={groupPk} editingMode = {editingMode}/>
                            <DropdownColumn bind:groupData groupPk={groupPk}
                                colName = "audio_type" options = {audioTypes} requireEditingMode = {true} editingMode = {editingMode}/>
                        {:else}
                            <BlankColumn widthName = "index"/>
                            <BlankColumn widthName = "dropdown"/>
                        {/if}
                        
                        <StaticTextColumn bind:groupData
                            colName = "side"
                            widthName = "smallText"/>
                        <InputColumn bind:groupData groupPk={groupPk}
                            finalName = "tracks"
                            widthName = "smallText" enforceNumbers = {true}/>
                        <EditingColumn bind:groupData
                            groupPk={groupPk}/>
                        <TextColumn bind:groupData groupPk={groupPk}
                            colName = "comments" widthName = "comments"/>
                        
                        {#if isFirstSideInGroup}
                            <ComputeColumn
                                projectId = {data['group_number']}
                                groupPk = {groupPk}
                                mediaType = "slides"/>
                        {:else}
                            <BlankColumn widthName = "compute"/>
                        {/if}

                    {:else}
                        <TempMessage message = {`No groups have been assigned to this project's ${$CurrentMainTab} job yet!`}/>
                    {/if}
                
                <!-- Audio tab doesn't always include these -->
                {#if !isAudio}
                    <EditingColumn bind:groupData={groupData}
                        groupPk = {groupPk}/>
                    <TextColumn bind:groupData groupPk={groupPk}
                        colName="comments" widthName="comments"/>
                    <ComputeColumn
                        projectId = {data['group_number']}
                        groupPk = {groupPk}
                        mediaType = {$CurrentMainTab}/>
                {/if}
            </ol>
            
            <!-- Audio tab final line break is handled differently -->
            {#if i < Object.entries(getCurrentGroups()).length - 1 && (!isAudio || isLastSideInGroup)}
                <ListContainerLineBreak
                    insertAtGroupNumber={groupNumber + 1}
                    dotted={true}
                    drawInsert={editingMode}/>
            {/if}
            
        {/each}
    </JobDisplay>

    {:else}
        <TempMessage message={error ? `No project with ID ${data.id} exists.` : "Loading..."}/>
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