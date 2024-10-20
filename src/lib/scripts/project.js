//import { project } from "../../routes/board/[id]/+page.svelte";     // HIGHLY ILLEGAL

export function updateDom() {
    //project = project;
}

export function addEditingTag(group, id, time, editing_type, tempId, receivedSessionToken, sessionToken) {
    // If receiving an update for an add that this client sent, update the temp tag to the actual tag
    console.log(`my token is ${sessionToken}. received session token is ${receivedSessionToken}.`)
    if (receivedSessionToken == sessionToken) {
        console.log(`updating a temp id from ${tempId}...`);
        let editing_tag = group['editing_tags'].find(tag => tag["id"] == tempId);
        editing_tag['id'] = id;
        console.log(`to ${id}!`);
    }
    // Otherwise, add this as a new tag.
    else {
        group['editing_tags'].push({
            'id' : id,
            'time' : time,
            'editing_type' : editing_type
        });
    }
}
export function addTempEditingTag(group, randomId) {
    addEditingTag(group, randomId, 0, 'NA', 0, 0, -1);
}

export function removeEditingTag(group, id) {
    for (let i = group['editing_tags'].length - 1; i >= 0; --i) {
        if (group['editing_tags'][i].id == id) {
            myArray.splice(i,1);
        }
    }
    //updateDom();
}

export function modifyEditingTag(group, id, editing_time, editing_type) {
    let editing_tag = group['editing_tags'].find(tag => tag["id"] == id);
    if (editing_time !== null) {
        editing_tag['time'] = editing_time;
    }
    if (editing_type !== null) {
        editing_tag['editing_type'] = editing_type;
    }
    //updateDom();
}

export function handleUpdateEditingTag(group, val, receivedToken, sessionToken) {
    switch(val['update_type']) {
        case 'add':
            addEditingTag(group, val['id'], val['time'], val['editing_type'], val['sender_temp_id'], receivedToken, sessionToken);
            break;
        case 'remove':
            removeEditingTag(group, val['id'])
            break;
        case 'modify':
            modifyEditingTag(group,
                id,
                val.hasOwnProperty('time') ? val['time'] : null,
                val.hasOwnProperty('editing_type') ? val['editing_type'] : null
            );
    }
}