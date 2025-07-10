function runApp() {
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const highScoreDisplay = document.getElementById('high-score');
    const selectionInfoDisplay = document.getElementById('selection-info');
    const undoButton = document.getElementById('undo-button');
    const restartButton = document.getElementById('restart-button');
    const mainRestartButton = document.getElementById('restart-button-main');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');

    // Zorluk seviyeleri için ayarlar
    const DIFFICULTY_SETTINGS = {
        easy: { rows: 7, cols: 6 },   // Kolay: En büyük alan
        medium: { rows: 6, cols: 5 },
        hard: { rows: 5, cols: 4 }    // Zor: En küçük alan
    };
    let currentDifficulty = 'medium'; // Varsayılan zorluk
    let COLS = DIFFICULTY_SETTINGS[currentDifficulty].cols;
    let ROWS = DIFFICULTY_SETTINGS[currentDifficulty].rows;

    const INITIAL_TILES = [2, 4, 8, 16, 32, 64, 128];

    const HIGH_SCORE_KEY = 'sayi-birlestirme-en-yuksek-skor';
    let board = [];
    let score = 0;
    let isProcessing = false;
    let history = [];
    let cellSize = 80; // Varsayılan hücre boyutu, dinamik olarak ayarlanacak
    let highScore = 0;
    let isDragging = false;
    let selectionPath = [];
    let startValue = 0;

    // Yardımcı fonksiyon: Bir sayıyı en yakın alt 2'nin kuvvetine yuvarlar
    const floorToPowerOfTwo = (n) => n <= 0 ? 0 : Math.pow(2, Math.floor(Math.log2(n)));

    function init() {
        // Seçilen zorluğa göre satır/sütun sayılarını ayarla
        const settings = DIFFICULTY_SETTINGS[currentDifficulty];
        ROWS = settings.rows;
        COLS = settings.cols;

        score = 0;
        scoreDisplay.textContent = score;
        isProcessing = false;
        gameOverScreen.classList.add('hidden');
        selectionInfoDisplay.textContent = '';
        gameBoard.innerHTML = '';
        history = [];
        updateUndoButtonState();

        // En yüksek skoru localStorage'dan yükle
        const storedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
        highScore = storedHighScore ? parseInt(storedHighScore, 10) : 0;
        highScoreDisplay.textContent = highScore;

        // Tahtayı oluştur ve rastgele sayılarla doldur
        board = Array(ROWS).fill(null).map(() =>
            Array(COLS).fill(0).map(() => INITIAL_TILES[Math.floor(Math.random() * INITIAL_TILES.length)])
        );

        // DOM elementlerini oluştur
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                // Fare olay dinleyicileri
                cell.addEventListener('mousedown', () => handleMouseDown(r, c));
                cell.addEventListener('mouseover', () => handleMouseOver(r, c));
                gameBoard.appendChild(cell);
            }
        }
        // Dokunmatik olay dinleyicileri (mobil uyumluluk için)
        gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
        gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchEnd);

        // Fare bırakma olayı
        document.addEventListener('mouseup', handleMouseUp);

        resizeGame(); // Oyunu ilk defa boyutlandır ve çiz
        updateBoardDOM(); // OYUN BAŞLANGICINDA SAYILARI GÖSTERMEK İÇİN EKLENDİ
        if (isGameOver()) {
            gameOver();
        }
    }

    function handleMouseDown(r, c) {
        if (isProcessing || board[r][c] === 0) return;

        isDragging = true;
        startValue = board[r][c];
        selectionPath = [{ r, c }];

        const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
        cell.classList.add('selected');

        // Anlık toplamı göster
        const result = floorToPowerOfTwo(startValue);
        selectionInfoDisplay.textContent = `→ ${result}`;
    }

    function handleMouseOver(r, c) {
        if (!isDragging) return;

        const currentTile = { r, c };
        const lastTileInPath = selectionPath[selectionPath.length - 1];

        // Kutucuğun yolda olup olmadığını kontrol et
        const isAlreadyInPath = selectionPath.some(p => p.r === r && p.c === c);

        // Geri izleme: Fareyi yoldaki bir önceki kutucuğa getirirsen, sonuncuyu sil
        if (selectionPath.length > 1) {
            const secondToLastTile = selectionPath[selectionPath.length - 2];
            if (currentTile.r === secondToLastTile.r && currentTile.c === secondToLastTile.c) {
                const tileToRemove = selectionPath.pop();
                const cellToRemove = document.querySelector(`.cell[data-row='${tileToRemove.r}'][data-col='${tileToRemove.c}']`);
                cellToRemove.classList.remove('selected');
                // Anlık toplamı geri alırken de güncelle
                const newSum = selectionPath.reduce((s, p) => s + board[p.r][p.c], 0);
                selectionInfoDisplay.textContent = `→ ${floorToPowerOfTwo(newSum)}`;
                return;
            }
        }

        // --- YENİ ZİNCİRLEME KONTROL MANTIĞI (Daha Sezgisel) ---
        const hoveredTileValue = board[r][c];
        const lastTileValue = board[lastTileInPath.r][lastTileInPath.c];

        // 1. Kural: Üzerine gelinen kutucuk, yoldaki son kutucukla aynı değere sahip mi?
        const isSameAsLast = hoveredTileValue === lastTileValue;

        // 2. Kural: "Seviye atlama" (Level Up) hamlesi mi?
        const pathSum = selectionPath.reduce((s, p) => s + board[p.r][p.c], 0);
        const nextTier = floorToPowerOfTwo(pathSum);
        const isLevelUp = hoveredTileValue === nextTier;

        // Geçerli bir sonraki adım değilse (zaten yolda, komşu değil, veya iki kurala da uymuyorsa) işlemi durdur
        if (isAlreadyInPath || !areAdjacent(currentTile, lastTileInPath) || !(isSameAsLast || isLevelUp)) {
            return;
        }

        selectionPath.push(currentTile);
        const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
        cell.classList.add('selected');

        // Anlık toplamı güncelle
        const newSum = pathSum + hoveredTileValue;
        selectionInfoDisplay.textContent = `→ ${floorToPowerOfTwo(newSum)}`;
    }

    async function handleMouseUp() {
        if (!isDragging) return;
        isDragging = false;

        const selectedCells = document.querySelectorAll('.cell.selected');
        selectionInfoDisplay.textContent = ''; // Göstergeyi temizle

        // Eğer 2'den az kutucuk seçildiyse işlemi iptal et
        if (selectionPath.length < 2) {
            selectedCells.forEach(cell => cell.classList.remove('selected'));
            selectionPath = [];
            return;
        }

        // Hamle yapmadan önce mevcut durumu kaydet
        const boardCopy = board.map(row => [...row]);
        history.push({ board: boardCopy, score: score });
        updateUndoButtonState();

        // Yeni birleştirme mantığı
        // Gerçek yolu topla
        const sum = selectionPath.reduce((s, p) => s + board[p.r][p.c], 0);
        const newValue = floorToPowerOfTwo(sum);

        isProcessing = true;

        score += newValue;
        scoreDisplay.textContent = score;

        // Yeni en yüksek skor kontrolü
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem(HIGH_SCORE_KEY, highScore);
            // Animasyonla belirt
            highScoreDisplay.parentElement.classList.add('new-high-score');
            setTimeout(() => highScoreDisplay.parentElement.classList.remove('new-high-score'), 600);
        }

        const lastTile = selectionPath[selectionPath.length - 1];

        // Yoldaki tüm kutucukları temizle, sonuncuya yeni değeri ata
        for (const tile of selectionPath) {
            if (tile.r === lastTile.r && tile.c === lastTile.c) {
                board[tile.r][tile.c] = newValue;
            } else {
                board[tile.r][tile.c] = 0;
            }
        }

        // Seçim stillerini temizle ve DOM'u güncelle
        selectedCells.forEach(cell => cell.classList.remove('selected'));
        updateBoardDOM();

        // Birleşen kutucuğu anime et
        const mergedCell = document.querySelector(`.cell[data-row='${lastTile.r}'][data-col='${lastTile.c}']`);
        mergedCell.classList.add('merged');
        await sleep(300);
        mergedCell.classList.remove('merged');

        // Yerçekimi ve doldurma işlemleri
        await applyGravity();
        await refillBoard();

        if (isGameOver()) gameOver();
        
        isProcessing = false;
        selectionPath = [];
    }

    // --- Mobil Uyumluluk için Dokunmatik Fonksiyonlar ---

    function handleTouchStart(e) {
        if (isProcessing) return;
        e.preventDefault(); // Sayfanın kaymasını engelle

        const touch = e.touches[0];
        const targetCell = document.elementFromPoint(touch.clientX, touch.clientY);

        if (targetCell && targetCell.classList.contains('cell')) {
            const r = parseInt(targetCell.dataset.row, 10);
            const c = parseInt(targetCell.dataset.col, 10);
            handleMouseDown(r, c);
        }
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        const targetCell = document.elementFromPoint(touch.clientX, touch.clientY);

        if (targetCell && targetCell.classList.contains('cell')) {
            const r = parseInt(targetCell.dataset.row, 10);
            const c = parseInt(targetCell.dataset.col, 10);
            handleMouseOver(r, c);
        }
    }

    function handleTouchEnd(e) {
        // Eğer hala bir dokunma varsa (çoklu dokunma senaryosu), işlemi bitirme
        if (e.touches.length > 0) return;

        // handleMouseUp zaten isDragging kontrolü yapıyor
        handleMouseUp();
    }


    // --- Diğer Yardımcı Fonksiyonlar ---

    function handleUndo() {
        if (history.length === 0 || isProcessing) return;

        const lastState = history.pop();
        board = lastState.board;
        score = lastState.score;

        scoreDisplay.textContent = score;
        updateBoardDOM();
        updateUndoButtonState();
    }

    function updateUndoButtonState() {
        undoButton.disabled = history.length === 0;
    }

    function areAdjacent(tile1, tile2) {
        const dr = Math.abs(tile1.r - tile2.r);
        const dc = Math.abs(tile1.c - tile2.c);
        // Çapraz dahil komşu olmalı ve aynı kutucuk olmamalı
        return dr <= 1 && dc <= 1 && (dr + dc > 0);
    }

    async function applyGravity() {
        for (let c = 0; c < COLS; c++) {
            let emptyRow = ROWS - 1;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (board[r][c] !== 0) {
                    // Değerleri değiştirerek aşağı taşı
                    [board[emptyRow][c], board[r][c]] = [board[r][c], board[emptyRow][c]];
                    emptyRow--;
                }
            }
        }
        updateBoardDOM();
        await sleep(200);
    }

    async function refillBoard() {
        let changed = false;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c] === 0) {
                    changed = true;
                    board[r][c] = INITIAL_TILES[Math.floor(Math.random() * INITIAL_TILES.length)];
                }
            }
        }
        if(changed) {
            updateBoardDOM();
            await sleep(200);
        }
    }

    function updateBoardDOM() {
        // Hücrelerin içini ve sınıflarını güncelle
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
                const value = board[r][c];
                cell.textContent = value === 0 ? '' : value;
                
                // Sınıfları dinamik olarak ayarla
                let classList = 'cell';
                if (value !== 0) {
                    classList += ` tile tile-${value}`;
                }
                cell.className = classList;
            }
        }
    }

    function resizeGame() {
        const gameInfoWidth = document.querySelector('.game-info').offsetWidth;
        const screenWidth = Math.min(window.innerWidth - 20, gameInfoWidth); // Ekran genişliği veya info alanı genişliği
        const gapSize = 10;

        // Hücre boyutunu hesapla
        cellSize = (screenWidth - gapSize * (COLS + 1)) / COLS;

        // Oyun tahtasının grid yapısını ayarla
        gameBoard.style.gridTemplateColumns = `repeat(${COLS}, ${cellSize}px)`;
        gameBoard.style.gridTemplateRows = `repeat(${ROWS}, ${cellSize}px)`;
        gameBoard.style.gap = `${gapSize}px`;
        gameBoard.style.borderWidth = `${gapSize}px`;

        // Her bir hücrenin boyutunu ve font boyutunu ayarla
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${cellSize * 0.4}px`; // Font boyutunu hücre boyutuna oranla
        });
    }

    function isGameOver() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const value = board[r][c];
                if (value === 0) return false; // Boş hücre varsa oyun bitmemiştir.

                // Çaprazlar dahil 8 komşuyu da kontrol et
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue; // Kendisini atla

                        const nr = r + dr;
                        const nc = c + dc;

                        // Komşu tahta sınırları içindeyse ve değeri aynıysa, hamle var demektir.
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === value) {
                            return false;
                        }
                    }
                }
            }
        }
        // Hiçbir birleştirilebilir komşu bulunamadı.
        return true;
    }

    function gameOver() {
        isProcessing = true;
        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- Olay Dinleyicileri ---

    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentDifficulty = button.dataset.difficulty;
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            init(); // Yeni ayarlarla oyunu yeniden başlat
        });
    });

    restartButton.addEventListener('click', init);
    undoButton.addEventListener('click', handleUndo);
    mainRestartButton.addEventListener('click', init);
    window.addEventListener('resize', resizeGame);

    // Oyunu başlat
    init();
}

if (window.cordova) {
    document.addEventListener('deviceready', runApp, false);
} else {
    document.addEventListener('DOMContentLoaded', runApp, false);
}

// Sayı büyüdükçe font boyutunu küçülten stil kuralını dinamik olarak ekle
// Bu kısım hala geçerli, çünkü çok büyük sayılar için özel font boyutu ayarlar.
const styleSheet = document.createElement("style");
let styles = "";
for (let i = 7; i <= 14; i++) { // 128'den 16384'e kadar
    const powerOf2 = Math.pow(2, i);
    let fontSize = 32 - (i - 6) * 4;
    styles += `.tile-${powerOf2} { font-size: ${fontSize}px; }\n`;
}
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);