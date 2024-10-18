<script>
  import { closeModal } from 'svelte-modals';
  import { editingTypesToLabel } from "$lib/scripts/editing.js";

  import Restart from "$lib/assets/timer_24dp_FILL0_wght400_GRAD0_opsz24.svg";
  import Start from "$lib/assets/play_arrow_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  import Stop from "$lib/assets/stop_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

  export let isOpen;
  export let idx, editingTag;

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
    secondsAtStartOfClock = editingTag["time"];
    clockInterval = setInterval(incrementClock, 1000);
  }


</script>


{#if isOpen}
  <div role="dialog" class="modal">
    <div class="contents">

      <h2>{`Editing time for ${editingTypesToLabel[editingTag["editing_type"]]} of Group ${idx}`}</h2>

      <div class="time-inputs-container">
        <input value={padTime(hours)}>
        <input value={padTime(minutes)}>
        <input value={padTime(seconds)}>
      </div>

      <div class="time-actions-container">
        <button>
          <img style="height:100%; background-color: none;" src={Restart} alt="Restart"/>
        </button>
        <button>
          <img style="height:100%; background-color: none;" src={Start} alt="Start"/>
        </button>
        <button>
          <img style="height:100%; background-color: none;" src={Stop} alt="Stop"/>
        </button>
      </div>
    </div>
  </div>
{/if}
  

<style>
  button {
    border: none;
    border-radius: 5px;
    margin: 5px;
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