<script>
    import { getContext } from 'svelte';
    import { widthConsts } from '../widthConsts.js';
    let validateChangeGroupNumber = getContext('validateChangeGroupNumber');
    let sortJobsByGroupNumber = getContext('sortJobsByGroupNumber');

    export let groupPk, groupData;
    export let editingMode = false;
    let width = widthConsts.index;

    function tryUpdateIndex(value) {
        let targetStr = value.target.value.toString();
        targetStr.replace(/[^0-9]/g, '');
        while(targetStr.length > 0 && targetStr.charAt(0) === '0') {
            targetStr = targetStr.substring(1);
        }
        let result = targetStr == '' ? 1 : Math.min(32767, parseInt(targetStr));
        let resultStr = result ? result : '';

        // Check if this value is valid 
        if(validateChangeGroupNumber(groupPk, resultStr)) {
            value.target.value = resultStr;
            groupData["group_number"] = resultStr;
            groupData = groupData;
            sortJobsByGroupNumber(false);
            console.log("Changed successfully!");
        } else {
            console.log("Invalid index number!");
        }
        value.target.value = groupData["group_number"];
    }
</script>

{#if editingMode}
    <input
        style="flex: {width} 0 {width}rem;"
        placeholder={groupData['group_number']}
        value={groupData['group_number']}
        on:change={(val) => {tryUpdateIndex(val)}}
    >
{:else}
    <div style="flex: {width} 0 {width}rem;">
        {groupData['group_number']}
    </div>
{/if}


<style>
    input {
        min-width: 0;
        padding: 2.5px;
        margin: 0 -2.5px; /* To fix added padding */
        border-radius: 5px;
        min-height: 20px;
        background-color: var(--clr-primary-5);;
    }
</style>