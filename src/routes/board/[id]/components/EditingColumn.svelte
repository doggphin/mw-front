<script>
    import { getContext } from 'svelte';
    import { openModal } from 'svelte-modals';
    import { widthConsts } from '../widthConsts.js';
    import { secondsToFormattedTime } from "$lib/scripts/helpers.js";
    import { editingTypesToLabel, editingTypes } from "$lib/scripts/editing.js"
    import EditingModal from "./EditingModal.svelte";

    import Timer from "$lib/assets/timer_24dp_FILL0_wght400_GRAD0_opsz24.svg";
    import Add from "$lib/assets/add_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    export let idx, name, groupData;

    let width = widthConsts.timer;
    function openTimerModal(editingTag) {
        openModal(EditingModal, { idx: idx, groupData: groupData, editingTag: editingTag})
    }
</script>

<div class="container" style="flex: {width} 0 {width}rem;">

    {#each groupData["editing_tags"] as editingTag}
    <div class="editing-tag-container">
        <div style="min-width: 3em; text-align: start;">
            <button class="editing-tag-time" on:click={openTimerModal(editingTag)}>
                {secondsToFormattedTime(editingTag["time"])}
            </button>
        </div>

        <select>
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

    <button class="editing-tag-container editing-tag-add-container" style="justify-content: center;">
        <img style="height:100%; margin: -5px; background-color: none;" src={Add} alt="Add Icon"/>
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
        margin: 5px 0px;
        padding: 5px 5px;
        background-color: var(--clr-primary-5);
        border-radius: 5px;
        border: none;
        overflow: auto;
    }
    .editing-tag-add-container:hover {
        background-color: var(--clr-primary-5-1);
        border-radius: 5px;
    }
    .editing-tag-time {
        border: none;
        border-radius: 5px;
    }
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
    /*
    input {
        min-width: 0;
        width: 100%;
        min-height: 25px;
        background-color: var(--clr-primary-5);
        border-radius: 5px;
    }
    */
</style>