import { loadLanguage } from "../api/languages.js";


async function initScripts() {
    const leftBar = document.getElementById('leftBar');
    const rightBar = document.getElementById('rightBar');
    const playButton = document.getElementById('playButton');
    const greeting_username = document.getElementById('greeting_username');


    playButton.addEventListener('mouseover', () => {
        leftBar.classList.add('animate-left-bar');
        rightBar.classList.add('animate-right-bar');
    });

    playButton.addEventListener('mouseout', () => {
        leftBar.classList.remove('animate-left-bar');
        rightBar.classList.remove('animate-right-bar');
    });

    playButton.addEventListener('click', () => {
        window.location.hash = '#game_settings'
    });
    
    const username = sessionStorage.getItem('username');;

    greeting_username.innerHTML = `Welcome ${username}`;
}

function setMatchPoints() {
    const matchPointsInput = document.getElementById('matchPoints');
    const incrementBtn = document.getElementById('increment');
    const decrementBtn = document.getElementById('decrement');

    incrementBtn.addEventListener('click', function() {
        let currentValue = parseInt(matchPointsInput.value, 10);
        matchPointsInput.value = currentValue + 1;
    });

    decrementBtn.addEventListener('click', function() {
        let currentValue = parseInt(matchPointsInput.value, 10);
        if (currentValue > 0) { // Prevent negative values
            matchPointsInput.value = currentValue - 1;
        }
    });
};


export function renderHome() {
    loadLanguage();
    initScripts();
}


export function renderGameSettings() {
    setMatchPoints();
    
}
