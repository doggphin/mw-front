export let backendIp = 'localhost:8000';

export function boolToChar(boolean) {
    return boolean === true ? "Y" : "N";
}

export function charToBool(char) {
    return char == "Y";
}

export function getRandom(a, b) {
    return a+(b-a+1)*crypto.getRandomValues(new Uint32Array(1))[0]/2**32|0
}

export function secondsToFormattedTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`
}

// https://stackoverflow.com/questions/9907419/how-to-get-a-key-in-a-javascript-object-by-its-value
export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

export function conformStringToNumber(value, max = 32767) {
    console.log(value);
    let ret = value; 

    ret.replace(/[^0-9]/g, '');
    while(ret.length > 0 && ret.charAt(0) === '0') {
        ret = ret.substring(1);
    }
    ret = ret == '' ? 0 : Math.min(max, parseInt(ret));
    if(Number.isNaN(ret)) {
        ret = 0;
    }

    return ret;
}