<script>
    import { getContext } from 'svelte';
    import { boolToChar } from '$lib/scripts/helpers.js';
    import { widthConsts } from '../widthConsts.js';
    let addGroupUpdate = getContext('addGroupUpdate');

    export let idx, defaultTo, options, name, groupData;

    let width = widthConsts.dpi;

    function updateValue(val) {
        let newValue = val.target.value;
        groupData[name] = newValue;
        addGroupUpdate(idx, name, newValue)
    }
</script>


<select 
    style="flex: {width} 0 {width}rem;"
    on:change={(val) => updateValue(val)}
>   
    {#each options as option}
        {#if groupData[name] == option}
            <option value={option} selected>{option}</option>
        {:else}
            <option value={option}>{option}</option>
        {/if}
    {/each}
</select>


<style>
    select {
        min-width: 0;
        padding: 2.5px;
        margin: 0 -2.5px; /* To fix added padding */
        border-radius: 5px;
        min-height: 20px;
    }
</style>