<script>
    import { getContext } from 'svelte';
    import { widthConsts } from '$lib/components/columns/widthConsts.js';
    import { secondsToHoursMinutesSeconds, 
        hoursMinutesSecondsToSeconds, 
        secondsToFormattedTime, 
        formattedTimeToHoursMinutesSeconds } from "$lib/scripts/helpers.js";
    let addGroupUpdate = getContext('addGroupUpdate');

    export let groupPk, groupData, colName;
    export let widthName = 'number';

    let width = widthConsts[widthName];
    let totalTime = 0;

    function addUpdate(newValue) {
        let targetStr = newValue.target.value.toString().trim();
        console.log(targetStr);

        let hms = formattedTimeToHoursMinutesSeconds(targetStr);

        if(hms != null) {
            totalTime = Number(hoursMinutesSecondsToSeconds(hms[0], hms[1], hms[2]));
            groupData[colName] = totalTime;
            newValue.target.value = secondsToFormattedTime(totalTime);
            addGroupUpdate(groupPk, colName, totalTime);
        } else {
            newValue.target.value = "Invalid format!";
        }
    }
</script>


<input 
    style="flex: {width} 0 {width}rem;"
    value={secondsToFormattedTime(groupData[colName]) ?? ""}
    on:change={(val) => {addUpdate(val)}}
/> 


<style>
    input {
        min-width: 0;
        padding: 2.5px;
        margin: 0 -2.5px; /* To fix added padding */
        border-radius: 5px;
        min-height: 20px;
        background-color: var(--clr-primary-5);
    }
</style>