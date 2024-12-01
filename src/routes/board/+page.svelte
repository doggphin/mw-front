<script>
    import { PageNameStore, CurrentMainTab, ProjectWebsocket } from '$lib/scripts/mtd-store.js';
    import { PUBLIC_IP_HTTP_BACKEND, PUBLIC_IP_WS_BACKEND } from '$env/static/public';
    import { onMount } from 'svelte';
    import { getBaseRequestHeader, startWebsocketConnection } from "$lib/scripts/helpers.js";
    import { getToken, gotoLoginIfNotLoggedIn, UserId } from "$lib/scripts/login.js"; 
    import ListContainer from "$lib/components/ListContainer.svelte";
    import ListContainerLineBreak from "$lib/components/ListContainerLineBreak.svelte";
    import TempMessage from "$lib/components/TempMessage.svelte";
    import { handleReceivedUpdate } from "./boardMessages.js";
    import TextColumn from '$lib/components/columns/TextColumn.svelte';

    import SortButton from "./components/SortButton.svelte";

    let board = {};
    let error = 0;
    let tabs = ["Boulder", "WheatRidge", "Littleton", "LoneTree"];
    CurrentMainTab.set("Boulder");
    let websocketMessageHandlers = {
        "projects.update_project" : (message) => { handleUpdateProjectCommand(message) },
        "projects.add_project" : () => { alert("Adding project!!!"); },
        "projects.delete_project" : () => { alert("Deleting project!!!"); }
    };


    function connectToWebsocket() {
        let token = getToken(false);
        startWebsocketConnection(`${PUBLIC_IP_WS_BACKEND}/ws/project/board/?token=${token}`);

        $ProjectWebsocket.onmessage = (event) => {
            let event_json = JSON.parse(event.data);
            handleReceivedUpdate(event_json, websocketMessageHandlers);
        };
    }


    onMount(async() => {
        PageNameStore.set("Project Board");

        if(!gotoLoginIfNotLoggedIn()) {
            return;
        }

        connectToWebsocket();

        const endpoint = `${PUBLIC_IP_HTTP_BACKEND}/projects/board/`;

        let request = getBaseRequestHeader("GET");

        const response = await fetch(endpoint, request);

        let data = {}

        if(response.status == 200) {
            data = await response.json();
            error = "No projects exist!";
        } else {
            if(response.status == 401) {
                error = "You must be logged in to view this page!";
            } else {
                error = `Error retrieving project board: Error ${response.status}!`;
            }
        }
        
        board = data;
    });


    function compareNames([aId, aFields], [bId, bFields]) {
        let aName = `${aFields['client_name_last']}, ${aFields['client_name_first']}`;
        let bName = `${bFields['client_name_last']}, ${bFields['client_name_first']}`;

        if(aName < bName) {
            return -1;
        } else if(aName > bName) {
            return 1;
        } else {
            return 0;
        }
    }
    function compareDates([aId, aFields], [bId, bFields], fieldName) {
        let aMonth, aDay, aYear;
        let bMonth, bDay, bYear;

        [aMonth, aDay, aYear] = aFields[fieldName].split('_');
        [bMonth, bDay, bYear] = bFields[fieldName].split('_');

        if(aYear < bYear)
            return -1;
        if(aYear > bYear)
            return 1;
        if(aMonth < bMonth)
            return -1;
        if(aMonth > bMonth)
            return 1;
        if(aDay < bDay)
            return -1;
        if(aDay > bDay)
            return 1;
        else
            return compareNames([aId, aFields], [bId, bFields]);
    }
    function compareDueDates(a, b) {
        return compareDates(a, b, "date_due_formatted");
    }
    function compareInDates(a, b) {
        return compareDates(a, b, "date_in_formatted");
    }


    let filters = {
        locations : {
            "Boulder" : true,
            "Wheat Ridge" : true,
            "Lone Tree" : true,
            "Littleton" : true
        },
        media : {
            "Slides" : true,
            "Prints" : true,
            "Negs" : true,
            "Video" : true,
            "Audio" : true,
            "Data" : true
        },
        onlyHardDues : false
    }
    function filterBoard(board, filters, tabName) {
        let ret = Object.entries(board).filter(([projectId, project]) => {
            
            if(filters.onlyHardDues && !project['is_hard_due'])
                return false;
            
            let containsRelevantLocation = false;
            let containsAnyLocationFilters = false;
            if(!project['locations'].includes(tabName)) {
                return false;
            }
            

            /*for(const [location, shouldFilterFor] of Object.entries(filters.media)) {
                containsAnyLocationFilters |= !shouldFilterFor;
                if(shouldFilterFor && project['locations'].includes(location)) {
                    containsRelevantLocation = true;
                    break;
                }
            }*/

            let containsRelevantMedia = false;
            let containsAnyMediaFilters = false;
            for(const [mediaName, shouldFilterFor] of Object.entries(filters.media)) {
                containsAnyMediaFilters |= !shouldFilterFor;
                if(shouldFilterFor && project['media_types'].includes(mediaName)) {
                    containsRelevantMedia = true;
                    break;
                }
            }

            if(containsAnyMediaFilters && !containsRelevantMedia)
                return false;

            return true;
        });
        
        return ret;
    }


    let sorter = "client_name";
    let isAscending = true
    function changeSorter(newSorter) {
        isAscending = sorter == newSorter && isAscending ? false : true;
        sorter = newSorter;
        
        console.log(isAscending);
        console.log(sorter);
    }
    function sortBoard(board, sortBy = "date_due_formatted", ascendingOrder = true) {
        console.log(`Sorting by ${sortBy}, in ${ascendingOrder ? "ascending" : "descending"} order`);
        
        let filteredBoard = board;

        switch(sortBy) {
            /*
            case("location"):
                filteredBoard.sort(compareLocations);
                break;
            */

            case("client_name"):
                filteredBoard.sort(compareNames)
                break;

            case("media_types"):
                alert("Not implemented!");
                break;

            case("date_due_formatted"):
                filteredBoard.sort(compareDueDates);
                break;

            case("date_in_formatted"):
                filteredBoard.sort(compareInDates);
                break;

            default:
                alert("Invalid sortBy option given!");
                return;
        }
        
        if(ascendingOrder) {
            return filteredBoard.reverse();
        } else {
            return filteredBoard;
        }
    }


    let editingMode = false;
    function toggleEditingMode() {
        editingMode = !editingMode;
    }


    let bufferedProjectUpdates = []
    function addProjectUpdate(projectId, columnName, value) {
        for(let i=0; i<bufferedProjectUpdates.length; i++) {
            let bufferedProjectUpdate = bufferedProjectUpdates[i];

            if(bufferedProjectUpdate["id"] == projectId && bufferedProjectUpdate["col"] == columnName) {
                bufferedProjectUpdate["val"] = value;
                return;
            }
        }

        bufferedProjectUpdates.push({
            "type" : "update_project",
            "id" : projectId,
            "col" : columnName,
            "val" : value
        });
    }
    function sendBufferedUpdates() {
        if(bufferedProjectUpdates.length == 0)
            return;
        
        bufferedProjectUpdates.forEach((update) => {
            $ProjectWebsocket.send(JSON.stringify(update));
        })

        bufferedProjectUpdates.length = 0;
    }
    setInterval(sendBufferedUpdates, 500);


    function updateProject(projectId, columnName, value) {
        board[projectId][columnName] = value;

        board = board;
    }
    function handleUpdateProjectCommand(message) {
        console.log("Handling project update!");
        console.log($UserId)
        if($UserId == message["user_id"])
            return;

        let projectId = message["project_id"];
        let columnName = message["col_name"];
        let value = message["col_val"];

        updateProject(projectId, columnName, value);
    }

    let boardDisplay = {};
