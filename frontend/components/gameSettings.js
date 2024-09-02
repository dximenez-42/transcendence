import { createGame, getGames } from '../api/game.js'


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

    const storedUsername = sessionStorage.getItem('username'); // Retrieve the username from sessionStorage

    let userGame = null;

    games.forEach(game => {
        if (game.host_username === storedUsername) {
            // Store the user's game to replace the create game button later
            userGame = game;
        } else {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-card';

            gameDiv.innerHTML = `
                <div class="col-4">
                    <h2>${game.host_username}</h2>
                </div>
                <div class="col-4">
                    <p>6 points</p>
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
        // Replace the "CREATE GAME" button with the user's game details
        const userGameDiv = document.createElement('div');
        userGameDiv.className = 'game-card';

        userGameDiv.innerHTML = `
            <div class="col-4">
                <h2>${userGame.host_username}</h2>
            </div>
            <div class="col-4">
                <p>6 points</p>
            </div>
            <div class="col-4">
                <p id="waiting-text">Waiting<span id="dots"></span></p>
            </div>`;

        buttonContainer.replaceChild(userGameDiv, document.getElementById('create_game_button'));
    } else {
        const button = document.getElementById('create_game_button');
        button.addEventListener('click', () => {
            window.location.hash = "create_game";
        });
    }

    // Animation for "Waiting..."
    document.querySelectorAll('#waiting-text').forEach(element => {
        const dots = element.querySelector('#dots');
        let count = 0;
        setInterval(() => {
            count = (count + 1) % 4; // Cycle between 0, 1, 2, 3
            dots.textContent = '.'.repeat(count); // Add dots
        }, 500); // Adjust the interval time as needed
    });
}



export function setMatchPoints() {
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
    gameSettings();
}
