import { createGame, getGames, joinGame, leaveGame } from '../api/game.js'
import { loadLanguage } from '../api/languages.js';
import { createTournament, getTournaments, joinTournament, leaveTournament } from '../api/tournament.js';


// Tournament list functions
async function renderTournamentList() {
    const tournaments = await getTournaments();
    const container = document.getElementById('tournamentList');
    container.innerHTML = '';

    const storedUsername = sessionStorage.getItem('username');
    const userJoinedGame = await checkIfUserJoinedGame();
    const userJoinedTournament = await isJoinedToTournament();

    tournaments.forEach(tournament => {
        const isUserTournament = tournament.host_username === storedUsername;
        console.log(isUserTournament);
        renderTournament(tournament, container, isUserTournament, userJoinedGame, userJoinedTournament);
    });

    setupCreateTournamentButton(userJoinedGame, userJoinedTournament);
}

function renderTournament(tournament, container, isUserTournament, userJoinedGame, userJoinedTournament) {
    const tournamentDiv = createTournamentDiv(tournament, isUserTournament, userJoinedGame, userJoinedTournament);

    if (isUserTournament) {
        const buttonContainer = document.getElementById('create_tournament_button').parentNode;
        buttonContainer.replaceChild(tournamentDiv, document.getElementById('create_tournament_button'));
        setupLeaveTournamentButton(tournamentDiv, tournament.tournament_id, buttonContainer);
    } else {
        container.appendChild(tournamentDiv);
        const joinButton = tournamentDiv.querySelector('#out_join_tournament_button');
        setupTournamentClickListener(joinButton, tournament);
    }
    if (userJoinedTournament && !isUserTournament) {
        disableCreateTournamentButton();
    }
}

function createTournamentDiv(tournament, isUserTournament, userJoinedGame, userJoinedTournament) {
    const tournamentDiv = document.createElement('div');
    tournamentDiv.className = isUserTournament ? 'my-game-card' : 'tournament-card';
    const isDisabled = false;
    console.log(userJoinedGame, userJoinedTournament, isUserTournament, tournament);
    tournamentDiv.innerHTML = `
        <div class="col-4">
            <h2>${tournament.name}</h2>
        </div>
        <div class="col-4">
            <p id="waiting-text">Waiting<span id="dots"></span></p>
        </div>
        <div class="col-4">
            <div>
                <button id="${isUserTournament ? 'leave_tournament_button' : 'out_join_tournament_button'}" 
                        class="tc-btn my-2 py-2 ${isDisabled ? 'tc-btn-disabled' : ''}" 
                        ${isDisabled ? 'disabled' : ''}>
                    <h4><b>${isUserTournament ? 'LEAVE GAME' : (tournament.joined ? 'WAITING' : 'JOIN')}</b></h4>
                </button>
            </div>
        </div>`;


    return tournamentDiv;
}

async function handleCreateTournament() {
    const response = await createTournament();
    if (response) {
        const userTournament = response;
        const userJoinedGame = await checkIfUserJoinedGame();
        const userJoinedTournament = await isJoinedToTournament();
        const userTournamentDiv = createTournamentDiv(userTournament, true, userJoinedGame, userJoinedTournament);
        const buttonContainer = this.parentNode;
        buttonContainer.replaceChild(userTournamentDiv, this);

        setupLeaveTournamentButton(userTournamentDiv, userTournament.tournament_id, buttonContainer);
        disableAllElementsExceptCurrent(userTournament.tournament_id);
        sessionStorage.setItem('currentTournamentId', userTournament.tournament_id);
    }
}

// Game list functions
async function renderGameList() {
    const games = await getGames();
    const container = document.getElementById('gameList');
    container.innerHTML = '';

    const storedUsername = sessionStorage.getItem('username');
    const userJoinedGame = await checkIfUserJoinedGame();
    const userJoinedTournament = await isJoinedToTournament();

    games.forEach(game => {
        const isUserGame = game.host_username === storedUsername;
        renderGame(game, container, isUserGame, userJoinedGame, userJoinedTournament);
    });

    setupCreateGameButton(userJoinedGame || userJoinedTournament);
}

function renderGame(game, container, isUserGame, userJoinedGame, userJoinedTournament) {
    const gameDiv = createGameDiv(game, isUserGame, userJoinedGame, userJoinedTournament);

    if (isUserGame) {
        const buttonContainer = document.getElementById('create_game_button').parentNode;
        buttonContainer.replaceChild(gameDiv, document.getElementById('create_game_button'));
        setupLeaveGameButton(gameDiv, game.game_id, buttonContainer);
    } else {
        container.appendChild(gameDiv);
        const joinButton = gameDiv.querySelector('#join_game_button');
        setupGameClickListener(joinButton, game);
    }
}

