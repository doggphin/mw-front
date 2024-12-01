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