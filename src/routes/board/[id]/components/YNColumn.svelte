<script>
    import { getContext } from 'svelte';
    import { boolToString } from '$lib/scripts/helpers.js';
    let sendUpdate = getContext('sendGroupUpdate');
    export let idx, currentValue, updateName;
    let value = currentValue ?? false;
</script>


<input
    on:change={(val) => sendUpdate(idx, updateName, val.target.value)}
    bind:value={value}
>


<style>
    input {
        flex: 2.5 0 2.2.5;
        min-width: 0;
        background-color: var(--clr-primary-5);
        padding: 2.5px;
    }
</style>