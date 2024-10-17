import { gameInfo } from "./constants.js";
import { GameInfoHandler } from './infoHandler.js';


let socket = null;

//ping pong mecanism
let pingInterval = null;
let pongTimeout = null;
let reconnectTimes = 0;
// let missedPings = 0;
const MAX_MISSED_PONGS = 3;
// ----------------------------

export function createWebSocket(onMessageCallback) {

    if (!socket || socket.readyState === WebSocket.CLOSED) {

        socket = new WebSocket('ws://' + window.location.host + '/ws/games/');

        // when the connection is established
        socket.onopen = function(event) {

            console.log("Client WebSocket connection established.");
            gameInfo.socketConnection = true;
            // send the initialization message
            onMessageCallback.sendInitConectionInfo();
            startHeartbeat();
        };

        // when the client receives a message from the server
        socket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                console.log("Message from server:", data);
                

                if (pongTimeout) clearTimeout(pongTimeout);

                pongTimeout = setTimeout(() => {

                    console.log("No message received in 4 seconds, closing WebSocket.");
                    GameInfoHandler.sendGameOver();
                    socket.close();
                }, 4000);
                //add ping pong mecanism
                // if (data.action === 'pong') {

                //     missedPings = 0;
                // } else {

                    onMessageCallback.infoHandler (data);
                //}
                // ----------------
            } catch (error) {

                console.error("Failed to parse WebSocket message:", error);
            }
        };

        // when the connection is closed
        socket.onclose = function(event) {

            console.log('Client WebSocket connection closed:', event);
            gameInfo.socketConnection = false;
            // add ping pong mecanism
            if (gameInfo.gameOver == false) {

                GameInfoHandler.notifyPauseGame();
                stopHeartbeat();
                attemptReconnection(onMessageCallback);
            } else {
                
                console.log("Game is over, not attempting reconnection.");
            }
            //----------------

            //socket = null;

            // set a retry mechanism
            //setTimeout(() => {
            //    createWebSocket(onMessageCallback);
            //}, 3000); // try to reconnect every 3 seconds
        };

        // handle WebSocket errors
        socket.onerror = function(error) {
            console.error("Client WebSocket error:", error);
        };
    } else {

        console.log("WebSocket connection already established or connecting.");
    }
}

function startHeartbeat() {

    //missedPings = 0;
    pingInterval = setInterval(() => {

        // if (missedPings >= MAX_MISSED_PONGS) {

        //     console.log("Closing WebSocket due to missed pongs.");
        //     GameInfoHandler.sendGameOver();
        //     socket.close();
        // } else {

            //GameInfoHandler.sendPing();
            if (pongTimeout) clearTimeout(pongTimeout);
            pongTimeout = setTimeout(() => {

                GameInfoHandler.sendGameOver();
                socket.close();
            }, 4000);

            //missedPings++;
        //}
   }, 5000); // send a ping every 5 seconds
}

function stopHeartbeat() {
    
    if (pingInterval) {

        clearInterval(pingInterval);
        pingInterval = null;
    }
}

function attemptReconnection(onMessageCallback) {

    if (reconnectTimes >= 3) {

        console.log("Failed to reconnect after 3 attempts.");
        alert("Failed to reconnect to the server. Please try again later.");
        window.location.href = "#vs_settings";
        window.location.reload();
    }

    setTimeout(() => {

        reconnectTimes++;
        console.log("Attempting to reconnect WebSocket...");
        createWebSocket(onMessageCallback);
    }, 3000);
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

