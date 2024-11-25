<script>
    import {PageNameStore, CurrentMainTab } from '$lib/scripts/mtd-store.js';
    import { PUBLIC_IP_HTTP_BACKEND } from '$env/static/public';
    import { onMount } from 'svelte';
    import { getBaseRequestHeader } from "$lib/scripts/helpers.js";
    import ListContainer from "$lib/components/ListContainer.svelte";
    import ListContainerLineBreak from "$lib/components/ListContainerLineBreak.svelte";
    import TempMessage from "$lib/components/TempMessage.svelte";

    import SortButton from "./components/SortButton.svelte";

    let board = {};
    let error = 0;
    let tabs = ["In-Progress", "Finished"];
    CurrentMainTab.set("In-Progress");

    onMount(async() => {
        PageNameStore.set("Project Board");

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


    function compareNames(a, b) {
        let aName = `${a['client_name_last']}, ${a['client_name_first']}`;
        let bName = `${b['client_name_last']}, ${b['client_name_first']}`;

        if(aName < bName) {
            return -1;
        } else if(aName > bName) {
            return 1;
        } else {
            return 0;
        }
    }
    
    function compareLocations(a, b) {
        if(a['location'] < b['location']) {
            return -1;
        } else if(a['location'] > b['location']) {
            return 1;
        } else {
            return compareNames(a, b);
        }
    }

    function compareDates(a, b, fieldName) {
        let aMonth, aDay, aYear;
        let bMonth, bDay, bYear;

        [aMonth, aDay, aYear] = a[fieldName].split('_');
        [bMonth, bDay, bYear] = b[fieldName].split('_');

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
            return compareNames(a, b);
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
        media: {
            "Slides" : true,
            "Prints" : true,
            "Negs" : true,
            "Video" : true,
            "Audio" : true,
            "Data" : true
        },
        onlyHardDues : false
    }

    function filterBoard(board, filters, tab) {
        console.log("filtering");
        return board.filter((project) => {
            let location = project['location'];
            if(!filters.locations[location])

                return false;
            if(filters.onlyHardDues && !project['is_hard_due'])
                return false;

            let containsRelevantMedia = false;
            let containsAnyMediaFilters = false;
            for(const [fMedia, fToFilter] of Object.entries(filters.media)) {
                containsAnyMediaFilters |= !fToFilter;
                if(fToFilter && project['media_types'].includes(fMedia)) {
                    containsRelevantMedia = true;
                    break;
                }
            }
            if(containsAnyMediaFilters && !containsRelevantMedia)
                return false;

            if(tab == "In-Progress" && project["is_complete"])
                return false;

            if(tab == "Finished" && !project["is_complete"])
                return false;

            return true;
        })
    }


    function sortBoard(sortBy = "date_due_formatted", ascendingOrder = true) {  
        switch(sortBy) {
            case("location"):
                filteredBoard.sort(compareLocations);
                break;

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
            filteredBoard = filteredBoard.reverse();
        } else {
            filteredBoard = filteredBoard;
        }
    }

    $: filteredBoard = board?.length > 0 ? filterBoard(board, filters, $CurrentMainTab) : {};
</script>


<ListContainer minWidthRem=50 tabs={tabs}>
    {#if board.length > 0}
        <div class="listing">
            <ol>
                <div>Location</div>
                <SortButton func={(ascendingOrder) => { sortBoard("location", ascendingOrder)}}/>
            </ol>
            <ol>
                <div>Name</div>
                <SortButton func={(ascendingOrder) => { sortBoard("client_name", ascendingOrder)}}/>
            </ol>
            <ol>
                <div>Received</div>
                <SortButton func={(ascendingOrder) => { sortBoard("date_in_formatted", ascendingOrder)}}/>
            </ol>
            <ol>
                <div>Due</div>
                <SortButton func={(ascendingOrder) => { sortBoard("date_due_formatted", ascendingOrder)}}/>
            </ol>
            <ol>
                <div>Media</div>
            </ol>
            <ol>
                <div>Comments</div>
            </ol>
        </div>
        <ListContainerLineBreak />
        {#each filteredBoard as projectListing, i}
            <div class="listing">
                <div class="listing-info">
                    {projectListing['location']}
                </div>
                <div class="listing-info">
                    <a href="/board/{projectListing['id']}">{projectListing.client_name_last}, {projectListing.client_name_first}</a>
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
                    {#each projectListing.media_types as mediaType}
                        <li class="media"
                            style="border: 2px solid var(--clr-{mediaType.toLowerCase()}); background-color: var(--clr-{mediaType.toLowerCase()}-1);">
                            {mediaType}
                        </li>
                    {/each}
                </ol>     
                <div class="listing-info">{projectListing.comments}</div>
            </div>
            {#if i < filteredBoard.length - 1}
                <ListContainerLineBreak dotted={true}/>
            {/if}
        {/each}
    {:else}
        <TempMessage>
            {error ? error : "Loading project board..."}
        </TempMessage>
    {/if}
</ListContainer>


<style>
    .listing {
        display: grid;
        grid-template-columns: max(7rem, 14%) max(8rem,16%) max(7rem,10%) max(5rem,10%) max(13rem,26%) max(10rem,20%);
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
</style>