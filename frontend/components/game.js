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
    const display = document.getElementById('timer-display');
    const initialTime = 2 * 60 + 30; // 2 minutes and 30 seconds in seconds
    startTimer(initialTime, display);

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    document.getElementById('game-container').appendChild(canvas);

    // Configuración básica del juego
    const paddleWidth = 10;
    const paddleHeight = 100;
    const ballSize = 10;
    let leftPaddleY = (canvas.height - paddleHeight) / 2;
    let rightPaddleY = (canvas.height - paddleHeight) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 2;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibuja las palas
        ctx.fillStyle = '#fff';
        ctx.fillRect(10, leftPaddleY, paddleWidth, paddleHeight); // Paleta izquierda
        ctx.fillRect(canvas.width - 20, rightPaddleY, paddleWidth, paddleHeight); // Paleta derecha

        // Dibuja la pelota
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2, false);
        ctx.fill();
    }

    function update() {
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Rebote en los bordes
        if (ballY < 0 || ballY > canvas.height) {
            ballSpeedY = -ballSpeedY;
        }

        // Rebote en las palas
        if (ballX < 20 && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
            ballSpeedX = -ballSpeedX;
        }
        if (ballX > canvas.width - 20 && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
            ballSpeedX = -ballSpeedX;
        }

        // Control de las palas (este ejemplo no incluye control del jugador)
        if (ballX < 0 || ballX > canvas.width) {
            // Aquí podrías añadir la lógica de puntuación y reiniciar la pelota
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
        }
    }

    function gameLoop() {
        draw();
        update();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
};
