<script>
    import { getContext } from 'svelte';
    import { boolToChar } from '$lib/scripts/helpers.js';
    import { widthConsts } from '../widthConsts.js';
    let addGroupUpdate = getContext('addGroupUpdate');

    export let idx, defaultTo, options, name, groupData;
    export let editingMode = false;

    let width = widthConsts.dpi;

    function updateValue(val) {
        let newValue = val.target.value;
        groupData[name] = newValue;
        addGroupUpdate(idx, name, newValue)
    }

    $: editingMode;
</script>


{#if editingMode}
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
{:else}
    <div style="flex: {width} 0 {width}rem;">
        {groupData[name]}
    </div>
{/if}


<style>
    select {
        min-width: 0;
        padding: 2.5px;
        margin: 0 -2.5px; /* To fix added padding */
        border-radius: 5px;
        min-height: 25px;
        border-style: none;
    }
    select:hover {
        background-color: var(--clr-primary-5-1);
    }
</style>