

let socket = null;

export function createWebSocket(onMessageCallback) {

    if (!socket || socket.readyState === WebSocket.CLOSED) {

        socket = new WebSocket('ws://' + window.location.host + './ws/pong/');

        // 连接成功时的回调函数
        // when the connection is established
        socket.onopen = function(event) {

            console.log("Client WebSocket connection established.");
            // 发送初始化信息
            // send the initialization message
            socket.send(JSON.stringify({
                action: 'requestBattleInfo',
            }));
        };

        // 当接收到服务器发送的消息时的回调函数
        // when the client receives a message from the server
        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            console.log("Message from server:", data);
            
            // 如果有传入的回调函数，则执行它
            if (onMessageCallback && typeof onMessageCallback === 'function') {

                onMessageCallback(data);
            }
        };

        // 连接关闭时的回调函数
        // when the connection is closed
        socket.onclose = function(event) {

            console.log('Client WebSocket connection closed:', event);
            socket = null;  // 将 socket 置为 null，以便重新连接
        };

        // 处理 WebSocket 错误
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

