import {writable} from 'svelte/store';
export const BACKENDIP = "http://54.203.85.182:5173"
export const PageNameStore = writable("");
export const ProjectBoardStore = writable([]);
export const ProjectDetailStore = writable();
export const CurrentMainTab = writable();