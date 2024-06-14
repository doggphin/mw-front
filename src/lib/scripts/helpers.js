export function enforceNumericInput(input) {
    function isNumeric(value) {
        return /^\d+$/.test(value);
    }
    if(input.target.value) {
        for(let i=input.target.value.length - 1; i >= 0; i--) {
            if(!isNumeric(input.target.value.charAt(i))) {
                input.target.value = input.target.value.slice(0, i);
            }
        }
    }
}

export function boolToString(boolean) {
    return boolean ? "Y" : "N";
}