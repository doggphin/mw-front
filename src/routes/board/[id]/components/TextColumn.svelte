<script>
    import { getContext } from 'svelte';
    let sendUpdate = getContext('sendGroupUpdate');
    export let idx, currentValue, updateName;
    let value = currentValue ?? "";
</script>


<input
    on:change={(val) => sendUpdate(idx, updateName, val.target.value)}
    bind:value={value}
>


<style>
    input {
        flex: 10 0 10rem;
        min-width: 0;
        background-color: var(--clr-primary-5);
        padding: 2.5px;
    }
</style>