<script>
    import { getContext } from 'svelte';
    import Add from "$lib/assets/add_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    export let dotted = false;
    export let drawInsert = false;
    export let endOfContainerInsert = false;
    export let insertAtIdx;

    let sendInsertIdxRequest = getContext("sendInsertIdxRequest");
</script>


<!-- Always draw line if this line UNLESS it's marked an endOfContainerInsert. -->
{#if !endOfContainerInsert}
    <!-- Set the border style depending on variable dotted -->
    <div class="line-break"
        style="border-style: {dotted ? "dotted" : "solid"};
        {drawInsert ? "margin-bottom: 10px; margin-top: 10px;" : ""}">
    </div>
{/if}

{#if drawInsert}
    {#if endOfContainerInsert}
        <div style="margin-bottom: 10px;"></div>
    {/if}
    <!-- If marked as an endOfContainerInsert, nudge the button down a bit to be flush with its container. -->
    <button class="insert-container noselect {endOfContainerInsert ? "insert-container-nudge-down" : ""}"
    on:click={() => sendInsertIdxRequest(insertAtIdx)}
    title="Add Row">
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
        width: 25px;
        height: 25px;
        background-color: white;
        border: 2px solid var(--clr-primary-5-1);
        border-radius: 5px;
        text-align: center;
        
        margin-top: -23px;
        margin-left: 5px;
        opacity: 20%;
    }
    .insert-container:hover {
        opacity: 100%;
    }
    .insert-container-nudge-down {
        margin-top: -12px;
        margin-bottom: 10px;
    }
</style>