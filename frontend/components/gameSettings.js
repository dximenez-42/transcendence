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
                if (await joinGame(game.game_id))
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
    if (tournaments.length > 0)
    {

    }
    tournaments.forEach(tournament => {
        if (tournament.host_username === storedUsername) {
            userTournament = tournament;
        } else {
            const tournamentDiv = document.createElement('div');
            tournamentDiv.className = 'tournament-card';

            tournamentDiv.innerHTML = `
                <div class="col-4">
                    <h2>${tournament.host_username}</h2>
                </div>
                <div class="col-4">
                    <p data-translate-key="points">6 points</p>
                </div>
                `;
            tournamentDiv.innerHTML += `
                <div class="col-4">
                    <div>
                        <button class="tc-btn my-2 py-2"><h4><b>JOIN</b></h4></button>
                    </div>
                </div>`;
            
            tournamentDiv.addEventListener('click', () => {
                console.log("click")
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = `tournamentModal-${tournament.id}`;
                modal.setAttribute('tabindex', '-1');
                modal.setAttribute('aria-labelledby', `tournamentModalLabel-${tournament.id}`);
                modal.setAttribute('aria-hidden', 'true');

                modal.innerHTML = `
                    <div class="modal-dialog">
                        <div class="tc-modal modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="tournamentModalLabel-${tournament.id}">${tournament.host_username}'s Tournament</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>Host: ${tournament.host_username}</p>
                                <p>Points: ${tournament.points}</p>
                                <p>Players: ${tournament.players}/${tournament.max_players}</p>
                                <!-- Add more tournament details here -->
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn tc-btn" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn tc-btn">Join Tournament</button>
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);

                const bootstrapModal = new bootstrap.Modal(modal);
                bootstrapModal.show();
            });
                

            container.appendChild(tournamentDiv);
        }
    });

    const buttonContainer = document.getElementById('create_tournament_button').parentNode;

    if (userTournament) {
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
                <button id="leave_game_button" class="tc-btn my-2 py-2"><h4><b class="tc-upper">LEAVE GAME</b></h4></button>
            </div>`;

        buttonContainer.replaceChild(userTournamentDiv, document.getElementById('create_tournament_button'));

        document.getElementById('leave_game_button').addEventListener('click', async () => {
            if (await leaveTournament(userTournament.tournament_id))
                window.location.reload();
        });
    } else {
        console.log("renderiza")
        const button = document.getElementById('create_tournament_button');
        button.addEventListener('click', async () => {
            const response = await createTournament()
            if (response) {
                window.location.reload();
            }
        });
    }
    loadLanguage();
}

export function tabController() {
    // Almacenar la pestaña seleccionada en sessionStorage
    document.querySelectorAll('.tc-nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            sessionStorage.setItem('activeTab', event.target.id);
        });
    });

    // Restaurar la pestaña seleccionada al cargar la página
    const activeTab = sessionStorage.getItem('activeTab');
    if (activeTab) {
        const tab = new bootstrap.Tab(document.getElementById(activeTab));
        tab.show();
    } else {
        // Si no hay pestaña guardada, seleccionar la primera pestaña por defecto
        const defaultTab = new bootstrap.Tab(document.getElementById('tab1-tab'));
        defaultTab.show();
    }
}

export function setMatchPoints() {
    loadLanguage();
    const matchPointsInput = document.getElementById('matchPoints');
    const incrementBtn = document.getElementById('increment');
    const decrementBtn = document.getElementById('decrement');

    incrementBtn.addEventListener('click', function () {
        let currentValue = parseInt(matchPointsInput.value, 10);
        matchPointsInput.value = currentValue + 1;
    });

    decrementBtn.addEventListener('click', function () {
        let currentValue = parseInt(matchPointsInput.value, 10);
        if (currentValue > 0) {
            matchPointsInput.value = currentValue - 1;
        }
    });

    const submit = document.getElementById('create_game_submit');
    submit.addEventListener('click', async () => {
        const response = await createGame()
        if (response)
            window.location.hash = "online";
    })
};

export function renderGameSettings() {
    loadLanguage();
    // gameSettings();
    tournamentList();
    gameList();
    tabController();
}

export function renderLocal() {

}
