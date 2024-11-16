<script>
    import { getContext } from 'svelte';
    import { boolToChar } from '$lib/scripts/helpers.js';
    import { widthConsts } from '../widthConsts.js';
    let addGroupUpdate = getContext('addGroupUpdate');

    export let groupPk, defaultTo, colName, groupData;
    export let editingMode = false;

    // console.log(defaultTo);
    /* on:change={} (val) => sendUpdate(groupPk, name, val.target.value)*/

    let width = widthConsts.corr;

    function updateValue(value) {
        let target = value.target.value.toString();
        let charTyped = target.slice(-1).toUpperCase();
        let original = groupData[colName];
        let changeTo = false;
        switch(charTyped) {
            case 'Y':
                changeTo = true;
                break;
            case 'N':
                changeTo = false;
                break;
            default:
                groupData[colName] = original;
                value.target.value = 'N';
                return;
        }
        value.target.value = charTyped;
        groupData[colName] = changeTo;
        addGroupUpdate(groupPk, colName, changeTo);
    }
</script>   


{#if editingMode}
    <input 
        style="flex: {width} 0 {width}rem;"
        value={boolToChar(groupData[colName]) ?? defaultTo}
        on:input={(val) => updateValue(val)}
    >
{:else}
    <div style="flex: {width} 0 {width}rem;">
        {boolToChar(groupData[colName] ?? defaultTo)}
    </div>
{/if}


<style>
    input {
        min-width: 0;
        padding: 2.5px;
        margin: 0 -2.5px; /* To fix added padding */
        border-radius: 5px;
        min-height: 20px;
        background-color: var(--clr-primary-5);
    }
    div {
        min-width: 0;
    }
</style>