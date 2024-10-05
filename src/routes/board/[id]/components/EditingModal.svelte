<script>
    import { closeModal } from 'svelte-modals'
  
    // provided by <Modals />
    export let isOpen;

    export let idx, defaultTo, name, groupData;
  
    let editingTimes = {
      editing_times : [
        {
          "editing_type" : "Restoration",
          "time" : 0,
        },
        {
          "editing_type" : "Replace",
          "time" : 0
        },
        {
          "editing_type" : "Remove",
          "time" : 0
        },
        {
          "editing_type" : "Other",
          "time" : 0
        }
      ]
    }
</script>
  {#if isOpen}
    <div role="dialog" class="modal">
      <div class="contents">

        <h2>{"Editing time for Group " + idx}</h2>

        <div class="editing-table">

          {#each editingTimes.editing_times as editingTime}
            <div class="editing-row">
              {editingTime["editing_type"]}
              <input value={editingTime["time"]}>
            </div>
          {/each}
          
        </div>

        <div class="actions">
          <button on:click={closeModal}>OK</button>
        </div>

      </div>
    </div>
  {/if}
  
  <style>
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

    input {
      max-width: 100px;
    }

    .editing-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 10px;
    }

    .editing-table {
      margin-top: 10px;
      background: var(--clr-primary-5-1);
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
      font-size: 24px;
    }
  
    .actions {
      margin-top: 32px;
      display: flex;
      justify-content: flex-end;
    }

  </style>