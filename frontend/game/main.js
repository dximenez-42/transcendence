import { keyMovePad, setGameType, getGameType, setDomPlayerScore, setDomEnamyScore, setDomCanvas} from './pong.js';
import { FPS, FPS_BALL, GAME_TIME} from './constants.js';
import { createWebSocket } from './socket.js';
import { GameInfoHandler } from './infoHandler.js';
import { hideNav, showNav } from '../components/home.js';
import { createGame, getGames } from '../api/game.js';
import { loadLanguage } from '../api/languages.js';

let timer = GAME_TIME;
// ------------- GAME SETTINGS ----------------


export function selectMode() {
	const buttonLocalGame = document.getElementById('localGameButton');
	const buttonOnlineGame = document.getElementById('onlineGameButton');
	showNav();

	if (buttonLocalGame) {
		buttonLocalGame.addEventListener('click', () => {
			setGameType('local');
			window.location.hash = "game";
		});
	}
	if (buttonOnlineGame) {
		buttonOnlineGame.addEventListener('click', () => {
			setGameType('online');
			window.location.hash = "online";
		});
    }
}

// ----------------------------------------

export let startGame = createGameController();

function startTimer(intervalIdTimerRef) {
    let display = document.getElementById("timer-display");
    let minutes, seconds;

    if (intervalIdTimerRef.current) {
        clearInterval(intervalIdTimerRef.current);
    }

    intervalIdTimerRef.current = setInterval(function () {
        if (--timer <= 0) {
            timer = GAME_TIME;
            clearInterval(intervalIdTimerRef.current);
            return;
        }

        minutes = Math.floor(timer / 60);
        seconds = timer % 60;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
    }, 1000);
}

function pauseTimer(intervalIdTimerRef) {
    if (intervalIdTimerRef.current) {
        clearInterval(intervalIdTimerRef.current);
    }
}




export function renderGame(){
	const buttonStart = document.getElementById('pause');
	hideNav();

	setGame('gameWindow', 'playerName', 'enamyName', 'playerScore', 'enamyScore')
	if (buttonStart) {
		buttonStart.addEventListener('click', function () {

			if (getGameType() == '') {

				alert('Please select a game type first.');
				return;
			} else {
				startGame();
				//startTimer(150);
			}
		});
	}else {
		console.log('buttonStart not found');
	}

}

// function infoHandler(newInfo, HTMLplayerNameID, HTMLenamyNameID) {
//     switch (newInfo.action) {
//         case 'initInfo':
//             if (HTMLenamyNameID && HTMLplayerNameID) {
//                 const elementPlayerName = document.getElementById(HTMLplayerNameID);
//                 const elementEnamyName = document.getElementById(HTMLenamyNameID);
//                 elementEnamyName.innerHTML = newInfo.enamyName;
//                 elementPlayerName.innerHTML = newInfo.playerName;
//                 setPlayerId(newInfo.userId);
//             }
//             break;
//         case 'updatePad':
//             setPositionPad(newInfo.newPosition, meshPadEnamy);
//             break;
//         case 'updateBall':
//             setPositionBall(newInfo.newPosition, meshBall);
//             break;
//         case 'gameOver':
//             alert('Game Over');
//             closeWebSocket();
//             break;
//         default:
//             console.error('Invalid info type from server.');
//     }
// }

export function setGame(HTMLcanvasID, HTMLplayerNameID, HTMLenamyNameID, HTMLplayerScoreID, HTMLenamyScoreID) {

	setDomEnamyScore(HTMLenamyScoreID);
	setDomPlayerScore(HTMLplayerScoreID);
	setDomCanvas(HTMLcanvasID);
    let cur_gameInfoHandler = new GameInfoHandler (HTMLplayerNameID, HTMLenamyNameID);
	if (getGameType() === 'local') {

		const elementPlayerName = document.getElementById(HTMLplayerNameID);
		const elementEnamyName = document.getElementById(HTMLenamyNameID);
		elementEnamyName.innerHTML = 'Player 2';
		elementPlayerName.innerHTML = 'Player 1';
		// setGameType(gameType);
		console.log('Game type set to local');
	} else if (getGameType() === 'online') {

		// setGameType(gameType);
		console.log('Game type set to online');
		createWebSocket(cur_gameInfoHandler);
	} else {
		console.error('Invalid game type.');
		window.location.href = "#home";
	}
}

function createGameController() {

	let gameState = false;
    let intervalId = null;
    let intervalIdBall = null;
    let ballState = false;
    let intervalIdTimerRef = { current: null };

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
            pauseTimer(intervalIdTimerRef);
            console.log('Game paused');
        } else {

            intervalId = setInterval(keyMovePad, 1000 / FPS);
            startTimer(intervalIdTimerRef);
            if (getGameType() === 'online')
                intervalIdBall = setInterval(GameInfoHandler.sendPositionBall, 1000 / FPS_BALL);
            gameState = true;
            ballState = true;
            console.log('Game started');
        }
    };
}
