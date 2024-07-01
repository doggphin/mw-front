<script>
    export let showLine = true;
    export let dotted = false;
    import ListContainerLineBreak from "$lib/components/ListContainerLineBreak.svelte";
</script>

<ol>
    <slot/>
</ol>
{#if showLine}
    <ListContainerLineBreak dotted={dotted}/>
{/if}

<style>
    ol {
        display: flex;
        align-items: center;
        column-gap: 10px;
        padding: 7.5px 10px;
    }
</style>