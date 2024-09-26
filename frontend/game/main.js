import { keyMovePad, setGameType, getGameType, meshPadEnamy, setPlayerId, meshBall, uploadPositionBall, setDomPlayerScore, setDomEnamyScore, setDomCanvas} from './pong.js';
import { FPS } from './constants.js';
import { createWebSocket } from './socket.js';
import { setPositionPad, setPositionBall } from './infoHandler.js';


export let startGame = createGameController();


export function renderGame(){
	const buttonStart = document.getElementById('pause');
	const buttonLocalGame = document.getElementById('localGameButton');
	const buttonOnlineGame = document.getElementById('onlineGameButton');

	if (buttonStart) {
		buttonStart.addEventListener('click', function () {

			if (getGameType() == '') {

				alert('Please select a game type first.');
				return;
			} else {

					console.log('gameType:', getGameType());
					startGame();
			}
		});
	}else {
		
		console.log('buttonStart not found');
	}


	if (buttonLocalGame) {

		buttonLocalGame.addEventListener('click', () => setGame('local', 'gameWindow', 'playerName', 'enamyName', 'playerScore', 'enamyScore'));
	}

	if (buttonOnlineGame) {

		buttonOnlineGame.addEventListener('click', () => setGame('online', 'gameWindow', 'playerName', 'enamyName', 'playerScore', 'enamyScore'));
	}
}

function infoHandler(newInfo, HTMLplayerNameID, HTMLenamyNameID) {

	if (newInfo.action === 'initInfo' && HTMLenamyNameID && HTMLplayerNameID) {

		const elementPlayerName = document.getElementById(HTMLplayerNameID);
		const elementEnamyName = document.getElementById(HTMLenamyNameID);
		elementEnamyName.innerHTML = newInfo.enamyName;
		elementPlayerName.innerHTML = newInfo.playerName;
		setPlayerId(newInfo.userId);

	} else if (newInfo.action === 'updatePad'){

		setPositionPad(newInfo.newPosition, meshPadEnamy);
	} else if (newInfo.action === 'updateBall'){

		setPositionBall(newInfo.newPosition, meshBall);
	} else {

		console.error('Invalid info type from server.');
	}
}

export function setGame(gameType, HTMLcanvasID, HTMLplayerNameID, HTMLenamyNameID, HTMLplayerScoreID, HTMLenamyScoreID) {

	setDomEnamyScore(HTMLenamyScoreID);
	setDomPlayerScore(HTMLplayerScoreID);
	setDomCanvas(HTMLcanvasID);

	if (gameType === 'local') {

		const elementPlayerName = document.getElementById(HTMLplayerNameID);
		const elementEnamyName = document.getElementById(HTMLenamyNameID);
		elementEnamyName.innerHTML = 'Player 2';
		elementPlayerName.innerHTML = 'Player 1';
		setGameType(gameType);
		console.log('Game type set to local');
	} else if (gameType === 'online') {

		setGameType(gameType);
		console.log('Game type set to online');
		createWebSocket(infoHandler, HTMLplayerNameID, HTMLenamyNameID);
	} else {

		console.error('Invalid game type.');
	}
}

function createGameController() {

	let gameState = false;
    let intervalId = null;
    let intervalIdBall = null;
    let ballState = false;

    return function startGame() {

		if (getGameType() === '') {
            alert('Please select a game type first.');
            return;
        }

        console.log('gameType:', getGameType());

        if (gameState) {

            clearInterval(intervalId);
            if (getGameType() === 'online')
                clearInterval(intervalIdBall);
            gameState = false;
            ballState = false;
            console.log('Game paused');
        } else {

            intervalId = setInterval(keyMovePad, 1000 / FPS);
            if (getGameType() === 'online')
                intervalIdBall = setInterval(uploadPositionBall, 1000 / 20);
            gameState = true;
            ballState = true;
            console.log('Game started');
        }
    };
}
