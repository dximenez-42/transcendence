import { createGame, getGames } from '../api/game.js'
import { loadLanguage } from '../api/languages.js';
const URL_API='http://localhost:8080/api'


function gameSettings() {
    const vs_button = document.getElementById('vs_settings_button');
    const tournament_button = document.getElementById('tournament_settings_button');

    vs_button.addEventListener('click', (e) => {
        window.location.hash = "vs_settings"
    })

    tournament_button.addEventListener('click', (e) => {
        window.location.hash = "tournament_settings"
    })
}

export function renderCreateGame() {
    
}


export async function gamesList() {
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

async function leaveGame(gameId) {
    try {
        const response = await fetch(`${URL_API}/games/leave/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': sessionStorage.getItem('auth_token'),
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to leave game');
        }
        console.log('Game left successfully');
    } catch (error) {
        console.error('Error leaving game:', error.message);
    }
}


export function setMatchPoints() {
    loadLanguage();
    const matchPointsInput = document.getElementById('matchPoints');
    const incrementBtn = document.getElementById('increment');
    const decrementBtn = document.getElementById('decrement');

    incrementBtn.addEventListener('click', function() {
        let currentValue = parseInt(matchPointsInput.value, 10);
        matchPointsInput.value = currentValue + 1;
    });

    decrementBtn.addEventListener('click', function() {
        let currentValue = parseInt(matchPointsInput.value, 10);
        if (currentValue > 0) {
            matchPointsInput.value = currentValue - 1;
        }
    });

    const submit = document.getElementById('create_game_submit');
    submit.addEventListener('click', async () => {
        const response = await createGame()
        if (response)
            window.location.hash = "vs_settings";
    })
};

export function renderGameSettings() {
    loadLanguage();
    gameSettings();
}
