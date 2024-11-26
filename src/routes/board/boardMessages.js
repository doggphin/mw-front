export function sendMessage(socket, msg) {
    socket.send(JSON.stringify(msg));
} 


export function appendUpdate(updateQueue, id, col, val) {
    // If updateQueue already has an update with the same id and column, overwrite it

    for(let i=0; i<updateQueue.length; i++) {
        if(updateQueue[i]["id"] == id && updateQueue[i]["col"] == col) {
            update["val"] = val;
            return;
        }
    }

    updateQueue.push({
        "id" : projectId,
        "col" : col,
        "val" : val 
    })
}


export function handleReceivedUpdate(msg, typesToHandlers) {
    console.log("Received a message!");

    let msg_type = msg["type"];
    let body = msg["message"];

    const handler = Object.entries(typesToHandlers).find(([key, _]) => key == msg_type)?.[1];
    
    if(handler == null) {
        console.log(`Could not handle message of type ${msg_type}`);
        return false;
    } else {
        handler(body);
        return true;
    }
}