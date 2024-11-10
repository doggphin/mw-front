<script>
    import { CurrentMainTab } from '$lib/scripts/mtd-store.js';
    import AddIcon from "$lib/assets/add_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

    export let minWidthRem = 0;
    export let minWidthPx = 0;
    export let tabs = [];

    // Should be a function that does something
    export let addTab = null;

    function setTab(tabName) {
        CurrentMainTab.set(tabName["tab"]);
    }
</script>

<!-- 
    I'm going to hell for the contents of this file -- avert your eyes :)
    Hacky workaround to make the page have a 20px border on the right
-->
<div style="width:calc(calc({minWidthRem}rem + {minWidthPx}px) + calc(var(--gap-listcontainer) * 2)); height: 0.01px; background-color: green; opacity: 0%"></div>

{#if tabs.length}
    <ol style="--minWidth: calc({minWidthRem}rem + {minWidthPx}px);" class="container-spacer tab-bar">
        <li class="tabs-indent"/>
        {#each tabs as tab}
            <li class="tab" style="{tab == $CurrentMainTab ? "border-bottom-width: 0px;" : "background-color: var(--clr-primary-5-1);"}">
                <button on:click={ setTab({tab}) }>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            </li>
        {/each}
        {#if addTab != null}
        <li class="tab" style="background-color: var(--clr-primary-5-1)">
            <button on:click={ addTab() }>
                <img style="height:100%; margin: -5px; background-color: none;" src={AddIcon} alt="Add Icon"/>
            </button>
        </li>
        {/if}
    </ol>
{/if}

<div style="--minWidth: calc({minWidthRem}rem + {minWidthPx}px); top: {tabs.length && $CurrentMainTab  ? "0px" : "var(--gap-listcontainer)"};" class="container-spacer list-container">
    <slot>
        No content found!
    </slot>
</div>


<style>
    .container-spacer {
        position: relative;
        left: var(--gap-listcontainer);
        width: max(calc(100% - calc(var(--gap-listcontainer) * 2)), var(--minWidth));
    }
    .list-container {
        background-color: white;
        border-radius: calc(var(--gap-listcontainer) / 2);
        border: var(--border-size-med) solid var(--clr-primary-5-1);
    }
    .tab-bar {
        display: flex;
        margin-top: var(--gap-listcontainer);
        margin-bottom: calc(var(--border-size-med) * -1);
        z-index: 1;
    }
    .tabs-indent {
        width: 20px;
    }
    .tab {
        text-align: center;
        padding: 5px 10px;
        margin: 0px 1px;
        border-radius: 8px 8px 0px 0px;
        border: var(--border-size-med) solid var(--clr-primary-5-1);
        background-color: white;
    }
    /* https://stackoverflow.com/a/45890842 */
    button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }
</style>