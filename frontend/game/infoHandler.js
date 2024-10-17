import { closeWebSocket, sendInfoWS, sendData } from './socket.js';
import { meshPadEnamy, setPlayerId, meshBall, getPlayerId } from './pong.js';
import { setGameOver } from './constants.js';
import { startGame } from './main.js';


export function getPositionPadJSON(pad, userId) {

	const positionData = {

		action: 'updatePadPosition',
		userId: userId,
		x: pad.position.x,
		y: pad.position.y
	};

	return JSON.stringify(positionData);
}

export function getPositionBallJSON(ball, userId) {
	
	const positionData = {

		action: 'updateBallPosition',
		userId: userId,
		x: ball.position.x,
		y: ball.position.y
	};

	return JSON.stringify(positionData);
}

export function setPositionPad(newPositionInfo, pad) {

	const info = JSON.parse(newPositionInfo);

	if (info.x !== undefined && info.y !== undefined && info.z !== undefined && info.action === 'UpdatePad') {

        pad.position.set(info.x, 10, info.y);
    } else {
        console.error("Invalid position data.");
    }
}

export function setPositionBall(newPositionInfo, ball) {

	const info = JSON.parse(newPositionInfo);

	if (info.x !== undefined && info.y !== undefined && info.z !== undefined && info.action === 'UpdateBall') {

		ball.position.set(info.x, 10, info.y);
	} else {
		console.error("Invalid position data.");
	}
}


export class GameInfoHandler {

    constructor(HTMLplayerNameID, HTMLenamyNameID) {

        this.HTMLplayerNameID = HTMLplayerNameID;
        this.HTMLenamyNameID = HTMLenamyNameID;
    }

	static sendInitConectionInfo() {

		sendInfoWS(JSON.stringify({
			action: 'requestBattleInfo',
			userId: getPlayerId()
		}));
	}

	static sendGameOver () {

		setGameOver(true);
		sendInfoWS (JSON.stringify({
			action: 'gameOver',
			userId: getPlayerId()
		}));
	}

	static sendPlayerPadPosition () {

		sendInfoWS (getPositionPadJSON(meshPadPlayer, getPlayerId()));
	}

	static sendPositionBall() {
    
        sendInfoWS(getPositionBallJSON(meshBall, getPlayerId()));
	}

	// static sendPing() {

	// 	sendData('ping', { userId: getPlayerId()});
	// }
	
	static notifyPauseGame() {
	
		sendData('pause', { userId: getPlayerId() });
	}

    infoHandler = (newInfo) => {
        switch (newInfo.action) {
            case 'initInfo':
                if (this.HTMLenamyNameID && this.HTMLplayerNameID) {
                    const elementPlayerName = document.getElementById(this.HTMLplayerNameID);
                    const elementEnamyName = document.getElementById(this.HTMLenamyNameID);
                    elementEnamyName.innerHTML = newInfo.enamyName;
                    elementPlayerName.innerHTML = newInfo.playerName;
                    setPlayerId(newInfo.userId);
                }
                break;
            case 'UpdatePad':
                setPositionPad(newInfo, meshPadEnamy);
                break;
            case 'UpdateBall':
                setPositionBall(newInfo, meshBall);
                break;
            case 'gameOver':
                alert('Game Over');
				setGameOver(true);
                closeWebSocket();
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
        }
    }

}
