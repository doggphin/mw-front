<script>
    import { getContext } from 'svelte';
    import { widthConsts } from '../widthConsts.js';
    import Timer from "$lib/assets/timer_24dp_FILL0_wght400_GRAD0_opsz24.svg";

    export let idx, value, name;
    let width = widthConsts.timer;

    import { openModal } from 'svelte-modals'
    function openTimerModal() {
        openModal(Modal, { title: "Alert", message: "This is an alert" })
    }
    /*         on:change={(val) => sendUpdate(idx, name, val.target.value)} */
</script>

<div class="container" style="flex: {width} 0 {width}rem;">
    <input
        value={value ?? ""}
    >

    <button class="timer-container" src={Timer} alt="Timer Icon" on:click={openTimerModal}>
        <img style="width:100%; height:100%; background-color: none;" src={Timer} alt="Timer Icon"/>
    </button>
</div>


<style>
    .container {
        position: relative;
        display: flex;
        min-width: 0;
        margin: 0 -2.5px;
    }
    .timer-container {
        margin-top: 2.5px;
        margin-left: -20px;
        width: 20px;
        height: 20px;
        border: none;
	    padding: 0;
        outline: inherit;
        border-radius: 5px;
        background-color: none;
        transition-duration: .2s;
    }
    .timer-container:hover {
        background-color: var(--clr-primary-5-2);
        transition-duration: .2s;
    }
    input {
        min-width: 0;
        width: 100%;
        min-height: 25px;
        background-color: var(--clr-primary-5);
        border-radius: 5px;
    }
</style>