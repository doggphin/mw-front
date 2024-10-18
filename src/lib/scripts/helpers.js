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