function createGameDiv(game, isUserGame, userJoinedGame, userJoinedTournament) {
    const gameDiv = document.createElement('div');
    gameDiv.className = isUserGame ? 'my-game-card' : 'game-card';
    const isDisabled = (userJoinedGame || userJoinedTournament) && !game.joined;
    if (isDisabled) {
        gameDiv.classList.add('disabled');
    }

    const buttonClass = isDisabled ? 'tc-btn-disabled' : 'tc-btn';
    const buttonDisabled = isDisabled ? 'disabled' : '';

    gameDiv.innerHTML = `
        <div class="col-4">
            <h2>${game.host_username}</h2>
        </div>
        <div class="col-4">
            <p id="waiting-text">Waiting<span id="dots"></span></p>
        </div>
        <div class="col-4">
            <div>
                <button id="${isUserGame ? 'leave_game_button' : 'join_game_button'}" class="${buttonClass} my-2 py-2" ${buttonDisabled}>
                    <h4><b>${isUserGame ? 'LEAVE GAME' : (game.joined ? 'WAITING' : 'JOIN')}</b></h4>
                </button>
            </div>
        </div>`;

    return gameDiv;
}

async function isJoinedToTournament() {
    const tournaments = await getTournaments();
    return tournaments.some(tournament => tournament.joined);
}

async function checkIfUserJoinedGame() {
    const games = await getGames();
    return games.some(game => game.joined);
}

function setupCreateGameButton(isDisabled) {
    const button = document.getElementById('create_game_button');
    if (button) {
        button.disabled = isDisabled;
        button.classList.toggle('tc-btn-disabled', isDisabled);
        button.classList.toggle('tc-btn', !isDisabled);
        if (!isDisabled) {
            button.addEventListener('click', handleCreateGame);
        }
    }
}

function setupLeaveGameButton(gameDiv, gameId, buttonContainer) {
    const leaveButton = gameDiv.querySelector('#leave_game_button');
    leaveButton.addEventListener('click', async () => {
        if (await leaveGame(gameId)) {
            handleSuccessfulLeaveGame(buttonContainer, gameDiv);
            console.log("left game successfully 2");
        }
    });
}

function handleSuccessfulLeaveGame(buttonContainer, gameDiv) {
    console.log("handleSuccessfulLeaveGame");
    replaceWithCreateGameButton(buttonContainer, gameDiv);
    enableCreateGameButton();
    enableCreateTournamentButton();
    enableAllGameElements();
    enableAllTournamentElements();
}

function enableCreateGameButton() {
    const createGameButton = document.getElementById('create_game_button');
    if (createGameButton) {
        createGameButton.disabled = false;
        createGameButton.classList.remove('tc-btn-disabled');
        createGameButton.classList.add('tc-btn');
    }
}

function enableAllGameElements() {
    enableGameCards();
    enableJoinGameButtons();
}

function enableGameCards() {
    const gameList = document.getElementById('gameList');
    const gameCards = gameList.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
        const joinButton = card.querySelector('#join_game_button');
        if (joinButton) {
            joinButton.disabled = false;
        }
    });
}

function enableJoinGameButtons() {
    const joinButtons = document.querySelectorAll('#join_game_button');
    joinButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('tc-btn-disabled');
        button.classList.add('tc-btn');
    });
}

function setupGameClickListener(gameDiv, game) {
    gameDiv.addEventListener('click', () => {
        showGameModal(game);
    });
}

function showGameModal(game) {
    let modal = document.getElementById(`gameModal-${game.id}`);
    if (!modal) {
        modal = createGameModal(game);
        document.body.appendChild(modal);
    } else {
        updateGameModal(modal, game);
    }

    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    setupGameModalEventListeners(modal, game);

    // Add event listener to destroy modal when it's hidden
    modal.addEventListener('hidden.bs.modal', function () {
        modal.remove();
    });
}

function createGameModal(game) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = `gameModal-${game.id}`;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', `gameModalLabel-${game.id}`);
    modal.setAttribute('aria-hidden', 'true');

    updateGameModal(modal, game);

    return modal;
}

