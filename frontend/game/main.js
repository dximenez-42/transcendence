import { keyMovePad, setGameType, getGameType, setDomPlayerScore, setDomEnamyScore, setDomCanvas} from './pong.js';
import { FPS, FPS_INFO, GAME_TIME, gameInfo} from './constants.js';
import { createWebSocket } from './socket.js';
import { GameInfoHandler } from './infoHandler.js'; 
import { hideNav, showNav } from '../components/home.js';
import { getGames, joinGame, leaveGame} from '../api/game.js';
import { loadLanguage } from '../api/languages.js';

let timer = GAME_TIME;
// ------------- GAME SETTINGS ----------------

// export async function quickGame() {

//     const games = await getGames();
//     if (games.length === 0) {
//         await createGame(5);
//         window.location.hash = "game";
//     }
//     games.forEach (
//         async game => {
//             if (game.host_username === sessionStorage.getItem('username')) {
//                 await leaveGame(game.game_id);
//             }
//         }
//     )
// }



export function showOverlay() {
    document.getElementById('overlay').style.display = 'flex';
}


export function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}




export async function gameList() {

    //console.log('gameList');
    // const games = [{'host_username':'yugao'}, {'host_username':'carlosga'}, {'host_username':'jjuarez'}];
    const games = await getGames();
    console.log('games:', games);
    const container = document.getElementById('gameList');
    container.innerHTML = '';

    const storedUsername = sessionStorage.getItem('username');
    console.log('storedUsername:', storedUsername);

    let userGame = null;

    games.forEach(game => {
        if (game.host_username === storedUsername) {
            userGame = game;
            //console.log('userGame:', userGame);
        } else {

            //console.log('game:', game);
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-card';

            gameDiv.innerHTML = `
                <div class="col-4">
                    <h2>${game.host_username.toUpperCase()}</h2>
                </div>
                <div class="col-4">
                    <p data-translate-key="points">6 points</p>
                </div>
            `;

            gameDiv.innerHTML += `
                <div class="col-4">
                    <div>
                        <button class="tc-btn my-2 py-2" id="${game.host_username}'s_game"><h4><b>JOIN</b></h4></button>
                    </div>
                </div>`;

            container.appendChild(gameDiv);

            document.getElementById(`${game.host_username}'s_game`).addEventListener('click', async () => {
                console.log("JOIN button pressed", game.host_username);
                await joinGame(userGame.game_id);
                gameInfo.playerName = storedUsername;
                gameInfo.enamyName = game.host_username;
                window.location.hash = "game_online";
                //window.location.reload();
            });
        }
    });

    const buttonContainer = document.getElementById('create_game_button').parentNode;
    
    if (userGame) {
        const userGameDiv = document.createElement('div');
        userGameDiv.className = 'my-game-card';

        // userGameDiv.innerHTML = `
        //     <div class="col-4">
        //         6<h2 data-translate-key="points">points</h2>
        //     </div>
        //     <div class="col-4">
        //         <p id="waiting-text">Waiting<span id="dots"></span></p> 
        //     </div>
        //     <div class="col-4">
        //         <button id="leave_game_button" class="tc-btn my-2 py-2"><h4><b data-translate-key="leave_game" class="tc-upper">LEAVE GAME</b></h4></button>
        //     </div>`;

        userGameDiv.innerHTML = `
            <div class="col-4">
                <h2>${storedUsername.toUpperCase()}</h2>
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
            console.log('userGameId:', userGame.game_id);
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
			window.location.hash = "game_online";
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


export function renderGameOnline() {

	hideNav();
	
    showOverlay();
	setGame('gameWindow', 'playerName', 'enamyName', 'playerScore', 'enamyScore')
    setGameType('online');
    GameInfoHandler.sendMatchRequest(false);
    //console.log('gameType:', getGameType());
    // if (gameInfo.socketConnection === true) // if the connection is already established then we can control the game
    //     startGame();

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
    gameInfo.DOMPlayerNameID = HTMLplayerNameID;
    gameInfo.DOMEnamyNameID = HTMLenamyNameID;
    gameInfo.DOMEnamyScoreID = HTMLenamyScoreID;
    gameInfo.DOMPlayerScoreID = HTMLplayerScoreID;
    
    let cur_gameInfoHandler = new GameInfoHandler (HTMLplayerNameID, HTMLenamyNameID);
	//console.log(getGameType);

    const elementPlayerName = document.getElementById(HTMLplayerNameID);
    const elementEnamyName = document.getElementById(HTMLenamyNameID);
    if (gameInfo.playerName === '' || gameInfo.enamyName === '') {
        elementEnamyName.innerHTML = 'Player 2';
        elementPlayerName.innerHTML = 'Player 1';
    }else {

        elementEnamyName.innerHTML = gameInfo.enamyName;
        elementPlayerName.innerHTML = gameInfo.playerName;
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
            // if (getGameType() === 'online')
            //     intervalIdBall = setInterval(GameInfoHandler.sendPositionSyn, 1000 / FPS_INFO);
            gameState = true;
            ballState = true;
            console.log('Game started');
        }
    };
}
