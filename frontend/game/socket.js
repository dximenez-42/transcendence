import { gameInfo } from "./constants.js";
import { GameInfoHandler } from './infoHandler.js';


//ping pong mecanism-----------
let pingInterval = null;
let pongTimeout = null;
//let reconnectTimes = 0;
let missedPings = 0;
let isReconnecting = false;
const MAX_MISSED_PONGS = 3;
// ----------------------------

export async function createWebSocket() {

    if (!gameInfo.game_socket || gameInfo.game_socket.readyState === WebSocket.CLOSED) {

        gameInfo.game_socket = new WebSocket('ws://' + window.location.host + '/ws/games/' + gameInfo.user_name + '/' + gameInfo.user_id);

        // when the connection is established
        gameInfo.game_socket.onopen = function(event) {

            console.log("Client WebSocket connection established.");
            gameInfo.socketConnection = true;
            //reconnectTimes = 0;
            startHeartbeat();
        };

        // when the client receives a message from the server
        gameInfo.game_socket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                // console.log("Message from server:", data);
                
                ///////////////////////////////////////////
                // add ping pong mecanism
                if (data['action'] === 'pong') {
                    // console.log("Pong received from server.");
                    missedPings = 0;
                    // if (pongTimeout) clearTimeout(pongTimeout);
                    // pongTimeout = setTimeout(() => {
                    //     console.log("No 'pong' message received in 7 seconds, closing WebSocket.");
                    //     //GameInfoHandler.sendGameOver();
                    //     gameInfo.game_socket.close();
                    // }, 7000);
                } else {
                ///////////////////////////////////////////
                    GameInfoHandler.infoHandler (data);
                }
                // ----------------
            } catch (error) {

                console.error("Failed to parse WebSocket message:", error);
            }
        };

        // when the connection is closed
        gameInfo.game_socket.onclose = function(event) {

            //////////////////////////////////////////////////////////////////////
            // 判断游戏状态, 当游戏正在进行的情况下, 应该暂停游戏, 并且将游戏状态变更为暂停 //
            //////////////////////////////////////////////////////////////////////

            console.log('Client WebSocket connection closed:', event);
            gameInfo.socketConnection = false;
            // add ping pong mecanism
            // if (gameInfo.gameOver == false) {

            //     GameInfoHandler.notifyPauseGame();
            //     stopHeartbeat();
            //     attemptReconnection();
            // } else {
                
            //     console.log("Game is over, not attempting reconnection.");
            // }
            //----------------



            // if (gameInfo.status === 'on')
            //     GameInfoHandler.notifyPauseGame();
            stopHeartbeat();
            attemptReconnection();

            //socket = null;

            // set a retry mechanism
            //setTimeout(() => {
            //    createWebSocket(onMessageCallback);
            //}, 3000); // try to reconnect every 3 seconds
        };

        // handle WebSocket errors
        gameInfo.game_socket.onerror = function(error) {
            console.error("Client WebSocket error:", error);
        };
    } else {

        console.log("WebSocket connection already established or connecting.");
    }
}

function startHeartbeat() {

    missedPings = 0;
    pingInterval = setInterval(() => {

        if (missedPings >= MAX_MISSED_PONGS) {

            console.log("Closing WebSocket due to missed pongs.");
            //GameInfoHandler.sendGameOver();
            gameInfo.game_socket.close();
            stopHeartbeat();
        } else {

            GameInfoHandler.sendPing();
            //console.log("Ping sent to server.");
            missedPings++;
        }
        
    }, 5000); // send a ping every 5 seconds

}

function stopHeartbeat() {
    
    if (pingInterval) {

        clearInterval(pingInterval);
        pingInterval = null;
    }

    if (pongTimeout) {

        clearTimeout(pongTimeout);
        pongTimeout = null;
    }
}

async function attemptReconnection() {

    // if (reconnectTimes >= 3) {

    //     console.log("Failed to reconnect after 3 attempts.");
    //     alert("Failed to reconnect to the server. Please try again later.");
    //     window.location.href = "#vs_settings";
    //     window.location.reload();
    // }
    if (isReconnecting) return;
    isReconnecting = true;

    setTimeout(() => {

        //reconnectTimes ++;
        console.log("Attempting to reconnect WebSocket...");
        createWebSocket();
        isReconnecting = false;
    }, 3000);
}

export function sendInfoWS(wsInfo) {

    if (gameInfo.game_socket && gameInfo.game_socket.readyState === WebSocket.OPEN) {
        gameInfo.game_socket.send(wsInfo);
    } else {
        console.error("Client WebSocket is not open.");
    }
}

export function closeWebSocket() {

    if (gameInfo.game_socket) {

        gameInfo.game_socket.close();
    }
}

export async function sendData(action, data) {

    const message = { action, ...data };
    if (gameInfo.game_socket && gameInfo.game_socket.readyState === WebSocket.OPEN) {
        try {
            gameInfo.game_socket.send(JSON.stringify(message));
        } catch (error) {
            console.error("Failed to send message to WebSocket:", error);
        }
    } else {
        console.error("WebSocket is not open.");
        console.log('gameInfo:', gameInfo);
        
        // alert("Connection to the server is lost. Please try again later.");
        // window.location.reload(); // refresh the page wen the connection is lost
        // 这里的情况要处理 当无法发送信息的时候 游戏应该暂停.
    }
}

