<script>
    import { getContext } from 'svelte';
    import { widthConsts } from '../widthConsts.js';
    let addGroupUpdate = getContext('addGroupUpdate');

    export let groupPk, groupData, finalName;
    export let intakeName = null;
    export let editingMode = false;
    export let overlayCounts = false;
    export let warnOnDifferent = false;
    export let enforceNumbers = false;
    export let showZeroes = false;
    export let widthName = 'number';
    let width = widthConsts[widthName];

    $: currentIdentifier = overlayCounts ? 
        editingMode ? 
            intakeName 
            : finalName
        : finalName;

    function getColor(value, placeholder) {
        // If in editing mode, the color should stay default.
        if(overlayCounts && warnOnDifferent) {
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
        } else {
            return "var(--clr-primary-5)";
        }
    }
    $: color = warnOnDifferent ? 
        getColor(groupData[finalName], groupData[intakeName]) 
        : "var(--clr-primary-5)";
    $: if(groupData) {
        // If websocket sets value to 0, it should be replaced with an empty string (to display the placeholder value)
        // Looking at this in mid-October, why the F is this being done here and not in the page.svelte???
        if(groupData[finalName] === 0) {
            groupData[finalName] = '';
            groupData = groupData;
        }
    }

    function addUpdate(value) {
        if(enforceNumbers) {
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
            addGroupUpdate(groupPk, currentIdentifier, result ? result : 0);    // why the fudge not just send "result"???
            color = warnOnDifferent ?
                getColor(groupData[finalName], groupData[intakeName])
                : "var(--clr-primary-5)";
        } else {
            addGroupUpdate(groupPk, currentIdentifier, value.target.value.toString());
            color = "var(--clr-primary-5)";
        }
    }

    // Whenever editing mode changes, we want to update this cell's color.
    function onChange(...args) {
        if(warnOnDifferent) {
            color = getColor(groupData[finalName], groupData[intakeName]);
        }
    }
    $: onChange(editingMode);
</script>
    

<input 
    style="flex: {width} 0 {width}rem;  background-color: {color};"
    placeholder={
        // If in normal mode, set placeholder to intake value.
        // If in editing mode, set placeholder to nothing, since it shouldn't represent anything.
        overlayCounts ?
            editingMode ?
                ""
                : groupData[intakeName] ? 
                    showZeroes ?
                        groupData[intakeName]
                        : ""
                    : ""
            : groupData[intakeName]
        }
    value={groupData[currentIdentifier] == null ? 
        "" 
        : groupData[currentIdentifier] == 0 ? 
            showZeroes ?
                0 :
                ""
            : groupData[currentIdentifier]
    }
    on:input={(val) => {addUpdate(val)}}
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