<script>
    import { PageNameStore } from '$lib/scripts/mtd-store.js';
    import { PUBLIC_IP_HTTP_BACKEND, PUBLIC_AUTH_TOKEN_EXPIRATION_LENGTH } from '$env/static/public';
    import { onMount } from 'svelte';
    import { goto, afterNavigate } from '$app/navigation';
    import { base } from '$app/paths'

    import { getCookieValue } from "$lib/scripts/helpers.js";

    onMount(async() => {
        $PageNameStore = "Login";
    });

    let email = "";
    let password = "";

    let error = "";
    let success = "";

    let previousPage = base;

    afterNavigate(({from}) => {
        console.log(`You came from ${from?.url.pathname}`);
        previousPage = from?.url.pathname || previousPage;
    });

    async function attemptLogin() {
        const endpoint = `${PUBLIC_IP_HTTP_BACKEND}/api/login/`;

        if(email === "") {
            error = "Please type in an email!";
            return;
        }
        if(password === "") {
            error = "Please type in a password!";
            return;
        }
        
        error = "";
        success = "";

        const request = {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                "email" : email,
                "password" : password
            })
        }

        const response = await fetch(endpoint, request);
        
        let json = await response.json();
        
        console.log(response.status);
        if(response.status != 200) {
            if("non_field_errors" in json && json["non_field_errors"] == "Invalid Details.") {
                error = "Invalid username or password! Please try again.";
            } else {
                error = `Could not log in: Error ${response.status}: ${JSON.stringify(json)}`;
            }

            return;
        }

        let userId = json["user"]["id"];
        let userEmail = json["user"]["email"];
        let authToken = json["token"];

        let formattedAuthToken = `Token ${authToken}`

        document.cookie = `MemoryWare_AuthToken=${formattedAuthToken}; max-age=${PUBLIC_AUTH_TOKEN_EXPIRATION_LENGTH}; path=/`;
        document.cookie = `MemoryWare_UserEmail=${userEmail}; max-age=${PUBLIC_AUTH_TOKEN_EXPIRATION_LENGTH}; path=/`;
        document.cookie = `MemoryWare_UserId=${userId}; max-age=${PUBLIC_AUTH_TOKEN_EXPIRATION_LENGTH}; path=/`;

        success = `Logged in as ${userEmail}!`
 
        console.log(`You're boutta go to ${previousPage}`);

        setTimeout(function() { goto(previousPage) }, 1000);
    }
</script>



<div class="container">
    {#if success && !error}
        <div class="success">
            { success }
        </div>
    {/if}
    {#if error}
        <div class="error">
            { error }
        </div>
    {/if}

    <div class="inputs">
        <h3>Email:</h3>
        
        <input type="email" bind:value={email}/>

        <h3>Password:</h3>
        <input type="password" bind:value={password}/>
    </div>

    <div class="buttons">
        <button on:click={ attemptLogin }>
            <h3>Log In</h3>
        </button>
        <button on:click={() => { alert("Tough luck!") }}>
            <h3>Forgot Password</h3>
        </button>
    </div>
</div>



<style>
    .success {
        color: var(--clr-primary-good-1);
        text-align: center;
        padding: 10px;
        margin-bottom: 10px;
    }
    .error {
        color: var(--clr-primary-bad-1);
        text-align: center;
        padding: 10px;
        margin-bottom: 10px;
    }
    .container {
        background-color: white;
        border-radius: 5px;
        padding: 15px;
        max-width:fit-content;
        margin: 50px auto;
    }
    input {
        width: 400px;
        padding: 5px;
    }
    .inputs {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    input {
        background-color: var(--clr-primary-5);
        margin-bottom: 15px;
        border-radius: 5px;
    }
    .buttons {
        width: 100%;
        display: inline-flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    button {
        width: 150px;
        margin: 15px 15px 0px 15px;
        padding: 5px;
    }
</style>