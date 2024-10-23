import { createGame, getGames, joinGame, leaveGame } from '../api/game.js'
import { loadLanguage } from '../api/languages.js';
import { createTournament, getTournaments, leaveTournament } from '../api/tournament.js';

function gameSettings() {
    const vs_button = document.getElementById('localGameButton');
    const tournament_button = document.getElementById('onlineGameButton');

    vs_button.addEventListener('click', (e) => {
        window.location.hash = "vs_settings"
    })

    tournament_button.addEventListener('click', (e) => {
        window.location.hash = "tournament_settings"
    })
}



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
                <p id="waiting-text">Waiting<span id="dots"></span></p>
            </div>
            `;

            gameDiv.innerHTML += `
                <div class="col-4">
                    <div>
                        <button id="join_game_button" class="tc-btn my-2 py-2"><h4><b>JOIN</b></h4></button>
                    </div>
                </div>`;

            container.appendChild(gameDiv);

            const joinGameButton = document.getElementById("join_game_button");
            joinGameButton.addEventListener('click', async () => {
                if(await joinGame(game.game_id))
                    console.log("joined succesfully");
            });
        }

    });

    const buttonContainer = document.getElementById('create_game_button').parentNode;

    if (userGame) {
        const userGameDiv = document.createElement('div');
        userGameDiv.className = 'my-game-card';

        userGameDiv.innerHTML = `
            <div class="col-4">
                <h2>Otra cosaa</h2>
            </div>
            <div class="col-4">
                <p id="waiting-text">Waiting<span id="dots"></span></p>
            </div>
            <div class="col-4">
                <button id="leave_game_button" class="tc-btn my-2 py-2"><h4><b data-translate-key="leave_game" class="tc-upper">LEAVE GAME</b></h4></button>
            </div>`;

        buttonContainer.replaceChild(userGameDiv, document.getElementById('create_game_button'));

        document.getElementById('leave_game_button').addEventListener('click', async () => {
            await leaveGame(userGame.game_id);
            window.location.reload();
        });
    } else {
        const button = document.getElementById('create_game_button');
        button.addEventListener('click', async () => {
            const response = await createGame()
            window.location.reload();
        });
    }

    loadLanguage();
}



export async function tournamentList() {
    const tournaments = await getTournaments();
    const container = document.getElementById('tournamentList');
    container.innerHTML = '';

    const storedUsername = sessionStorage.getItem('username');

    let userTournament = null;
    tournaments.forEach(game => {
        if (game.host_username === storedUsername) {
            userTournament = game;
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

    const buttonContainer = document.getElementById('create_tournament_button').parentNode;
    
    if (userTournament) {
        console.log(userTournament)
        const userTournamentDiv = document.createElement('div');
        userTournamentDiv.className = 'my-game-card';

        userTournamentDiv.innerHTML = `
            <div class="col-4">
                <h2>${userTournament.name}</h2>
            </div>
            <div class="col-4">
                <p>${userTournament.players}/${userTournament.max_players}</p> 
            </div>
            <div class="col-4">
                <button id="leave_game_button" class="tc-btn my-2 py-2"><h4><b data-translate-key="leave_game" class="tc-upper">LEAVE GAME</b></h4></button>
            </div>`;

        buttonContainer.replaceChild(userTournamentDiv, document.getElementById('create_tournament_button'));

        document.getElementById('leave_game_button').addEventListener('click', async () => {
            if(await leaveTournament(userTournament.tournament_id))
                window.location.reload();
        });
    } else {
        console.log("renderiza")
        const button = document.getElementById('create_tournament_button');
        button.addEventListener('click', async () => {
            const response = await createTournament()
            if (response){
                window.location.reload();
            }
        });
    }
    loadLanguage();
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
            window.location.hash = "game_settings";
    })
};

export function renderGameSettings() {
    loadLanguage();
    // gameSettings();
    tournamentList();
    gameList()
}

export function renderLocal() {
    
}
