import { sendData } from './socket.js';
import { getPlayerId, getBallDirectionX, getBallDirectionY, getPadPlayerPositionY, resetPositionPadEnamy, resetPositionBall, resetPositionPadPlayer } from './pong.js';
import { gameInfo, PAD_LENGTH, TABLE_HEIGHT } from './constants.js';
import { startGame, showOverlay, hideOverlay } from './main.js';
import { padEdgeCorrect } from './edgeJudge.js';
import { getRankingListByResults, getSimpleRoomList, getRoomIdByHost } from './utiles.js';
import { renderRoomList } from '../components/online.js';

export class GameInfoHandler {

    constructor(HTMLplayerNameID, HTMLenamyNameID) {

        this.HTMLplayerNameID = HTMLplayerNameID;
        this.HTMLenamyNameID = HTMLenamyNameID;
    }

	static sendMovePad(stepChanged) {

		sendData('client_move_pad', { 
			
			game_id: gameInfo.game_id,
			user_name: gameInfo.user_name,
			pad_y: stepChanged,
		 });
	}

	static sendPing() {

		sendData('ping', { myName: gameInfo.user_name });
	}

	// for create button
	static sendCreateRoom() {

		sendData('client_create_room', {});
	}

	// for join button
	static sendJoinRoom(hostName) {
		
		if (gameInfo.room_list.length === 0) {
			console.error('No room available.');
			return;
		}
		roomId = getRoomIdByHost(gameInfo.room_list, hostName);
		if (roomId === '') {
			console.error('Room not found.');
			return;
		}
		sendData('client_join_room', { room_id: roomId });
	}

	// for leave button
	static sendLeaveRoom() {
		
		sendData('client_leave_room', {});
	}

	// for start button
	static sendStartGame() {
		
		sendData('client_start_room', {});
	}

	// no need to use theriticaly, just in case
	static sendInfoRoom() {
		
		sendData('client_info_room', {});
	}

	// no need to use theriticaly, just in case
	static sendGetRoomList() {
		
		sendData('client_get_rooms', {});
	}

