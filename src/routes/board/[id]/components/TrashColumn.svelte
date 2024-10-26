<script>
    import { getContext } from 'svelte';
    import Trash from "$lib/assets/delete_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    export let idx;
    export let editingMode = false;

    let sendDeleteIdxRequest = getContext("sendDeleteIdxRequest");
</script>

{#if editingMode}
    <button class="little-button-container trash-container"
    on:click={() => sendDeleteIdxRequest(idx)}
    title="Delete Row">
        <img style="width:100%; height:100%; background-color: none; size: 200%" src={Trash} alt="Timer Icon"/>
    </button>
{/if}


<style>
    .trash-container {
        position: absolute;
        margin-top: 0px;
        margin-left: -33.5px;
        width: 25px;
        height: 25px;
        padding: 0px;
    }
</style>