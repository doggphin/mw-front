import {writable} from 'svelte/store';
export const BACKENDIP = "http://localhost:8000"
export const PageNameStore = writable("");
export const ProjectBoardStore = writable([]);
export const CurrentMainTab = writable("");
export const ProjectWebsocket = writable();