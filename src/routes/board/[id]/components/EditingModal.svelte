<script>
  import { getContext } from 'svelte';
  import { closeModal } from 'svelte-modals';
  import { conformStringToNumber, secondsToHoursMinutesSeconds, hoursMinutesSecondsToSeconds } from "$lib/scripts/helpers.js";
  import RestartIcon from "$lib/assets/replay_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  import StartIcon from "$lib/assets/play_arrow_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  import StopIcon from "$lib/assets/stop_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  import TrashIcon from "$lib/assets/delete_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  //let addEditingTagUpdateRequest = getContext('addEditingTagUpdateRequest');

  export let isOpen;
  export let groupPk, groupData, editingTag, addEditingTagUpdateRequest, addEditingTagDeleteRequest;

  let isTicking = false;

  let totalTime = editingTag["time"];
  let seconds = totalTime % 60;
  let minutes = Math.floor((totalTime - seconds) / 60) % 60;
  let hours = Math.floor((totalTime - minutes * 60 - seconds) / 3600);

  function addTimeUpdateRequestAndClose() {
    addEditingTagUpdateRequest(groupPk, editingTag['id'], null, totalTime);
    closeModal();
  }


  function padTime(time) {
    return time.toString().padStart(2, '0');
  }


  function balanceMeasurements() {
    updateTotalTimeFromMeasurements();
    updateMeasurementsFromTotalTime();
  }

  
  function setMeasurement(value, measurement) {
    let conformed = conformStringToNumber(value.target.value, 32767);
    value.target.value = conformed;
    switch(measurement) {
      case "seconds":
        seconds = conformed;
        break;
      case "minutes":
        minutes = conformed;
        break;
      case "hours":
        hours = conformed;
        break;
      default:
        console.log("Unrecognized time measurement!");
        break;
    }
  }


  function updateMeasurementsFromTotalTime() {
    let hms = secondsToHoursMinutesSeconds(totalTime);

    hours = hms[0];
    minutes = hms[1];
    seconds = hms[2];
  }


  function updateTotalTimeFromMeasurements() {
    totalTime = hoursMinutesSecondsToSeconds(hours, minutes, seconds);
  }


  function incrementClock() {
    totalTime += 1;
    updateMeasurementsFromTotalTime();
  }


  let clockInterval = null;
  function startClock() {
    if(isTicking) {
      stopClock();
    } else {
      isTicking = true;
      clockInterval = setInterval(incrementClock, 1000);
    }
  }


  function stopClock(sendUpdate = true) {
    if(sendUpdate && isTicking) {
      updateTotalTimeFromMeasurements();
      addEditingTagUpdateRequest(groupPk, editingTag['id'], null, totalTime);
    }
    isTicking = false;
    clearInterval(clockInterval);
  }


  function resetClock() {
    stopClock(false);
    totalTime = 0;
  }


  // https://github.com/sveltejs/svelte/issues/5799 might be the culprit..?
  // TODO: export deleteEditingTag as a field to be set when creating the modal
  function deleteEditingTag() {
    addEditingTagDeleteRequest(groupPk, editingTag["id"]);
    closeModal();
  }
</script>


{#if isOpen}
  <div role="dialog" class="modal">
    <div class="contents">

      <h2>{`Editing time for ${editingTag["editing_type"]} of Group ${groupData['group_number']}`}</h2>

      <div style="margin: 125px 80px;"> a clock should go here :)</div>
      <div class="time-inputs-container">
        <input value={padTime(hours)}
        on:input={(val) => {setMeasurement(val, "hours")}}
        on:change={balanceMeasurements}>

        <div style="margin: 10px 0px;"> : </div>

        <input value={padTime(minutes)}
        on:input={(val) => {setMeasurement(val, "minutes")}}
        on:change={balanceMeasurements}>

        <div style="margin: 10px 0px;"> : </div>

        <input value={padTime(seconds)}
        on:input={(val) => {setMeasurement(val, "seconds")}}
        on:change={balanceMeasurements}>
      </div>

      <div class="time-actions-container">
        <button class="icon-button"on:click={resetClock}>
          <img class="icon" src={RestartIcon} alt="Restart"/>
        </button>
        <button class="icon-button" on:click={startClock} style="{isTicking ? "background-color: var(--clr-primary-5-2)" : ""}">
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
        <button class="exit" on:click={addTimeUpdateRequestAndClose}>
          Save & Exit
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