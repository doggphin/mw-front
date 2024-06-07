
<div class="list-container">
    <slot>
        No content found!
    </slot>
</div>

<style>
.list-container {
        position: relative;
        width: max(40rem, calc(100% - calc(var(--gap-small) * 2)));
        top: var(--gap-small);
        left: var(--gap-small);
        background-color: white;

        border-radius: calc(var(--gap-small) / 2);
        border: 3px solid var(--clr-primary-5-1);
        
        margin-right: var(--gap-small);
    }
</style>