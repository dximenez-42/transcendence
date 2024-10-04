import { keyMovePad, setGameType, getGameType, meshPadEnamy, setPlayerId, meshBall, uploadPositionBall, setDomPlayerScore, setDomEnamyScore, setDomCanvas} from './pong.js';
import { FPS, GAME_TIME } from './constants.js';
import { closeWebSocket, createWebSocket } from './socket.js';
import { setPositionPad, setPositionBall } from './infoHandler.js';
import { hideNav, showNav } from '../components/home.js';
import { getGames, leaveGame } from '../api/game.js';
import { loadLanguage } from '../api/languages.js';

let timer = GAME_TIME;
// ------------- GAME SETTINGS ----------------






export async function gameList() {
    const games = await getGames();
    const container = document.getElementById('gameList');
    container.innerHTML = '';

    const storedUsername = sessionStorage.getItem('username');

    let userGame = null;

    games.forEach(game => {
        if (game.host_username === storedUsername) {
            userGame = game;
        } else {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-card';

            gameDiv.innerHTML = `
                <div class="col-4">
                    <h2>${game.host_username}</h2>
                </div>
                <div class="col-4">
                    <p data-translate-key="points">6 points</p>
                </div>
            `;

            gameDiv.innerHTML += `
                <div class="col-4">
                    <div>
                        <button class="tc-btn my-2 py-2"><h4><b>JOIN</b></h4></button>
                    </div>
                </div>`;

            container.appendChild(gameDiv);
        }
    });

    const buttonContainer = document.getElementById('create_game_button').parentNode;
    
    if (userGame) {
        const userGameDiv = document.createElement('div');
        userGameDiv.className = 'my-game-card';

        userGameDiv.innerHTML = `
            <div class="col-4">
                6<h2 data-translate-key="points">points</h2>
            </div>
            <div class="col-4">
                <p id="waiting-text">Waiting<span id="dots"></span></p> 
            </div>
            <div class="col-4">
                <button id="leave_game_button" class="tc-btn my-2 py-2"><h4><b data-translate-key="leave_game" class="tc-upper">LEAVE GAME</b></h4></button>
            </div>`;

        buttonContainer.replaceChild(userGameDiv, document.getElementById('create_game_button'));

        document.getElementById('leave_game_button').addEventListener('click', async () => {
            console.log("button pressed");
            await leaveGame(userGame.game_id);
            window.location.reload();
        });
    } else {
        const button = document.getElementById('create_game_button');
        button.addEventListener('click', () => {
            window.location.hash = "create_game";
        });
    }
    loadLanguage();
}


export function selectMode() {
	const buttonLocalGame = document.getElementById('localGameButton');
	const buttonOnlineGame = document.getElementById('onlineGameButton');
	showNav();
	
    console.log(buttonLocalGame);
    console.log(buttonOnlineGame);
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
				console.log('gameType:', getGameType());
				startGame();
				//startTimer(150);
			}
		});
	}else {
		console.log('buttonStart not found');
	}

}

function infoHandler(newInfo, HTMLplayerNameID, HTMLenamyNameID) {
    switch (newInfo.action) {
        case 'initInfo':
            if (HTMLenamyNameID && HTMLplayerNameID) {
                const elementPlayerName = document.getElementById(HTMLplayerNameID);
                const elementEnamyName = document.getElementById(HTMLenamyNameID);
                elementEnamyName.innerHTML = newInfo.enamyName;
                elementPlayerName.innerHTML = newInfo.playerName;
                setPlayerId(newInfo.userId);
            }
            break;
        case 'updatePad':
            setPositionPad(newInfo.newPosition, meshPadEnamy);
            break;
        case 'updateBall':
            setPositionBall(newInfo.newPosition, meshBall);
            break;
        case 'gameOver':
            alert('Game Over');
            closeWebSocket();
            break;
        default:
            console.error('Invalid info type from server.');
    }
}

export function setGame(HTMLcanvasID, HTMLplayerNameID, HTMLenamyNameID, HTMLplayerScoreID, HTMLenamyScoreID) {

	setDomEnamyScore(HTMLenamyScoreID);
	setDomPlayerScore(HTMLplayerScoreID);
	setDomCanvas(HTMLcanvasID);
	console.log(getGameType);
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
		createWebSocket(infoHandler, HTMLplayerNameID, HTMLenamyNameID);
	} else {
		console.error('Invalid game type.');
		window.location.href = "#vs_settings";
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
                intervalIdBall = setInterval(uploadPositionBall, 1000 / 20);
            gameState = true;
            ballState = true;
            console.log('Game started');
        }
    };
}
