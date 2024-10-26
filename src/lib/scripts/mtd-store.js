import {writable} from 'svelte/store';
export const PageNameStore = writable("");
export const ProjectBoardStore = writable([]);
export const CurrentMainTab = writable("");
export const ProjectWebsocket = writable();

export const WorkerWebsocket = writable();

export const UpdateProject = writable();