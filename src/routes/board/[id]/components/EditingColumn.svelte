<script>
    import { getContext } from 'svelte';
    import { openModal } from 'svelte-modals';
    import { widthConsts } from '../widthConsts.js';
    import { secondsToFormattedTime } from "$lib/scripts/helpers.js";
    import { editingTypesToLabel, editingTypes } from "$lib/scripts/editing.js"
    import EditingModal from "./EditingModal.svelte";
    import AddIcon from "$lib/assets/add_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    let addEditingTagUpdateRequest = getContext('addEditingTagUpdateRequest');
    let addEditingTagDeleteRequest = getContext('addEditingTagDeleteRequest');
    let addEditingTagAddRequest = getContext('addEditingTagAddRequest');

    export let idx, groupData;

    let width = widthConsts.editing;
    function openTimerModal(editingTag) {
        openModal(EditingModal, { idx: idx, 
            groupData: groupData, 
            editingTag: editingTag, 
            addEditingTagUpdateRequest : addEditingTagUpdateRequest,
            addEditingTagDeleteRequest : addEditingTagDeleteRequest
        });
    }
</script>


<div class="container" style="flex: {width} 0 {width}rem;">

    {#each groupData["editing_tags"] as editingTag}
    <div class="editing-tag-container">
        <button class="editing-time"
        on:click={openTimerModal(editingTag)}>
            {secondsToFormattedTime(editingTag["time"])}
        </button>

        <select class="editing-type"
        on:change={(val) => addEditingTagUpdateRequest(idx, editingTag['id'], val.target.value, null)}>
            {#each editingTypes as editingType}
                {#if editingType === editingTypesToLabel[editingTag["editing_type"]]}
                    <option value={editingType} selected>{editingType}</option>
                {:else}
                    <option value={editingType}>{editingType}</option>
                {/if}
            {/each}
        </select>
    </div>
    {/each}

    <button class="editing-tag-container editing-tag-add-container"
        on:click={addEditingTagAddRequest(idx)}
        title="Add Editing Record"
    >
        <img style="height:100%; margin: -5px; background-color: none;" src={AddIcon} alt="Add Icon"/>
    </button>

    <!--
    <button class="timer-container" src={Timer} alt="Timer Icon" on:click={openTimerModal}>
        <img style="width:100%; height:100%; background-color: none;" src={Timer} alt="Timer Icon"/>
    </button>
    -->
</div>


<style>
    .container {
        position: relative; 
        min-width: 0;
        margin: 0 -2.5px;
    }
    .editing-tag-container {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 5px 0px;
        margin: 5px 0px;
        background-color: var(--clr-primary-5);
        border-radius: 5px;
        border: none;
        overflow: auto;
    }

    .editing-tag-add-container {
        justify-content: center;
    }
    .editing-tag-add-container:hover {
        background-color: var(--clr-primary-5-1);
        border-radius: 5px;
    }


    .editing-time {
        border: none;
        border-radius: 5px;
        margin-left: 5px;
        background-color: var(--clr-primary-5);
    }
    .editing-time:hover {
        background-color: var(--clr-primary-5-1);
    }
    .editing-type {
        margin-right: 5px;
        min-width: 0;
        text-overflow: ellipsis;
        overflow: hidden;
    }
</style>

<!--
    .timer-container {
        margin-top: 2.5px;
        margin-left: -20px;
        width: 20px;
        height: 20px;
        border: none;
	    padding: 0;
        outline: inherit;
        border-radius: 5px;
        background-color: none;
        transition-duration: .2s;
    }
    .timer-container:hover {
        background-color: var(--clr-primary-5-2);
        transition-duration: .2s;
    }   
-->