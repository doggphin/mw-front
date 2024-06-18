<script>
    import { getContext } from 'svelte';
    import { widthConsts } from '../widthConsts.js';
    let sendUpdate = getContext('sendGroupUpdate');

    export let idx, intake, final, name;
    export let width = widthConsts.number;

    let value = final ?? intakeAttr ? "" : 0;
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
    

<input 
    style="flex: {width} 0 {width}em;
        {(!value || value == 0) && !intake ? 
            "background-color: background-color: var(--clr-primary-5-2);" : 
            "background-color: var(--clr-primary-5);"}"
    placeholder={intake ?? 0}
    bind:value={value}
    on:change={(val) => sendUpdate(idx, name, val.target.value ? val.target.value : 0)} 
    on:input={enforceNumericInput(!intake)} 
> 


<style>
    input {
        min-width: 0;
        padding: 2.5px;
        margin: 0px -2.5px;  /* Makes up for padding */
        border-radius: 5px;
    }
</style>