

let socket = null;

export function createWebSocket(onMessageCallback) {

    if (!socket || socket.readyState === WebSocket.CLOSED) {

        socket = new WebSocket('ws://' + window.location.host + './ws/games/');

        // when the connection is established
        socket.onopen = function(event) {

            console.log("Client WebSocket connection established.");

            // send the initialization message
            onMessageCallback.sendInitConectionInfo();
        };

        // when the client receives a message from the server
        socket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                console.log("Message from server:", data);
                
                onMessageCallback.infoHandler (data);
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };

        // when the connection is closed
        socket.onclose = function(event) {
            console.log('Client WebSocket connection closed:', event);
            socket = null;

            // set a retry mechanism
            setTimeout(() => {
                createWebSocket(onMessageCallback);
            }, 3000); // try to reconnect every 3 seconds
        };

        // handle WebSocket errors
        socket.onerror = function(error) {
            console.error("Client WebSocket error:", error);
        };
    } else {

        console.log("WebSocket connection already established or connecting.");
    }
}

export function sendInfoWS(wsInfo) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(wsInfo);
    } else {
        console.error("Client WebSocket is not open.");
    }
}

export function closeWebSocket() {
    if (socket) {
        socket.close();
    }
}

export function sendData(action, data) {
    const message = { action, ...data };
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error("WebSocket is not open.");
    }
}