function updateGameModal(modal, game) {
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="tc-modal modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="gameModalLabel-${game.id}">${game.host_username}'s Game</h5>
                </div>
                <div class="modal-body">
                    <p>Host: ${game.host_username}</p>
                    <p>Players: ${game.players}/2</p>
                </div>
                <div class="modal-footer">
                    ${game.joined ?
            `<button type="button" id="leave_game_button" class="btn tc-btn">Leave Game</button>` :
            `<button type="button" class="btn tc-btn" data-bs-dismiss="modal">Close</button>
                         <button type="button" id="join_game_button" class="btn tc-btn">Join Game</button>`
        }
                </div>
            </div>
        </div>
    `;
}

function setupGameModalEventListeners(modal, game) {
    const modalFooter = modal.querySelector('.modal-footer');

    modalFooter.addEventListener('click', async (e) => {
        if (e.target.id === 'leave_game_button') {
            e.preventDefault();
            const response = await leaveGame(game.game_id);
            if (response) {
                handleSuccessfulModalLeaveGame(game);
            }
        } else if (e.target.id === 'join_game_button') {
            e.preventDefault();
            const response = await joinGame(game.game_id);
            if (response) {
                handleSuccessfulJoinGame(game);
            }
        }
    });
}

function handleSuccessfulModalLeaveGame(game) {
    updateGameStatus(game, false);
    enableCreateGameButton();
    enableCreateTournamentButton();
    enableAllGameElements();
    enableAllTournamentElements();
}

function handleSuccessfulJoinGame(game) {
    updateGameStatus(game, true);
    disableCreateGameButton();
    disableAllTournamentElements();
}

function disableCreateGameButton() {
    const createGameButton = document.getElementById('create_game_button');
    if (createGameButton) {
        createGameButton.disabled = true;
        createGameButton.classList.add('tc-btn-disabled');
        createGameButton.classList.remove('tc-btn');
    }
}

function updateGameStatus(game, joined) {
    game.joined = joined;
    updateGameModalButtons(joined);
    document.getElementById('join_game_button').innerHTML = `<h4><b>${joined ? 'WAITING' : 'JOIN'}</b></h4>`;
}

function updateGameModalButtons(joined) {
    const modalFooter = document.querySelector('.modal-footer');
    modalFooter.innerHTML = joined ?
        `<button type="button" id="leave_game_button" class="btn tc-btn">Leave Game</button>` :
        `<button type="button" class="btn tc-btn" data-bs-dismiss="modal">Close</button>
         <button type="button" id="join_game_button" class="btn tc-btn">Join Game</button>`;
}


async function handleCreateGame() {
    const response = await createGame();
    if (response) {
        const userGame = response;
        const userGameDiv = createGameDiv(userGame, true);
        const buttonContainer = this.parentNode;
        buttonContainer.replaceChild(userGameDiv, this);

        setupLeaveGameButton(userGameDiv, userGame.game_id, buttonContainer);

        // Disable all join game options
        const joinButtons = document.querySelectorAll('#join_game_button');
        joinButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('tc-btn-disabled');
            button.classList.remove('tc-btn');
        });

        // Disable game card clicks and change appearance
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.style.opacity = '0.6';
            card.style.cursor = 'default';
        });

        // Disable all tournament elements
        disableAllTournamentElements();
    }
}

function replaceWithCreateGameButton(container, currentElement) {
    const createGameButton = document.createElement('button');
    createGameButton.id = 'create_game_button';
    createGameButton.className = 'tc-btn my-2 py-2';
    createGameButton.innerHTML = '<h4><b class="tc-upper">CREATE GAME</b></h4>';

    container.replaceChild(createGameButton, currentElement);

    createGameButton.addEventListener('click', handleCreateGame);
}


function setupLeaveTournamentButton(tournamentDiv, tournamentId, buttonContainer) {
    const leaveButton = tournamentDiv.querySelector('#leave_tournament_button');
    leaveButton.addEventListener('click', async () => {
        if (await leaveTournament(tournamentId)) {
            handleSuccessfulLeaveTournament(buttonContainer, tournamentDiv);
        }
    });
}

function handleSuccessfulLeaveTournament(buttonContainer, tournamentDiv) {
    replaceWithCreateTournamentButton(buttonContainer, tournamentDiv);
    enableCreateTournamentButton();
    enableAllTournamentElements();
    enableAllGameElements();
    enableCreateGameButton();
}

function enableCreateTournamentButton() {
    const createTournamentButton = document.getElementById('create_tournament_button');
    if (createTournamentButton) {
        createTournamentButton.disabled = false;
        createTournamentButton.classList.remove('tc-btn-disabled');
        createTournamentButton.classList.add('tc-btn');
    }
}

function enableAllTournamentElements() {
    enableTournamentCards();
    enableJoinButtons();
}

function enableTournamentCards() {
    const tournamentList = document.getElementById('tournamentList');
    const tournamentCards = tournamentList.querySelectorAll('.tournament-card');
    tournamentCards.forEach(card => {
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
        const joinButton = card.querySelector('#out_join_tournament_button');
        if (joinButton) {
            joinButton.disabled = false;
        }
    });
}

function enableJoinButtons() {
    const joinButtons = document.querySelectorAll('#out_join_tournament_button');
    joinButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('tc-btn-disabled');
        button.classList.add('tc-btn');
    });
}

function setupTournamentClickListener(tournamentDiv, tournament) {
    tournamentDiv.addEventListener('click', () => {
        showTournamentModal(tournament);
    });
}

function showTournamentModal(tournament) {
    const modal = createTournamentModal(tournament);
    document.body.appendChild(modal);

    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    setupModalEventListeners(modal, tournament);

    // Add event listener to destroy modal when it's hidden
    modal.addEventListener('hidden.bs.modal', function () {
        modal.remove();
    });
}

export async function renderTournaments() {
    const tournamentsDiv = document.getElementById('tournaments');
    tournamentsDiv.innerHTML = '';
    const tournaments = await getTournaments(); 

    if (tournaments.length === 0) {
        tournamentsDiv.innerHTML = '<p>No hay torneos disponibles</p>';
        return;
    }

    tournaments.forEach(tournament => {
        const card = document.createElement('div');
        card.classList.add('tournament-card');

        const title = document.createElement('h2');
        title.textContent = tournament.name; 

        const host = document.createElement('p');
        host.textContent = `Host: ${tournament.host}`; 

        const viewButton = document.createElement('a');
        viewButton.href = `/tournament/${tournament.id}`; 
        viewButton.textContent = 'Ver Torneo';
        viewButton.classList.add('view-button');

        card.appendChild(title);
        card.appendChild(host);
        card.appendChild(viewButton);

        tournamentsDiv.appendChild(card);
    });
}

function createTournamentModal(tournament) {
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
                </div>
                <div class="modal-body">
                    <p>Host: ${tournament.host_username}</p>
                    <p>Points: ${tournament.points}</p>
                    <p>Players: ${tournament.players}/${tournament.max_players}</p>
                </div>
                <div class="modal-footer">
                    ${tournament.joined ?
            `<button type="button" id="leave_tournament_button" class="btn tc-btn">Leave Tournament</button>` :
            `<button type="button" class="btn tc-btn" data-bs-dismiss="modal">Close</button>
                         <button type="button" id="join_tournament_button" class="btn tc-btn">Join Tournament</button>`
        }
                </div>
            </div>
        </div>
    `;

    return modal;
}

