<script>
    import { getContext } from 'svelte';
    import { boolToChar } from '$lib/scripts/helpers.js';
    import { widthConsts } from '../widthConsts.js';
    let addGroupUpdate = getContext('addGroupUpdate');

    export let groupPk, options, colName, groupData;
    export let requireEditingMode = false;
    export let editingMode = false;

    let width = widthConsts.dropdown;

    function updateValue(val) {
        let newValue = val.target.value;
        groupData[colName] = newValue;
        addGroupUpdate(groupPk, colName, newValue)
    }

    $: editingMode;
</script>


{#if !requireEditingMode || editingMode}
    <select class = "hide-text"
        style="flex: {width} 0 {width}rem;"
        on:change={(val) => updateValue(val)}
    >
        {#each options as option}
            {#if groupData[colName] == option}
                <option value={option} selected>{option}</option>
            {:else}
                <option value={option}>{option}</option>
            {/if}
        {/each}
    </select>
{:else}
    <div class="hide-text" style="flex: {width} 0 {width}rem;">
        {groupData[colName]}
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
    .hide-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis; 
    }
</style>