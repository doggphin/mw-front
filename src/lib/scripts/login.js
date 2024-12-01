import { PUBLIC_AUTH_TOKEN_EXPIRATION_LENGTH } from '$env/static/public';
import { getCookieValue } from "$lib/scripts/helpers.js";
import { writable } from 'svelte/store';
import { goto } from '$app/navigation';

export const UserId = writable();
export const UserEmail = writable();
export const AuthToken = writable();

export function createLoginRequest(email, password) {
    const request = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({
            "email" : email,
            "password" : password
        })
    };

    return request;
}


export function setLoginCookies(successfulResponseJson) {
    let userId = successfulResponseJson["user"]["id"];
    let userEmail = successfulResponseJson["user"]["email"];
    let authToken = successfulResponseJson["token"];

    console.log(`User ID is ${userId}`);

    let formattedAuthToken = `Token ${authToken}`

    document.cookie = `MemoryWare_AuthToken=${formattedAuthToken}; max-age=${PUBLIC_AUTH_TOKEN_EXPIRATION_LENGTH}; path=/`;
    document.cookie = `MemoryWare_UserEmail=${userEmail}; max-age=${PUBLIC_AUTH_TOKEN_EXPIRATION_LENGTH}; path=/`;
    document.cookie = `MemoryWare_UserId=${userId}; max-age=${PUBLIC_AUTH_TOKEN_EXPIRATION_LENGTH}; path=/`;

    tryLoadUserStoresWithCookies();

    return {
        "userId" : userId,
        "userEmail" : userEmail,
        "authToken" : authToken
    }
}


// Returns if was logged in.
export function gotoLoginIfNotLoggedIn() {
    if(!getIsLoggedIn) {
        goto("/login");
        return false;
    }

    return true;
}


export function getIsLoggedIn() {
    let isLoggedIn = getCookieValue("MemoryWare_AuthToken") != null;

    return isLoggedIn;
}


export function getToken(includePrefix) {
    let token = getCookieValue("MemoryWare_AuthToken")

    if(token == null) {
        return "";
    }

    return includePrefix ?
        token
        : token.split(' ')[1] ?? "";
}


export function logOut() {
    if(document == null) {
        return;
    }

    document.cookie = "MemoryWare_AuthToken=; max-age=0; path=/";
    document.cookie = "MemoryWare_UserEmail=; max-age=0; path=/";
    document.cookie = "MemoryWare_UserId=; max-age=0; path=/";
}


// Returns if it was successful.
export function tryLoadUserStoresWithCookies() {
    console.log("suh");
    if(document == null) {
        console.log("o");
        return false;
    }

    let authToken = getCookieValue("MemoryWare_AuthToken");
    let userEmail = getCookieValue("MemoryWare_UserEmail");
    let userId = getCookieValue("MemoryWare_UserId");

    if(authToken === null || userEmail === null || userId === null) {
        return false;
    }

    AuthToken.set(authToken);
    UserEmail.set(userEmail);
    UserId.set(userId);

    return true;
}
