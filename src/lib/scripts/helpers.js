import { ProjectWebsocket } from '$lib/scripts/mtd-store.js';
import { get } from 'svelte/store';


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
    let hms = secondsToHoursMinutesSeconds(seconds);
    hms.forEach((el) => {
        el = el.toString().padStart(2, '0');
    });
    
    if(hms[0] != 0) {
        return `${hms[0]}h ${hms[1]}m ${hms[2]}s`;
    } else if (hms[1] != 0) {
        return `${hms[1]}m ${hms[2]}s`;
    } else {
        return `${hms[2]}s`;
    }
}


// https://stackoverflow.com/questions/9907419/how-to-get-a-key-in-a-javascript-object-by-its-value
export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


export function conformStringToNumber(value, max = 32767) {
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


export function characterComesBefore(a, b) {
    return a.charCodeAt(0) < b.charCodeAt(0);
}


export function secondsToHoursMinutesSeconds(totalTime) {
    let seconds = totalTime % 60;
    let minutes = Math.floor((totalTime - seconds) / 60) % 60;
    let hours   = Math.floor((totalTime - minutes * 60 - seconds) / 3600);

    return [hours, minutes, seconds];
}


export function hoursMinutesSecondsToSeconds(hours, minutes, seconds) {
    return hours * 3600 + minutes * 60 + seconds;   
}


export function formattedTimeToHoursMinutesSeconds(str) {
    let currentBuf = "";

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    let state = 0;
    for (const c of str) {
        if(c == 'h') {
            if(state <= 0) {
                state = 1;
                hours = currentBuf;
                currentBuf = "";
            } else {
                alert(`Invalid input ${str}: Invalid hours (h) placement.`);
                return null;
            }

        } else if (c == 'm' && state <= 1) {
            if(state <= 1) {
                state = 2;
                minutes = currentBuf;
                currentBuf = "";
            } else {
                alert(`Invalid input ${str}: Invalid minutes (m) placement.`);
                return null;
            }
            
        } else if (c == 's') {
            if(state <= 2) {
                seconds = currentBuf;
                currentBuf = "";
                break;
            } else {
                alert(`Invalid input ${str}: Invalid seconds (s) placement.`);
                return null;
            }
            
        } else {
            currentBuf += c;
        }
    }

    if (currentBuf != '') {
        alert(`Invalid input ${str}: Invalid hours (h) placement.`);
    }

    if(!Number.isNaN(hours) && !Number.isNaN(minutes) && !Number.isNaN(seconds)) {
        return [Number(hours), Number(minutes), Number(seconds)];
    } else {
        alert(`Non number included in the time value ${str}!`);
    }
}


// Function to get a specific cookie value by name
export function getCookieValue(name) {
    if(document == null) {
        return null;
    }

    const cookies = document.cookie.split('; ');
    
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) {
            return value;
        }
    }

    return null; // Return null if the cookie is not found
}


export function getBaseRequestHeader(method_type) {
    return {
        method : method_type,
        headers : {
            "Content-Type" : "application/json",
            "Authorization" : getCookieValue("MemoryWare_AuthToken")
        }
    }
}


export function closeWebsocketConnection() {

}


export function startWebsocketConnection(endpoint) {
    let websocket = get(ProjectWebsocket);
    if(websocket != null) {
        websocket.close();
    }

    ProjectWebsocket.set(new WebSocket(endpoint));
}