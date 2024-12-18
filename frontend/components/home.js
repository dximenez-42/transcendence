import { loadLanguage } from "../api/languages.js";
import { selectMode } from "../game/main.js";


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
        window.location.hash = '#online'
    });
    
    const username = sessionStorage.getItem('name');;

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

export function hideNav()
{
    const nav = document.getElementById("navigator");

    nav.classList.add("d-none");
}

export function showNav()
{
    const nav = document.getElementById("navigator");

    nav.classList.remove("d-none");
}

export function renderHome() {
    loadLanguage();
    initScripts();
    selectMode();
}


export function renderonline() {
    setMatchPoints();
    
}
