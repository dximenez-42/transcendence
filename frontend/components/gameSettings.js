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
            window.location.hash = "online";
    })
};

export function renderGameSettings() {
    loadLanguage();
    gameSettings();
}

export function renderLocal() {
    
}
