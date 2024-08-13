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
        let request = {"job" : "final_check"};
        $WorkerWebsocket.send(JSON.stringify(request));
        // Send this message to self to parse faster
        parseMessage({'msg' : 'Running final check...', 'status' : 'busy'});
    }
    function autoFillFields() {
        parseMessage({'msg' : 'This hasn\'t been implemented yet!', 'status' : ''});
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
        let message = JSON.parse(event.data);
        console.log(message);
        parseMessage(message);
    }
    function parseMessage(message) {
        let text = message['msg']??"error: no attached message in response";
        let color = "black";
        switch(message['status']??"") {
            case "success":
                color = "var(--clr-primary-good-1)";
                break;
            case "busy":
                color = "var(--clr-primary-thinking-1)";
                break;
            case "failure":
                color = "var(--clr-primary-bad-1)";
                break;
            default:
                break;
        }
        currentMessage = {
            msg : text,
            color : color
        };
    }
</script>

{#if isOpen}
    <div role="dialog" class="modal">
        <div class="contents">
            <div class="message-box" style="color: {currentMessage.color};">
                <div class="this">
                    {currentMessage.msg}
                </div>
            </div>
            <button on:click={finalCheck}>Final Check</button>
            <button on:click={autoFillFields}>Auto Fill Fields</button>
            <button on:click={closeModal}>Close</button>
        </div>
    </div>
{/if}

<style>
    .this {
        font-weight: 600;
    }
    .message-box {
        margin: 10px;
        text-align: center;
    }
    .contents {
      width: 400px;
      border-radius: 6px;
      padding: 16px;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: auto;
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
    button {
        margin: 10px 0;
    }
</style>