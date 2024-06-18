<script>
    import { getContext } from 'svelte';
    import { widthConsts } from '../widthConsts.js';
    let sendUpdate = getContext('sendGroupUpdate');

    export let idx, value, name;
    export let width = widthConsts.comments;

    let valueBind = value ?? "";
</script>


<input style="flex: {width} 0 {width}em;"
    on:change={(val) => sendUpdate(idx, name, val.target.value)}
    bind:value={valueBind}
>


<style>
    input {
        min-width: 0;
        background-color: var(--clr-primary-5);
        padding: 2.5px;
        margin: 0px -2.5px; /* Makes up for padding */
        border-radius: 5px;
    }
</style>