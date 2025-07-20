let seconds = 0;
let mins = 0;
let tens = 0;
let getSeconds = document.querySelector('.seconds');
let getTens = document.querySelector('.tens');
let getMins = document.querySelector('.mins');
let btnStart = document.querySelector('.btn-start');
let btnStop = document.querySelector('.btn-stop');
let btnReset = document.querySelector('.btn-reset');
let interval;

btnStart.addEventListener('click', () => {
    clearInterval(interval);
    interval = setInterval(startTimer, 10);
})
btnStop.addEventListener('click', () => {
    clearInterval(interval);
})
btnReset.addEventListener('click', () => {
    clearInterval(interval);
    tens = 0;
    seconds = 0;
    mins = 0;
    updateDisplay();
})

// Ekranı güncelleyen fonksiyon
function updateDisplay() {
    getTens.innerHTML = tens < 10 ? '0' + tens : tens;
    getSeconds.innerHTML = seconds < 10 ? '0' + seconds : seconds;
    getMins.innerHTML = mins < 10 ? '0' + mins : mins;
}

function startTimer() {
    tens++;
    
    if (tens > 99) {
        seconds++;
        tens = 0;
    }
    
    if (seconds > 59) {
        mins++;
        seconds = 0;
    }
    
    updateDisplay();
}