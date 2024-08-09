<script>
    import { closeModal } from 'svelte-modals'
    import { WorkerWebsocket } from '$lib/scripts/mtd-store.js';
    import { PUBLIC_IP_HTTP_BACKEND, PUBLIC_IP_WS_BACKEND } from '$env/static/public';
  
    // provided by <Modals />
    export let isOpen;
    export let project_id;
    export let group_idx;

    let currentMessage = {};
    let currentProgress = 0;
    WorkerWebsocket.set(new WebSocket(`${PUBLIC_IP_WS_BACKEND}/ws/compute/${project_id}/${group_idx}/`));
    function finalCheck() {
        /*
        Sends JSON of the following form:
        {
            'job' : string: "final_check"
        }
        */
        $WorkerWebsocket.send(JSON.stringify({"job" : "final_check"}));
    }
    $WorkerWebsocket.onopen = (e) => {
        currentMessage = "opened";
    };
    $WorkerWebsocket.onclose = (e) => {
        currentMessage = "closed";
    };
    $WorkerWebsocket.onmessage = (event) => {
        // Expects received JSON of the following form:
        // {
        //      'msg' : string,
        //      'status' : string: "success" | "busy" | "failure" | ""
        // }
        let received = JSON.parse(event.data);
        console.log(received);
        let message = received['msg']??"error: no attached message in response";
        let color = "black";
        switch(received['status']??"") {
            case "success":
                color = "green";
                break;
            case "busy":
                color = "blue";
                break;
            case "failure":
                color = "red";
                break;
            default:
                break;
        }
        currentMessage = {
            msg : message,
            color : color
        };
        console.log(currentMessage.color);
    }
</script>

{#if isOpen}
    <div role="dialog" class="modal">
        <div class="contents">
            <div style="color: {currentMessage.color}">
                {currentMessage.msg}
            </div>
            <button on:click={finalCheck}>Final Check</button>
            <div class="actions">
                <button on:click={closeModal}></button>
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
</style>