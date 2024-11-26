<script>
    import { widthConsts } from './widthConsts.js';

    export let id,
        dropdownOptions,
        columnName,
        dataSource,
        updateValueFunction,
        requireEditingMode = false,
        editingMode = false,
        widthName = "dropdown";

    let width = widthConsts[widthName];

    function updateValue(val) {
        updateValueFunction(id, columnName, val.target.value)
    }
</script>


{#if !requireEditingMode || editingMode}
    <select class="hide-text"
        style="flex: {width} 0 {width}rem;"
        on:change={(val) => updateValue(val)}
    >
        {#each dropdownOptions as option}
            {#if dataSource[columnName] == option}
                <option value={option} selected>{option}</option>
            {:else}
                <option value={option}>{option}</option>
            {/if}
        {/each}
    </select>
{:else}
    <div class="hide-text" style="flex: {width} 0 {width}rem;">
        {dataSource[columnName]}
    </div>
{/if}


<style>
    select {
        min-width: 0;
        padding: 2.5px;
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