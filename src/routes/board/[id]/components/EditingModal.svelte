<script>
    import { closeModal } from 'svelte-modals'
  
    export let isOpen;
    export let idx, groupData, editingTagName;
</script>


{#if isOpen}
  <div role="dialog" class="modal">
    <div class="contents">

      <h2>{"Editing time for Group " + idx}</h2>

      <div class="editing-table">
        
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