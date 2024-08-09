<script>
    import { widthConsts } from '../widthConsts.js';
    export let project_id;
    export let group_idx;
    export let media_type = " ";
    import FolderWorkIcon from "$lib/assets/folder_data_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    let width = widthConsts.compute;

    import { openModal } from 'svelte-modals'
    import ComputeModal from './ComputeModal.svelte'
    function openFinalCheckModal() {
        openModal(ComputeModal, {group_idx: group_idx, project_id: project_id, media_type: media_type})
    }
</script>


<div class = "container" style="flex: {width} 0 {width}rem">
    <button class="timer-container" alt="Timer Icon" on:click={openFinalCheckModal}>
        <img style="width:100%; height:100%; background-color: none;" src={FolderWorkIcon} alt="Folder Work Icon"/>
    </button>
</div>


<style>
    .container {
        display: flex-right;
        margin: 0 -2.5px;
    }
    .timer-container {
        width: 25px;
        height: 25px;
        border: none;
	    padding: 0;
        outline: inherit;
        border-radius: 5px;
        background-color: none;
        transition-duration: .2s;
        float: right;
    }
    .timer-container:hover {
        background-color: var(--clr-primary-5-2);
        transition-duration: .2s;
    }
</style>