	// for handle the info from server
    static infoHandler(newInfo) {
		//console.log('Unknown info:', newInfo);
        switch (newInfo.action) {

			// no need to modify, this is just used for the connection confirmation
			case 'server_confirm_connection':
				if (newInfo.user_id === gameInfo.user_id && newInfo.user_name === gameInfo.user_name) {

					sendData('client_init_info', { 		
						confirmed: true,
					});
					// console.log("Connection confirmed by server.\nMessage send successfully.");
				} else {

					sendData('client_init_info', {
						confirmed: false,
					});
					gameInfo.game_socket.close();
					// console.error("Invalid user data from server.");
				}
				break;
			// every time when the game is about to start, the server will send the game info to the client
			case 'server_game_matched':
				// if is reconnection , it has to jump to the page of the game
				// //////////////////////////////////////
				// write the logic here
				// window.location.hash = 'game_online';
				// //////////////////////////////////////
				gameInfo.gameOver = false;
				gameInfo.opp_name = newInfo.opp_name;
				gameInfo.opp_id = newInfo.opp_id;
				gameInfo.game_id = newInfo.game_id;
				document.getElementById('enamyName').innerHTML = newInfo.opp_name;
				document.getElementById('playerName').innerHTML = gameInfo.user_name;
				gameInfo.playerName = gameInfo.user_name;
				gameInfo.enamyName = gameInfo.opp_name;
				gameInfo.status = 'on';
				// console.log("Game matched by server.");
				hideOverlay();
				startGame();
				break;
			// when the room is created, the server will send the room id to the client
			case 'server_room_created':
				if ('room_id' in newInfo) {
					gameInfo.room_id = newInfo.room_id;
					console.log("Room created by server.");
				} else {
					console.error("Room creation failed.");
				}
				break;
			// mybe we can add a alert to show the reason of the denied
			case 'server_room_created_denied':
				if ('error' in newInfo) {
					console.error("Room creation denied by server. Reason: " + newInfo.error);
				}
				break;
			// when the room is joined, the server will send the room id to the client
			case 'server_room_joined':
				if ('room_id' in newInfo) {
					gameInfo.room_id = newInfo.room_id;
					console.log("Room joined by server.");
				}
				break;
			// mybe we can add a alert to show the reason of the denied
			case 'server_room_joined_denied':
				if ('error' in newInfo) {
					console.error("Room join denied by server. Reason: " + newInfo.error);
				}
				break;
			// no need to modify, unless we want to alert the user
			case 'server_room_left_success':
				gameInfo.room_id = '';
				console.log("Room left successfully.");
				break;
			// mybe we can add a alert to show the reason of the denied
			case 'server_room_left_error':
				if ('error' in newInfo) {
					console.error("Room leave failed. Reason: " + newInfo.error);
				}
				break;
			// a response from the server for the request of the room info by client, tecnically we will not use this, will , just in case
			case 'server_info_room':
				if ('room_info' in newInfo) {
					console.log("Room info received from server.");
					console.log(newInfo.room_info);
					// aqui se puede abordar la logica del room
				}
				break;
			// will not use this, just in case
			case 'server_info_room_error':
				if ('error' in newInfo) {
					console.error("Room info failed. Reason: " + newInfo.error);
				}
				break;
			// a response from the server for the request of the room list by client, tecnically we will not use this 
			case 'server_all_rooms':
				if ('room_list' in newInfo) {
					console.log("All rooms received from server.");
					console.log(newInfo.room_list);
					// aqui se puede abordar la logica de la lista de rooms
				}
				break;
			// when the room game is started, all the players in the room will receive this message
			case 'server_game_started_waiting':
				console.log("Game started waiting for another player to join.");
				showOverlay('Waiting for player to join');
				break;
			// when you are not the host but you want to start the game, the server will deny the request
			case 'server_game_start_denied':
				if ('error' in newInfo) {
					console.error("Game start denied by server. Reason: " + newInfo.error);
				}
				break;
			// every time when the room list is updated, the server will send the room list to the client
			case 'server_room_list_update':
				if ('room_list' in newInfo) {
					
					gameInfo.room_list = newInfo.room_list;
					// const simpleList = getSimpleRoomList(newInfo.room_list);
					if (gameInfo.status === 'off' && window.location.hash === '#online') {
						renderRoomList();
					}
					// use above function to get the simple room list
					// if (gameInfo.status === 'off') {
					//	here write the logic of showing the room list using the simpleList
					//  you can write a func to show the room list like "updateRoomListUI(simpleList)"
					// }
					// the format of simpleList will be like this
					// [
					// 	["test2", 1, "open", room_id],
					// 	["test1", 1, "open", room_id]
					// ]
					// the first element is the host name, the second element is the number of players, the third element is the room state
					// so you can refresh the room list by using the above function
					console.log("Room list updated by server.");
					console.log(newInfo.room_list);
					// aqui se puede abordar la logica de la lista de rooms
				}
				break;
			// no need to modify this. this part is the game logic
			case 'server_update_position':
				console.log('server update position');
				console.log(newInfo);
				// resetPositionBall(newInfo.ball_x, newInfo.ball_y);
				// resetPositionPadEnamy(padEdgeCorrect(newInfo.pad_y, PAD_LENGTH, TABLE_HEIGHT));

				resetPositionBall(newInfo.ball_x, newInfo.ball_y);
				resetPositionPadEnamy(padEdgeCorrect(-newInfo['pad_' + gameInfo.opp_name], PAD_LENGTH, TABLE_HEIGHT));
				resetPositionPadPlayer(padEdgeCorrect(newInfo['pad_' + gameInfo.playerName], PAD_LENGTH, TABLE_HEIGHT));


				console.log('pad_play:', newInfo['pad_' + gameInfo.playerName]);
				console.log('pad_oppo:', -newInfo['pad_' + gameInfo.opp_name]);
				document.getElementById(gameInfo.DOMPlayerScoreID).innerHTML = newInfo['score_' + gameInfo.playerName];
				document.getElementById(gameInfo.DOMEnamyScoreID).innerHTML = newInfo['score_' + gameInfo.opp_name];
				

				console.log('reset position');
				break;
			// when your game is over but there is also another player in the room, the server will send this message
			case 'server_game_waiting_result':
				console.log("Waiting for the game result.");
				showOverlay('Waiting for the game result');
				break;
				
			// when all the games in the room are over, the server will send the result to the client
			case 'server_game_over':
				
				if ('result' in newInfo) {
					gameInfo.result = getRankingListByResults(newInfo.result);
					//////////////////////////////////////
					// the format will be like this
					// [
					// 	["test1", 2],
					// 	["test2", 0],
					// 	["test3", 0]
					// ]
					// here write the logic of the ranking
					// you can write a func to show the ranking like "showRankingUI(gameInfo.result)"
					// after showing the result, the result should be cleared
					// gameInfo.result = [];
					//////////////////////////////////////
					console.log("Game over by server.");
					console.log(gameInfo.result);
				}
				alert('Game Over'); // this is not that necessary, can be removed
				gameInfo.gameOver = true;
				gameInfo.opp_id = '';
				gameInfo.opp_name = '';
				gameInfo.winner = '';
				gameInfo.game_id = '';
				gameInfo.status = 'off';
				startGame();
				window.location.hash = 'home';
				break;

            default:
				
                console.log('Unknown info:', newInfo);
				break;
        }
    }

}