function setupModalEventListeners(modal, tournament) {
    const modalFooter = modal.querySelector('.modal-footer');

    modalFooter.addEventListener('click', async (e) => {
        if (e.target.id === 'leave_tournament_button') {
            e.preventDefault();
            const response = await leaveTournament(tournament.tournament_id);
            if (response) {
                handleSuccessfulModalLeaveTournament(tournament);
            }
        } else if (e.target.id === 'join_tournament_button') {
            e.preventDefault();
            const response = await joinTournament(tournament.tournament_id);
            if (response) {
                handleSuccessfulJoinTournament(tournament);
            }
        }
    });
}

function handleSuccessfulModalLeaveTournament(tournament) {
    updateTournamentStatus(tournament, false);
    enableCreateTournamentButton();
    enableCreateGameButton();
    enableAllTournamentElements();
    enableAllGameElements();
}

function handleSuccessfulJoinTournament(tournament) {
    updateTournamentStatus(tournament, true);
    disableCreateTournamentButton();
    disableAllGameElements();
}

function disableCreateTournamentButton() {
    const createTournamentButton = document.getElementById('create_tournament_button');
    if (createTournamentButton) {
        createTournamentButton.disabled = true;
        createTournamentButton.classList.add('tc-btn-disabled');
        createTournamentButton.classList.remove('tc-btn');
    }
}

function updateTournamentStatus(tournament, joined) {
    tournament.joined = joined;
    updateModalButtons(joined);
    document.getElementById('out_join_tournament_button').innerHTML = `<h4><b>${joined ? 'WAITING' : 'JOIN'}</b></h4>`;
}

function updateModalButtons(joined) {
    const modalFooter = document.querySelector('.modal-footer');
    modalFooter.innerHTML = joined ?
        `<button type="button" id="leave_tournament_button" class="btn tc-btn">Leave Tournament</button>` :
        `<button type="button" class="btn tc-btn" data-bs-dismiss="modal">Close</button>
         <button type="button" id="join_tournament_button" class="btn tc-btn">Join Tournament</button>`;
}

