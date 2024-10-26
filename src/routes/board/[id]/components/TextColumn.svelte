<script>
    import { getContext } from 'svelte';
    import { widthConsts } from '../widthConsts.js';
    let addGroupUpdate = getContext('addGroupUpdate');

    export let idx, groupData, name, widthName;
    let width = widthConsts[widthName];

    function onChange(val) {
        addGroupUpdate(idx, name, val);
        groupData[name] = val;
    }
</script>


<span
    contenteditable="true"
    style="flex: {width} 0 {width}rem; max-width: {width}"
    spellcheck="false"
    on:input={(e) => onChange(e.target.textContent)}
    textContent={groupData[name] ?? ""}
>
    {groupData[name] ?? ""}
</span>


<style>
    span {
        min-width: 0;
        background-color: var(--clr-primary-5);
        padding: 2.5px;
        margin: 0 -2.5px; /* To fix added padding */
        border-radius: 5px;
        min-height: 20px;
    }
</style>