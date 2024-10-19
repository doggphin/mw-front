<script>
  import { getContext } from 'svelte';
  import { closeModal } from 'svelte-modals';
  import { editingTypesToLabel } from "$lib/scripts/editing.js";
  import RestartIcon from "$lib/assets/replay_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  import StartIcon from "$lib/assets/play_arrow_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  import StopIcon from "$lib/assets/stop_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  import TrashIcon from "$lib/assets/delete_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  let addEditingTagDeleteRequest = getContext('addEditingTagDeleteRequest');

  export let isOpen;
  export let idx, editingTag;

  let isTicking = false;
  let hours = Math.floor(editingTag["time"] / 3600);
  let minutes = Math.floor((editingTag["time"] / 60) - (hours / 60));
  let seconds = editingTag["time"] % 60;

  function padTime(time) {
    return time.toString().padStart(2, '0');
  }

  let secondsAtStartOfClock = 0;
  function incrementClock() {
    seconds += 1;
    if(seconds > 60) {
      seconds = 0;
      minutes += 1;
      if(minutes > 60) {
        minutes = 0;
        hours += 1;
      }
    }
  }

  let clockInterval = null;
  function startClock() {
    if(isTicking) {
      stopClock();
    } else {
      isTicking = true;
      secondsAtStartOfClock = editingTag["time"];
      clockInterval = setInterval(incrementClock, 1000);
    }
  }

  function stopClock() {
    isTicking = false;
    clearInterval(clockInterval);
  }

  function resetClock() {
    stopClock();
    seconds = 0;
    minutes = 0;
    hours = 0;
  }

  // https://github.com/sveltejs/svelte/issues/5799 might be the culprit..?
  function deleteEditingTag() {
    addEditingTagDeleteRequest(idx, editingTag["id"]);
    closeModal();
  }
</script>


{#if isOpen}
  <div role="dialog" class="modal">
    <div class="contents">

      <h2>{`Editing time for ${editingTypesToLabel[editingTag["editing_type"]]} of Group ${idx}`}</h2>

      <div style="margin: 125px 80px;"> a clock should go here :)</div>
      <div class="time-inputs-container">
        <input value={padTime(hours)}>
        <div style="margin: 10px 0px;"> : </div>
        <input value={padTime(minutes)}>
        <div style="margin: 10px 0px;"> : </div>
        <input value={padTime(seconds)}>
      </div>

      <div class="time-actions-container">
        <button class="icon-button" on:click={resetClock}>
          <img class="icon" src={RestartIcon} alt="Restart"/>
        </button>
        <button class="icon-button"
          style="{isTicking ? "background-color: var(--clr-primary-5-2)" : ""}"
          on:click={startClock}
        >
          <img class="icon" src={StartIcon} alt="Start"/>
        </button>
        <button class="icon-button" on:click={stopClock}>
          <img class="icon" src={StopIcon} alt="Stop"/>
        </button>
      </div>

      <div class="bottom-container">
        <button class="icon-button"
          on:click={deleteEditingTag}
        >
          <img class="icon" src={TrashIcon} alt="Delete"/>
        </button>
        <button class="exit">
          Exit
        </button>
      </div>
    </div>
  </div>
{/if}
  

<style>
  .bottom-container {
    display: flex;
    justify-content: space-between;
  }
  .icon {
    height:100%;
    background-color: none;
  }
  .exit {
    padding: 5px 10px;
  }

  button {
    font-size: inherit;
    border: none;
    border-radius: 10px;
    margin: 5px;
    display: flex;
    justify-content: center;
    padding: 5px;
  }
  .icon-button {
    width: 40px;
    height: 40px;
  }
  .time-actions-container {
    display: flex;
    justify-content: center;
  }

  .time-inputs-container {
    display: flex;
    justify-content: center;
  }

  input {
    background-color: var(--clr-primary-5);
    text-align: center;
    margin: 10px;
    width: 5rem;
  }

  .modal {
    z-index: 101;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    /* allow click-through to backdrop */
    pointer-events: none;
  }

  .contents {
    min-width: 240px;
    border-radius: 6px;
    padding: 16px;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: auto;
  }

  h2 {
    text-align: center;
    font-size: 20px;
  }
</style>