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
        if (currentValue > 0) { // Prevent negative values
            matchPointsInput.value = currentValue - 1;
        }
    });
};