</script>

{#if Object.entries(board).length > 0}
    <button class="editing-button" on:click={toggleEditingMode}>
        {`Switch to ${editingMode ? "Normal" : "Editing"} Mode`}
    </button>
{/if}
<ListContainer minWidthRem=50 tabs={Object.entries(board).length > 0 ? tabs : []}>
    {#if Object.entries(board).length > 0}
        <div class="listing">
            <ol>
                <div>Location</div>
            </ol>
            <ol>
                <div>Name</div>
                <SortButton func={(ascendingOrder) => { changeSorter("client_name")}}/>
            </ol>
            <ol>
                <div>Received</div>
                <SortButton func={(ascendingOrder) => { changeSorter("date_in_formatted")}}/>
            </ol>
            <ol>
                <div>Due</div>
                <SortButton func={(ascendingOrder) => { changeSorter("date_due_formatted")}}/>
            </ol>
            <ol>
                <div>Media</div>
            </ol>
            <ol>
                <div>Comments</div>
            </ol>
        </div>
        <ListContainerLineBreak />
        {boardDisplay = sortBoard(filterBoard(board, filters, $CurrentMainTab), sorter, isAscending)}
        {#if boardDisplay.length > 0}
            {#each boardDisplay as [projectId, projectListing], i}
                <div class="listing">
                    <ol class="media-container">
                        {#each projectListing['locations'] as location}
                            <li class="media"
                                style="border: 2px solid var(--clr-{location.toLowerCase()}); background-color: var(--clr-{location.toLowerCase()}-1);">
                                {location}
                            </li>
                        {/each}
                    </ol>
                    <div class="listing-info">
                        <a href="/board/{projectId}">{projectListing.client_name_last}, {projectListing.client_name_first}</a>
                    </div>
                    <div class="listing-info">
                        <p>
                            {projectListing.date_in_formatted}
                        </p>
                    </div>
                    <div class="listing-info">
                        <p style="{projectListing.is_hard_due ? "color:red;font-weight:bold" : ""}">
                            {projectListing.date_due_formatted}
                        </p>
                    </div>
                    <ol class="media-container">
                        {#each projectListing['media_types'] as mediaType}
                            <li class="media"
                                style="border: 2px solid var(--clr-{mediaType.toLowerCase()}); background-color: var(--clr-{mediaType.toLowerCase()}-1);">
                                {mediaType}
                            </li>
                        {/each}
                    </ol>     
                    <TextColumn dataSource={boardDisplay}
                        id={projectId}
                        columnName="comments"
                        widthName="boardComments"
                        updateValueFunction={addProjectUpdate}/>
                </div>
                {#if i < boardDisplay.length - 1}
                    <ListContainerLineBreak dotted={true}/>
                {/if}
            {/each}
        {:else}
            <TempMessage>
                There's no projects in {$CurrentMainTab}!
            </TempMessage>
        {/if}
    {:else}
        <TempMessage>
            {error ? error : "Loading project board..."}
        </TempMessage>
    {/if}
</ListContainer>


<style>
    .listing {
        display: grid;
        grid-template-columns: max(7rem, 14%) max(6rem,12%) max(7rem,14%) max(5rem,10%) max(8rem,16%) max(17rem,34%);
        padding: 10px 0px 10px 10px;
    }
    .media-container {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }
    .media {
        margin: 0px 5px 5px 0px;
        padding: 3px;
        border-radius: 10px;
        
        height: 1rem;
    }
    .listing-info {
        margin: auto 0px auto 0px;
    }
    ol {
        display: flex;
        align-items: center;
    }
    .editing-button {
        position: absolute;
        right: 20px;
        top: 15px;
        z-index: 5;
        padding:5px;
        background-color: var(--clr-primary-5-1);
    }
    .editing-button:hover {
        background-color: var(--clr-primary-5-2);
    }   
</style>