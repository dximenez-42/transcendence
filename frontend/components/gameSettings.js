const URL_API='http://localhost:8080/api'


async function getGames() {
    const url = `${URL_API}/games/list`;
    const token = sessionStorage.getItem('auth_token');
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        if (response.ok) {
            const games = await response.json();
            return games.data;
        } else {
            console.error("Fetch failed with status:", response.status);
            console.log("Response",response);
            return [];
        }
    } catch (error) {
        console.error("There was a problem with the Fetch request:", error.message);
        return [];
    }
}


function gameSettings() {
    const button = document.getElementById('vs_settings_button');
    console.log(button)
    button.addEventListener('click', (e) => {
        window.location.hash = "vs_settings"
    })
}

export function renderCreateGame() {
    
}


export async function gamesList() {
    const games = await getGames();
    const container = document.getElementById('gameList');
    container.innerHTML = '';

    console.log(games);
    games.forEach(game => {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-card';
        
        gameDiv.innerHTML = `
            <div class="col-4">
                <h2>${game.host_username}</h2>
            </div>
            <div class="col-4">
                <p>Age: ${game.age}</p>
            </div>
            `;

        if (game.host_username === 'carloga') {
            gameDiv.innerHTML += `
                <div class="col-4">
                    <button class="tc-btn my-2 py-2"><h4><b>JOIN</b></h4></button>
                </div>`;
        } else {
            gameDiv.innerHTML += `
                <div class="col-4">
                    <div>
                        <p id="waiting-text">Waiting<span id="dots"></span></p>
                    </div>
                </div>`
        }
        container.appendChild(gameDiv);
    });

    const button = document.getElementById('create_game_button');

    button.addEventListener('click', (e) => {
        window.location.hash = "create_game";
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
    submit.addEventListener('click', () => {
        window.location.hash = "vs_settings";
    })
};

export function renderGameSettings() {
    gameSettings();
}
