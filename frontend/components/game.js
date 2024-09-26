import 

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const intervalId = setInterval(function () {
        minutes = Math.floor(timer / 60);
        seconds = timer % 60;

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(intervalId); // Stop the timer when it reaches 0
        }
    }, 1000);
}

export function renderGame() {
    
};
