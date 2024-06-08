<script>
    let isNumberKey = (evt) => {
        var charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }
    
    import { onMount } from 'svelte';
    import { PageNameStore, ProjectDetailStore, BACKENDIP } from '../../mtd-store.js';
    import { enforceNumericInput } from '$lib/scripts/helpers.js'
    import ListContainer from '$lib/components/ListContainer.svelte'
    import ListContainerLineBreak from '$lib/components/ListContainerLineBreak.svelte'

    export let data;
    let project = null;
    let error = 0;
    let tab = "prints";
    onMount(async function() {
        PageNameStore.set("")
        const endpoint = `${BACKENDIP}/projects/${data.id}`;
        const response = await fetch(endpoint);
        if(response.status == 200) {
            const data = await response.json();
            ProjectDetailStore.set(data);
            project = data;
            PageNameStore.set(data["client_name_last"] + ", " + data["client_name_first"])
        } else {
            PageNameStore.set("Error")
            error = 1;
        }
    })
</script>

<ListContainer minWidthRem=28>
    {#if project}
        {#if tab == "slides"}
            {#each $ProjectDetailStore["slides_job"]["groups"] as detail}
                <p> test </p>
            {/each}


        {:else if tab == "prints"}
            {#if $ProjectDetailStore["prints_job"]}
                <ol class="prints-group">
                    <li> # </li>
                    <li> DPI </li>
                    <li> Corr. </li>
                    <li> LP </li>
                    <li> HS </li>
                    <li> OSHS </li>
                    <li> Folder Name </li>
                </ol>
                <ListContainerLineBreak />
                {#each $ProjectDetailStore["prints_job"]["groups"] as printGroup}
                    <ol class="prints-group">
                        <li>{printGroup["index"]}</li>
                        <li>{printGroup["dpi"]}</li>
                        <li>{printGroup["is_to_be_corrected"] === true ? "Y": "N"}</li>
                        <input on:input={(text) => enforceNumericInput(text)} style="width:80%;" placeholder={printGroup["intake_lp_count"]}>
                        <input on:input={(text) => enforceNumericInput(text)} style="width:80%;" placeholder={printGroup["intake_hs_count"]}>
                        <input on:input={(text) => enforceNumericInput(text)} style="width:80%;" placeholder={printGroup["intake_oshs_count"]}>
                        <li>{printGroup["name_folder"]}</li>
                    </ol>
                {/each}
            {:else}
                <p class="temp-message">No groups found for prints!</p>
            {/if}


        {:else if tab == "negatives_job"}
            {#each $ProjectDetailStore["negatives_job"]["groups"] as detail}
                <p> test </p>
            {/each}
        {/if}

        
    {:else}
        {#if error}
            <p class="temp-message"> 404 Error: No project found with ID {data.id}!</p>
        {:else}
            <p class="temp-message"> Loading... </p>
        {/if}
    {/if}
</ListContainer>

<style>
    .prints-group {
        display: grid;
        grid-template-columns: max(3em,5%) max(3em,5%) max(3em,5%) max(3em,5%) max(3em,5%) max(3em,5%) max(10em,70%);
        padding: 10px 0px 10px 10px;
    }
    .temp-message {
        width: 100%;
        text-align: center;
        padding: 20px 0px;
    }
</style>