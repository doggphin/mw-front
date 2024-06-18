<script>
    export let titles = {};
</script>


{#each Object.entries(titles || {}) as [name, width]}
    <li style="flex: {width} 0 {width}rem;">{name}</li>
{/each}