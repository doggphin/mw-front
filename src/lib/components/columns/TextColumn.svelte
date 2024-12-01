<script>
    import { widthConsts } from '$lib/components/columns/widthConsts.js';

    export let id,
            dataSource,
            columnName,
            widthName,
            updateValueFunction;
    let width = widthConsts[widthName];

    function updateValue(val) {
        updateValueFunction(id, columnName, val)
    }
</script>


<span
    contenteditable="true"
    style="flex: {width} 0 {width}rem; max-width: {width}"
    spellcheck="false"
    on:input={(e) => updateValue(e.target.textContent)}
    textContent={dataSource[id][columnName] ?? ""}
>
    {dataSource[id][columnName] ?? ""}
</span>


<style>
    span {
        align-content: center;
        min-width: 0;
        background-color: var(--clr-primary-5);
        padding: 2.5px;
        margin: 0 -2.5px; /* To fix added padding */
        border-radius: 5px;
        min-height: 20px;
    }
</style>