<script>
    import { getContext } from 'svelte';
    import { boolToChar } from '$lib/scripts/helpers.js';
    import { widthConsts } from '../widthConsts.js';
    let addGroupUpdate = getContext('addGroupUpdate');

    export let idx, defaultTo, name, groupData;

    // console.log(defaultTo);
    /* on:change={} (val) => sendUpdate(idx, name, val.target.value)*/

    let width = widthConsts.corr;

    function updateValue(value) {
        let target = value.target.value.toString();
        let charTyped = target.slice(-1).toUpperCase();
        let original = groupData[name];
        let changeTo = false;
        switch(charTyped) {
            case 'Y':
                changeTo = true;
                break;
            case 'N':
                changeTo = false;
                break;
            default:
                groupData[name] = original;
                value.target.value='N';
                return;
        }
        value.target.value = charTyped;
        groupData[name] = changeTo;
        addGroupUpdate(idx, name, changeTo);
    }
</script>   


<input 
    style="flex: {width} 0 {width}rem;"
    value={boolToChar(groupData[name]) ?? defaultTo}
    on:input={(val) => updateValue(val)}
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