<script>
    import { getContext } from 'svelte';
    import { boolToString } from '$lib/scripts/helpers.js';
    import { widthConsts } from '../widthConsts.js';
    let sendUpdate = getContext('sendGroupUpdate');
    export let idx, currentValue, updateName;
    let value = currentValue ?? false;
</script>


<input style="flex: {widthConsts.corr} 0 {widthConsts.corr}rem;"
    on:change={(val) => sendUpdate(idx, updateName, val.target.value)}
    bind:value={value}
>


<style>
    input {
        min-width: 0;
        background-color: var(--clr-primary-5);
        padding: 2.5px;
    }
</style>