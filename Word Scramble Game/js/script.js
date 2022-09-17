const wordText = document.querySelector(".word"),
hintText = document.querySelector(".hint span"),
timeText = document.querySelector(".time b"),
inputField = document.querySelector("input"),
refreshBtn = document.querySelector(".refresh-word"),
checkBtn = document.querySelector(".check-word");

let correctWord, timer;

const initTimer = maxTime => {
    clearInterval(timer);
    timer = setInterval(() => {
        if(maxTime > 0) {
            maxTime--;
            return timeText.innerText = maxTime;
        }
        alert(`Süre bitti! ${correctWord.toUpperCase()} doğru kelimeydi.`);
        initGame();
    }, 1000);
}

const initGame = () => {
    initTimer(30);
    let randomObj = words[Math.floor(Math.random() * words.length)];
    let wordArray = randomObj.word.split("");
    for (let i = wordArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    wordText.innerText = wordArray.join("");
    hintText.innerText = randomObj.hint;
    correctWord = randomObj.word.toLowerCase();;
    inputField.value = "";
    inputField.setAttribute("maxlength", correctWord.length);
}
initGame();

const checkWord = () => {
    let userWord = inputField.value.toLowerCase();
    if(!userWord) return alert("Lütfen kelimeyi kontrol edin!");
    if(userWord !== correctWord) return alert(`Oops! ${userWord} kelimesi doğru değil!`);
    alert(`Tebrikler! ${correctWord.toUpperCase()} kelimesi doğru!`);
    initGame();
}

refreshBtn.addEventListener("click", initGame);
checkBtn.addEventListener("click", checkWord);

/* enter tuşuna basıldığında checkWord fonksiyonu çalışsın */
inputField.addEventListener("keyup", e => {
    if(e.keyCode === 13) checkWord();
});