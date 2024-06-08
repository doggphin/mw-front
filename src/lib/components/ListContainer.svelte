<script>
    export let minWidthRem = 40;
</script>


<div class="list-container" style="width: max({minWidthRem}em, calc(100% - calc(var(--gap-small) * 2)));">
    <slot>
        No content found!
    </slot>
</div>

<style>
.list-container {
        position: relative;
        top: var(--gap-small);
        left: var(--gap-small);
        background-color: white;

        border-radius: calc(var(--gap-small) / 2);
        border: var(--border-size-med) solid var(--clr-primary-5-1);
        
        /*margin-right: var(--gap-small);*/
    }
</style>