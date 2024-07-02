<script>
    import { getContext } from 'svelte';
    import { widthConsts } from '../widthConsts.js';
    let addGroupUpdate = getContext('addGroupUpdate');

    export let idx, groupData, name;
    let width = widthConsts.number;
    let intakeId = `intake_${name}`;
    let finalId = `final_${name}`;

    function getColor(value, placeholder) {
        if(placeholder && value && (placeholder != value)) {
            return "var(--clr-primary-warning)";
        }
        else if(!placeholder && !value) {
            return "var(--clr-primary-5)";
        }
        else if(value == placeholder) {
            return "var(--clr-primary-good)";
        }
        else if(placeholder || value) {
            return "var(--clr-primary-5)";
        }
        return "red";
    }
    $: color = getColor(groupData[finalId], groupData[intakeId]);
    $: if(groupData) {
        // If websocket sets value to 0, it should be replaced with an empty string (to display the placeholder value)
        if(groupData[finalId] === 0) {
            groupData[finalId] = '';
            groupData = groupData;
        }
    }

    function updateCount(value) {
        let targetStr = value.target.value.toString();
        targetStr.replace(/[^0-9]/g, '');
        while(targetStr.length > 0 && targetStr.charAt(0) === '0') {
            targetStr = targetStr.substring(1);
        }
        let result = targetStr == '' ? 0 : Math.min(32767, parseInt(targetStr));
        let resultStr = result ? result : '';
        value.target.value = resultStr;
        if(resultStr === '') {
            delete groupData[finalId];
        } else {
            groupData[finalId] = resultStr;
        }
        addGroupUpdate(idx, finalId, result ? result : 0);
        getColor(groupData[finalId], groupData[intakeId]);
        color = "var(--clr-primary-5)";
    }
</script>
    

<input 
    style="flex: {width} 0 {width}rem;  background-color: {color};"
    placeholder={groupData[intakeId] ?? ""}
    value={groupData[finalId] ?? ""}
    on:input={(val) => {updateCount(val)}}
/> 


<style>
    input {
        min-width: 0;
        padding: 2.5px;
        margin: 0 -2.5px; /* To fix added padding */
        border-radius: 5px;
        min-height: 20px;
    }
</style>