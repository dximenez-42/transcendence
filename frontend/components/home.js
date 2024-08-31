function initScripts() {
    const leftBar = document.getElementById('leftBar');
    const rightBar = document.getElementById('rightBar');
    const playButton = document.getElementById('playButton');

    console.log(playButton);
    console.log("playButton");

    // Agregar la clase de animación al hacer hover en playButton
    playButton.addEventListener('mouseover', () => {
        leftBar.classList.add('animate-left-bar');
        rightBar.classList.add('animate-right-bar');
    });

    // Eliminar la clase de animación cuando el hover termina
    playButton.addEventListener('mouseout', () => {
        leftBar.classList.remove('animate-left-bar');
        rightBar.classList.remove('animate-right-bar');
    });

    playButton.addEventListener('click', () => {
        window.location.hash = '#game_settings'
    });
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
    initScripts();
}


export function renderGameSettings() {
    setMatchPoints();
    
}
