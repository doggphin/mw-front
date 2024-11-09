<script>
    import { widthConsts } from '../widthConsts.js';
    import FolderWorkIcon from "$lib/assets/folder_data_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

    export let projectId, mediaType, groupPk;
    export let widthName = "compute";

    import { openModal } from 'svelte-modals'
    import ComputeModal from './ComputeModal.svelte'
    function openFinalCheckModal() {
        openModal(ComputeModal, {projectId: projectId, mediaType: mediaType, groupPk: groupPk})
    }
</script>


<div style="flex: {widthConsts[widthName]} 0 {widthConsts[widthName]}rem">
    <button class="timer-container" alt="Timer Icon" title="Open Automatic File Actions"
        on:click={openFinalCheckModal}>
            <img style="width:100%; height:100%; background-color: none;" src={FolderWorkIcon} alt="Folder Work Icon"/>
    </button>
</div>


<style>
    button {
        min-width: 0;
    }
    img {
        min-width: 0;
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