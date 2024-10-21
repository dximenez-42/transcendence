import { closeWebSocket, sendInfoWS, sendData } from './socket.js';
import { meshPadEnamy, setPlayerId, meshBall, getPlayerId } from './pong.js';
import { gameInfo } from './constants.js';
import { startGame, showOverlay, hideOverlay } from './main.js';

export class GameInfoHandler {

    constructor(HTMLplayerNameID, HTMLenamyNameID) {

        this.HTMLplayerNameID = HTMLplayerNameID;
        this.HTMLenamyNameID = HTMLenamyNameID;
    }

	static sendMatchRequest(isTournament) {

		sendData('client_match_request', { 
			
			is_tournament: isTournament,
		 });
	}

	static sendGameOver () {

		gameInfo.gameOver = true;
		sendData('client_game_over', { 
			
			to_user_id: gameInfo.opp_id,
			playerName: gameInfo.playerName,
			enamyName: gameInfo.enamyName,
			winner: gameInfo.winner,
			is_tournament: false,
		});
	}

	static sendPositionSyn() {
    
		console.log('send position');
		sendData ('client_update_position', { 
			
			to_user_id: gameInfo.opp_id,
			ball_x: meshBall.position.x,
			ball_y: meshBall.position.y,
			pad_x: meshPadPlayer.position.x,
			pad_y: meshPadPlayer.position.y,
		});
		// sendInfoWS (getPositionPadJSON(meshPadPlayer, getPlayerId()));
        // sendInfoWS(getPositionBallJSON(meshBall, getPlayerId()));
	}

	static sendPing() {

		sendData('ping', { myName: sessionStorage.getItem('username') });
		// console.log("Ping sent to server.");
	}
	
	static notifyPauseGame() {
	
		sendData('pause', { userId: getPlayerId() });
	}

    static infoHandler(newInfo) {
        switch (newInfo.action) {

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
			case 'server_game_matched':
				gameInfo.opp_name = newInfo.opp_name;
				gameInfo.opp_id = newInfo.opp_id;
				document.getElementById('enamyName').innerHTML = newInfo.opp_name;
				document.getElementById('playerName').innerHTML = gameInfo.user_name;
				gameInfo.playerName = gameInfo.user_name;
				gameInfo.enamyName = gameInfo.opp_name;
				gameInfo.status = 'on';
				// console.log("Game matched by server.");
				hideOverlay();
				startGame();
				break;
			case 'server_game_waiting':

				console.log("Waiting for another player to join the game.");
				showOverlay();
				break;
            // case 'initInfo':
            //     if (this.HTMLenamyNameID && this.HTMLplayerNameID) {
            //         const elementPlayerName = document.getElementById(this.HTMLplayerNameID);
            //         const elementEnamyName = document.getElementById(this.HTMLenamyNameID);
            //         elementEnamyName.innerHTML = newInfo.enamyName;
            //         elementPlayerName.innerHTML = newInfo.playerName;
            //         setPlayerId(newInfo.userId);
            //     }
            //     break;
			case 'server_update_position':
				meshBall.position.set(newInfo.ball_x, 10, newInfo.ball_y);
				meshPadEnamy.position.set(newInfo.pad_x, 10, newInfo.pad_y);
				break;
			case 'server_game_over':
				if (newInfo.is_tournament === false) {

					gameInfo.gameOver = true;
					gameInfo.opp_id = '';
					gameInfo.opp_name = '';
					gameInfo.winner = '';
					gameInfo.status = 'off';
				}
				break;

			case 'pause':
				console.log("Game paused by server.");
				startGame();
				break;
			case 'resume':
				console.log("Game resumed by server.");
				startGame();
				break;
            default:
                console.error('Invalid info type from server.');
				break;
        }
    }

}
