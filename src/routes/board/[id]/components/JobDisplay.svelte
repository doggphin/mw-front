<script>
    import ListContainerLineBreak from "$lib/components/ListContainerLineBreak.svelte";
    import TitleRow from "./TitleRow.svelte";
    import { widths } from "./../widthConsts.js";

    export let name, editingMode, maxGroupNumber;
</script>


<ol>
    <TitleRow titles={widths[name]}/>
</ol>
{#if maxGroupNumber > 0}
    <ListContainerLineBreak insertAtGroupNumber=1
        drawInsert={editingMode}
    />
{/if}

<slot/>

<ListContainerLineBreak insertAtGroupNumber = { maxGroupNumber + 1}
    endOfContainerInsert = {true}
    drawInsert = {editingMode}
/>


<style>
    ol {
        display: flex;
        align-items: center;
        column-gap: 10px;
        padding: 7.5px 10px;
    }
</style>