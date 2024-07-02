<script>
    import { getContext } from 'svelte';
    import { boolToChar } from '$lib/scripts/helpers.js';
    import { widthConsts } from '../widthConsts.js';
    let sendUpdate = getContext('sendGroupUpdate');

    export let idx, defaultTo, name, groupData;
    console.log(defaultTo);
    let width = widthConsts.corr;
</script>   


<input style="flex: {width} 0 {width}rem;"
    value={groupData[name] ?? defaultTo}
    on:change={(val) => sendUpdate(idx, name, val.target.value)}
>


<style>
    input {
        min-width: 0;
        padding: 2.5px;
        margin: 0 -2.5px; /* To fix added padding */
        border-radius: 5px;
        min-height: 20px;
    }
</style>