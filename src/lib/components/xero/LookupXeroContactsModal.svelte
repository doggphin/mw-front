<script lang="ts">
    import { closeModal } from 'svelte-modals';
    import { PUBLIC_IP_WS_BACKEND } from '$env/static/public';

    export let isOpen : boolean;

    let firstName : string;
    let lastName : string;
    let emailAddress : string;

    function searchForMatchingUsers(formattedName : string, emailAddress : string) {

    }

    function confirmUser(index : number) {

    }
</script>


{#if isOpen}
    <div role="dialog" class="modal">
        Hello!
    </div>
{/if}


<style>
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
</style>