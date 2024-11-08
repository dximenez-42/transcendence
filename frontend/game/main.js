import { keyMovePad, setGameType, getGameType, setPlayerScore, setEnamyScore, setDomCanvas} from './pong.js';
import { FPS, GAME_TIME, gameInfo} from './constants.js'; // modifyed by gao
import { GameInfoHandler } from './infoHandler.js';
import { hideNav, showNav } from '../components/home.js';

let timer = GAME_TIME;
// ------------- GAME SETTINGS ----------------

export function showOverlay(content) {

    if (window.location.hash === '#game_online') {
        if (content) {
            document.getElementById('overlay-content').textContent = content;
        }
        document.getElementById('overlay').style.display = 'flex';
    }
    return;
}


export function hideOverlay() {
    
    if (window.location.hash === '#game_online') {
        document.getElementById('overlay').style.display = 'none';
    }
    return;
}

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
            //window.location.hash = "game_online";
		});
    }
}

//  --------------------------------------------------------------------------------------------------------------------------
// |this function will be called to start or pause the game, for online mode, it will start render or stop render the game    |
// |only local game it will caculate the game logic and render the game, for online mode, it will only render the game        |
// |when this function is called secend time, it will pause the game                                                          |   
// |for local mode, it will pause the game and stop the game logic                                                            |
// |for online mode, it will only stop the game render                                                                        |
//  --------------------------------------------------------------------------------------------------------------------------
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

export function renderGameOnline() {

	hideNav();
    setGameType('online');
	setGame('gameWindow', 'playerName', 'enamyName', 'playerScore', 'enamyScore')
    console.log('gameType:', getGameType());
    showOverlay('Waiting for starting the game');
    // if (gameInfo.socketConnection === true) // if the connection is already established then we can control the game
    //     startGame();
}


export function renderGame(){  // render_local_game
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

export function setGame(HTMLcanvasID, HTMLplayerNameID, HTMLenamyNameID, HTMLplayerScoreID, HTMLenamyScoreID) {

    gameInfo.DOMPlayerNameID = HTMLplayerNameID;
    gameInfo.DOMEnamyNameID = HTMLenamyNameID;
    gameInfo.DOMEnamyScoreID = HTMLenamyScoreID;
    gameInfo.DOMPlayerScoreID = HTMLplayerScoreID;
    gameInfo.DOMPlayerNameElement = document.getElementById(HTMLplayerNameID);
    gameInfo.DOMEnamyNameElement = document.getElementById(HTMLenamyNameID);
    gameInfo.DOMPlayerScoreElement = document.getElementById(HTMLplayerScoreID);
    gameInfo.DOMEnamyScoreElement = document.getElementById(HTMLenamyScoreID);
    setEnamyScore();
	setPlayerScore();
	setDomCanvas(HTMLcanvasID);

    if (gameInfo.playerName === '' || gameInfo.enamyName === '') {
        gameInfo.DOMEnamyNameElement.innerHTML = 'Player 2';
        gameInfo.DOMPlayerNameElement.innerHTML = 'Player 1';
    }else {

        gameInfo.DOMEnamyNameElement.innerHTML  = gameInfo.enamyName;
        gameInfo.DOMPlayerNameElement.innerHTML = gameInfo.playerName;
    }

	if (getGameType() === 'local') {
		// setGameType(gameType);
		console.log('Game type set to local');
	} else if (getGameType() === 'online') {
		// setGameType(gameType);
		console.log('Game type set to online');
		// createWebSocket(cur_gameInfoHandler);
	} else {
		console.error('Invalid game type.');
		window.location.hash = "#vs_settings";
	}
}

function createGameController() {

	let gameState = false;
    let intervalId = null;
    //let intervalIdBall = null;
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
            // if (getGameType() === 'online')
            //     clearInterval(intervalIdBall);
            gameState = false;
            ballState = false;
            pauseTimer(intervalIdTimerRef);
            console.log('Game paused');
        } else {

            intervalId = setInterval(keyMovePad, 1000 / FPS);
            startTimer(intervalIdTimerRef);
            // if (getGameType() === 'online')
            //     intervalIdBall = setInterval(GameInfoHandler.sendPositionSyn, 1000 / FPS_INFO);
            gameState = true;
            ballState = true;
            console.log('Game started');
        }
    };
}