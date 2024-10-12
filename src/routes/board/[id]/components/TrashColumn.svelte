<script>
    import { getContext } from 'svelte';
    import Trash from "$lib/assets/delete_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    export let idx;

    let sendDeleteIdxRequest = getContext("sendDeleteIdxRequest");
</script>


<button class="little-button-container trash-container" on:click={() => sendDeleteIdxRequest(idx)}>
    <img style="width:100%; height:100%; background-color: none; size: 200%" src={Trash} alt="Timer Icon"/>
</button>


<style>
    .trash-container {
        position: absolute;
        margin-top: 0px;
        margin-left: -25.5px;
        width: 17.5px;
        height: 17.5px;
        padding: 0px;
    }
</style>