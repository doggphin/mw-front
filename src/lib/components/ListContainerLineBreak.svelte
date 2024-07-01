<script>
    export let dotted = false;
</script>


<div class="line-break" style={dotted ? "border-style: dotted;" : "border-style: solid;"}></div>


<style>
    .line-break {
        width: 100%;
        border-bottom: calc(var(--gap-listcontainer) / 2);
        border-bottom: var(--border-size-med) solid var(--clr-primary-5-1);
    }
</style>