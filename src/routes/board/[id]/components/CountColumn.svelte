<script>
    import { getContext } from 'svelte';
    import { widthConsts } from '../widthConsts.js';
    let addGroupUpdate = getContext('addGroupUpdate');

    export let idx, groupData, name;
    export let editingMode = false;
    let width = widthConsts.number;
    let intakeIdentifier = `intake_${name}`;
    let finalIdentifier = `final_${name}`;

    $: currentIdentifier = editingMode ? intakeIdentifier : finalIdentifier;

    function getColor(value, placeholder) {
        // If in editing mode, the color should stay default.
        if(editingMode === true) {
            return "var(--clr-primary-5)";
        }
        
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
    $: color = getColor(groupData[finalIdentifier], groupData[intakeIdentifier]);
    $: if(groupData) {
        // If websocket sets value to 0, it should be replaced with an empty string (to display the placeholder value)
        // Looking at this in mid-October, why the F is this being done here and not in the page.svelte???
        if(groupData[finalIdentifier] === 0) {
            groupData[finalIdentifier] = '';
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
            delete groupData[currentIdentifier];
        } else {
            groupData[currentIdentifier] = resultStr;
        }
        addGroupUpdate(idx, currentIdentifier, result ? result : 0);    // why the fudge not just send "result"???
        color = getColor(groupData[finalIdentifier], groupData[intakeIdentifier]);
    }

    // Whenever editing mode changes, we want to update this cell's color.
    function onChange(...args) {
        color = getColor(groupData[finalIdentifier], groupData[intakeIdentifier]);
    }
    $: onChange(editingMode);
</script>
    

<input 
    style="flex: {width} 0 {width}rem;  background-color: {color};"
    placeholder={
        // If in normal mode, set placeholder to intake value.
        // If in editing mode, set placeholder to nothing, since it shouldn't represent anything.
        editingMode ?
            "" :
            groupData[intakeIdentifier] ?? ""
        }
    value={groupData[currentIdentifier] ?? ""}
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