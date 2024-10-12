<script>
    import { getContext } from 'svelte';
    import Add from "$lib/assets/add_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    export let dotted = false;
    export let insertAtIdx;

    let sendInsertIdxRequest = getContext("sendInsertIdxRequest");
</script>


<div class="line-break" style={dotted ? "border-style: dotted;" : "border-style: solid;"}></div>
{#if true}
    <button class="insert-container noselect" on:click={() => sendInsertIdxRequest(insertAtIdx)}>
        <img style="width:100%; height:100%; scale: 175%; background-color: none;" src={Add} alt="AddIcon"/>
    </button>
{/if}


<style>
    .line-break {
        width: 100%;
        border-bottom: calc(var(--gap-listcontainer) / 2);
        border-bottom: var(--border-size-med) solid var(--clr-primary-5-1);
    }
    .insert-container {
        position: absolute;
        width: 20px;
        height: 20px;
        background-color: white;
        border: 2px solid var(--clr-primary-5-1);
        border-radius: 5px;
        text-align: center;
        
        margin-top: -12.5px;
        margin-left: 5px;
        opacity: 20%;
    }
    .insert-container:hover {
        opacity: 100%;
    }
</style>