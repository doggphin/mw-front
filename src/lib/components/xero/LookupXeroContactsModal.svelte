<script>
    import { closeModal } from 'svelte-modals';
    import { PUBLIC_IP_HTTP_BACKEND } from '$env/static/public';
    import { getBaseRequestHeader } from '$lib/scripts/helpers.js';

    export let isOpen;
    export let searchReasonText;
    export let returnContact;

    let firstName;
    let lastName;
    let emailAddress;

    let error = "";
    let contacts = {};

    async function searchForMatchingUsers(formattedName, emailAddress) {
        const endpoint = `${PUBLIC_IP_HTTP_BACKEND}/xero/get_clients_by_criteria/${formattedName ?? " "}/${emailAddress ?? " "}/`
        let request = getBaseRequestHeader("GET");

        const response = await fetch(endpoint, request);
        const responseBody = await response.json()

        if(response.status != 200) {
            error = `Error: ${responseBody}`;
            return;
        }

        contacts = responseBody;
    }


    function confirmUser(index) {
        returnContact = 
        closeModal();
    }
</script>


{#if isOpen}
    <div role="dialog" class="modal">
        <div>
            {`Select a user${searchReasonText ? ` ${searchReasonText}` : ""}...`}
        </div>
        <ul>
        {#each contacts as contact}
            <li>
                <button on:click={confirmUser()}>
                    {contact["last_name"]}, {contact["first_name"]} --
                    {contact["phone_number"]} --
                    {contact["email"]}
                </button>
            </li>
        {/each}
        </ul>
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