<script>
    import { getContext } from 'svelte';
    let sendUpdate = getContext('sendGroupUpdate');
    export let idx, intakeAttr, finalAttr, updateName;
    let value = finalAttr ?? intakeAttr ? "" : 0;
    function enforceNumericInput(shouldBeBlank) {
        if(!value && shouldBeBlank) {
            value = "0"
            return;
        }
        for(let i=value.length - 1; i >= 0; i--) {
            if(!(/^\d+$/.test(value.charAt(i)))) {
                value = value.slice(0, i);
            }
        }
        if(shouldBeBlank) {
            if(value === "") {
                value = "0";
            }
        } else {
            if(value === 0) {
                value == ""
            }
        }   
    }
</script>
    

<input class="count" style="{(!value || value == 0) && !intakeAttr ? "background-color: background-color: var(--clr-primary-5-2);" : "background-color: var(--clr-primary-5);"}"
    placeholder={intakeAttr ?? 0}
    bind:value={value}
    on:change={(val) => sendUpdate(idx, updateName, val.target.value ? val.target.value : 0)} 
    on:input={enforceNumericInput(!intakeAttr)} 
> 


<style>
    .count {
        flex: 4 0 4rem;
        min-width: 0;
        padding: 2.5px;
    }
</style>