function setupCreateTournamentButton() {
    const button = document.getElementById('create_tournament_button');
    if (button) {
        button.addEventListener('click', handleCreateTournament);
    }
}



function disableAllElementsExceptCurrent(currentTournamentId) {
    // Disable all game elements
    disableAllGameElements();

    // Disable all tournament elements except the current one
    const tournamentCards = document.querySelectorAll('.tournament-card');
    tournamentCards.forEach(card => {
        const joinButton = card.querySelector('#out_join_tournament_button');
        if (joinButton && joinButton.dataset.tournamentId !== currentTournamentId) {
            card.style.opacity = '0.6';
            card.style.cursor = 'default';
            joinButton.disabled = true;
            joinButton.classList.add('tc-btn-disabled');
            joinButton.classList.remove('tc-btn');
        }
    });

    // Disable create tournament button
    const createTournamentButton = document.getElementById('create_tournament_button');
    if (createTournamentButton) {
        createTournamentButton.disabled = true;
        createTournamentButton.classList.add('tc-btn-disabled');
        createTournamentButton.classList.remove('tc-btn');
    }
}

function replaceWithCreateTournamentButton(container, currentElement) {
    const createTournamentButton = document.createElement('button');
    createTournamentButton.id = 'create_tournament_button';
    createTournamentButton.className = 'tc-btn my-2 py-2';
    createTournamentButton.innerHTML = '<h4><b class="tc-upper">CREATE TOURNAMENT</b></h4>';

    container.replaceChild(createTournamentButton, currentElement);

    createTournamentButton.addEventListener('click', handleCreateTournament);
}

function disableAllGameElements() {
    const createGameButton = document.getElementById('create_game_button');
    if (createGameButton) {
        createGameButton.disabled = true;
        createGameButton.classList.add('tc-btn-disabled');
        createGameButton.classList.remove('tc-btn');
    }

    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.style.opacity = '0.6';
        card.style.cursor = 'default';
        const joinButton = card.querySelector('#join_game_button');
        if (joinButton) {
            joinButton.disabled = true;
            joinButton.classList.add('tc-btn-disabled');
            joinButton.classList.remove('tc-btn');
        }
    });
}

function disableAllTournamentElements() {
    const createTournamentButton = document.getElementById('create_tournament_button');
    if (createTournamentButton) {
        createTournamentButton.disabled = true;
        createTournamentButton.classList.add('tc-btn-disabled');
        createTournamentButton.classList.remove('tc-btn');
    }

    const tournamentCards = document.querySelectorAll('.tournament-card');
    tournamentCards.forEach(card => {
        card.style.opacity = '0.6';
        card.style.cursor = 'default';
        const joinButton = card.querySelector('#out_join_tournament_button');
        if (joinButton) {
            joinButton.disabled = true;
            joinButton.classList.add('tc-btn-disabled');
            joinButton.classList.remove('tc-btn');
        }
    });
}

// Tab controller
export function tabController() {
    setupTabEventListeners();
    restoreActiveTab();
}

function setupTabEventListeners() {
    document.querySelectorAll('.tc-nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            sessionStorage.setItem('activeTab', event.target.id);
        });
    });
}

function restoreActiveTab() {
    const activeTab = sessionStorage.getItem('activeTab');
    if (activeTab) {
        const tab = new bootstrap.Tab(document.getElementById(activeTab));
        tab.show();
    } else {
        const defaultTab = new bootstrap.Tab(document.getElementById('tab1-tab'));
        defaultTab.show();
    }
}

// Match points setup
export function setMatchPoints() {
    loadLanguage();
    setupMatchPointsControls();
    setupCreateGameSubmit();
}

function setupMatchPointsControls() {
    const matchPointsInput = document.getElementById('matchPoints');
    const incrementBtn = document.getElementById('increment');
    const decrementBtn = document.getElementById('decrement');

    incrementBtn.addEventListener('click', () => {
        matchPointsInput.value = parseInt(matchPointsInput.value, 10) + 1;
    });

    decrementBtn.addEventListener('click', () => {
        let currentValue = parseInt(matchPointsInput.value, 10);
        if (currentValue > 0) {
            matchPointsInput.value = currentValue - 1;
        }
    });
}

function setupCreateGameSubmit() {
    const submit = document.getElementById('create_game_submit');
    submit.addEventListener('click', async () => {
        const response = await createGame();
        if (response) {
            window.location.hash = "online";
        }
    });
}

// Main render functions
export function renderonline() {
    loadLanguage();
    renderTournamentList();
    renderGameList();
    tabController();
}

export function renderLocal() {
    // Implementation for local rendering
}
