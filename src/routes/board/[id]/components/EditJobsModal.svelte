<script>
    import { closeModal } from 'svelte-modals';

    export let isOpen;

    export let jobsToAdd, jobsToRemove;
    export let requestAddJob, requestDeleteJob;

    function clickAddJob(jobName) {
      requestAddJob(jobName);
      closeModal();
    }

    function clickDeleteJob(jobName) {
      requestDeleteJob(jobName);
      closeModal();
    }
</script>


{#if isOpen}
  <div role="dialog" class="modal">
      <div class="contents">
        {#if !jobsToAdd.length}
          <h5> All jobs are present in this project. Choose job type(s) to remove.</h5>
        {:else if !jobsToRemove.length}
          <h5> No jobs have been added to this project. Choose job type(s) to add.</h5>
        {:else}
          <h5> Choose job types to add or remove. </h5>
        {/if}

        {#if jobsToAdd.length}
          <h5> Add a job: </h5>
          {#each jobsToAdd as jobName}
              <button class="job-listing green-hover" on:click={clickAddJob(jobName)}>
                  {jobName}
              </button>
          {/each}
        {/if}
        
        {#if jobsToRemove.length}
          <h5> Delete a job: </h5>
          {#each jobsToRemove as jobName}
              <button class="job-listing red-hover" on:click={clickDeleteJob(jobName)}>
                  {jobName}
              </button>
          {/each}
        {/if}
      </div>
  </div>
{/if}


<style>
  button {
    margin: 2.5px 0;
  }
  h5 {
    margin: 5px;
  }

  .modal {
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
    z-index: 101;
    position: fixed;
    align-items: center;

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

  .job-listing {
    background-color: var(--clr-primary-5);
  }

  .green-hover:hover {
    background-color: green;
  }

  .red-hover:hover {
    background-color: red;
  }
</style>