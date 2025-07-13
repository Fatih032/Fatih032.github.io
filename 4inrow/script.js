document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elementleri ---
    const gameBoard = document.getElementById('game-board');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset-button');
    const player1ScoreDisplay = document.getElementById('player1-score');
    const player2ScoreDisplay = document.getElementById('player2-score');
    const player1Label = document.getElementById('player1-label');
    const player2Label = document.getElementById('player2-label');
    const gameModeSelector = document.getElementById('game-mode');
    const difficultyContainer = document.getElementById('difficulty-container');
    const difficultySelector = document.getElementById('difficulty');
    const endGameModal = document.getElementById('end-game-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalPlayAgainButton = document.getElementById('modal-play-again-button');

    // --- Oyun Sabitleri ---
    const ROWS = 6;
    const COLS = 7;
    const HUMAN_PLAYER = 1;
    const AI_PLAYER = 2;

    // --- Oyun Durumu Değişkenleri ---
    let board = [];
    let score;
    let currentPlayer;
    let gameMode;
    let difficultyLevel;
    let gameOver;

    /**
     * Oyunu başlatır veya sıfırlar.
     */
    function startGame() {
        // Mantıksal tahtayı sıfırla (0 = boş)
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        gameMode = gameModeSelector.value;
        difficultyLevel = difficultySelector.value;
        gameOver = false;
        currentPlayer = 1; // Her zaman Oyuncu 1 başlar
        endGameModal.classList.add('hidden'); // Oyuna başlarken modalı gizle

        if (gameMode === 'vs-ai') {
            difficultyContainer.style.display = 'flex';
            player1Label.textContent = 'Siz';
            player2Label.textContent = 'Yapay Zeka';
            statusDisplay.textContent = 'Sıra Sizde';
        } else {
            difficultyContainer.style.display = 'none';
            player1Label.textContent = 'Oyuncu 1';
            player2Label.textContent = 'Oyuncu 2';
            statusDisplay.textContent = 'Sıra Oyuncu 1\'de';
        }

        updateScoreDisplay(); // Etiketler güncellendikten sonra skoru göster
        gameBoard.innerHTML = ''; // Görsel tahtayı temizle
        gameBoard.style.pointerEvents = 'auto'; // İnsan tıklamalarını etkinleştir

        // Görsel tahtayı oluştur
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                gameBoard.appendChild(cell);
            }
        }
    }

    /**
     * İnsan oyuncunun hamlesini yönetir.
     * @param {MouseEvent} event - Tıklama olayı
     */
    async function handleHumanMove(event) {
        if (gameOver || !event.target.classList.contains('cell')) {
            return;
        }
        const col = parseInt(event.target.dataset.col);
        // Hamle yapmadan önce sütunun dolu olup olmadığını kontrol et
        if (board[0][col] !== 0) return;

        await placePiece(col);
    }

    /**
     * Belirtilen sütuna bir pul yerleştirir.
     * @param {number} col - Pulun yerleştirileceği sütun (0-6)
     */
    async function placePiece(col) {
        let rowToPlace = -1;
        // Sütundaki en alttaki boş satırı bul
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][col] === 0) {
                rowToPlace = r;
                break;
            }
        }

        if (rowToPlace === -1) return;

        // Hamle yapılırken başka hamle yapılmasını engelle
        gameBoard.style.pointerEvents = 'none';
        // Mantıksal tahtayı hemen güncelle ki AI tekrar aynı yere oynamasın
        board[rowToPlace][col] = currentPlayer;

        // --- Animasyon Bölümü ---
        const disc = document.createElement('div');
        disc.classList.add('falling-disc', `player${currentPlayer}`);

        // --- Dinamik Animasyon Hesaplamaları ---
        const firstCell = gameBoard.querySelector('.cell');
        if (!firstCell) return; // Tahta boşsa devam etme

        const cellSize = firstCell.offsetWidth;
        const gapSize = parseInt(getComputedStyle(gameBoard).gap);
        const boardPadding = parseInt(getComputedStyle(gameBoard).paddingLeft);
        const cellSlotSize = cellSize + gapSize;

        // Düşen diskin boyutunu ayarla
        disc.style.width = `${cellSize}px`;
        disc.style.height = `${cellSize}px`;

        // Başlangıç pozisyonunu ayarla (tahtanın üstü)
        disc.style.left = `${boardPadding + col * cellSlotSize}px`;
        disc.style.top = `-${cellSlotSize}px`;
        gameBoard.appendChild(disc);

        // Tarayıcının diski boyamasına izin ver, sonra animasyonu başlat
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Son pozisyonu ayarla ve CSS transition'ını tetikle
        const finalTop = boardPadding + rowToPlace * cellSlotSize;
        disc.style.top = `${finalTop}px`;

        // Animasyonun bitmesini bekle
        await new Promise(resolve => {
            disc.addEventListener('transitionend', () => {
                disc.remove(); // Geçici diski kaldır
                const cell = document.querySelector(`.cell[data-row='${rowToPlace}'][data-col='${col}']`);
                cell.classList.add(`player${currentPlayer}`); // Kalıcı hücreyi renklendir
                resolve();
            }, { once: true });
        });

        // --- Oyun Mantığı Bölümü ---
        const winningCells = checkForWin(board);
        if (winningCells) {
            gameOver = true;
            let winnerName;
            if (gameMode === 'vs-ai') {
                winnerName = (currentPlayer === HUMAN_PLAYER) ? 'Siz' : 'Yapay Zeka';
            } else {
                winnerName = `Oyuncu ${currentPlayer}`;
            }
            showEndGameModal(`${winnerName} Kazandı!`);

            // --- SKOR GÜNCELLEME ---
            if (currentPlayer === 1) {
                score.player1++;
            } else {
                score.player2++;
            }
            saveScore();
            updateScoreDisplay();
            // --- BİTİŞ ---

            // Kazanan hücreleri vurgula
            winningCells.forEach(cellCoord => {
                const cellEl = document.querySelector(`.cell[data-row='${cellCoord.r}'][data-col='${cellCoord.c}']`);
                if (cellEl) {
                    cellEl.classList.add('winning-cell');
                }
            });
            return;
        }

        if (board.flat().every(cell => cell !== 0)) {
            gameOver = true;
            showEndGameModal('Oyun Berabere!');
            return;
        }

        // Sırayı diğer oyuncuya geçir
        switchPlayer();
    }

    /**
     * Oyuncuyu değiştirir ve AI'ın sırasıysa hamlesini tetikler.
     */
    function switchPlayer() {
        currentPlayer = (currentPlayer === 1) ? 2 : 1;

        if (gameOver) return;

        // Mod kontrolü
        if (gameMode === 'vs-ai' && currentPlayer === AI_PLAYER) {
            statusDisplay.textContent = 'Yapay Zeka düşünüyor...';
            setTimeout(makeAiMove, 500); // AI'a "düşünme" süresi ver
        } else {
            // Bu blok, "İki Kişilik" modun her turunu ve "vs-ai" modundaki insan turunu yönetir.
            const statusText = (gameMode === 'vs-ai') ? 'Sıra Sizde' : `Sıra Oyuncu ${currentPlayer}'de`;
            statusDisplay.textContent = statusText;
            gameBoard.style.pointerEvents = 'auto';
        }
    }

    /**
     * Yapay zekanın karar mekanizması.
     */
    async function makeAiMove() {
        let bestCol;
        if (difficultyLevel === 'kolay') {
            // Kolay: Sadece rastgele geçerli bir hamle yap
            const validCols = getValidLocations();
            bestCol = validCols[Math.floor(Math.random() * validCols.length)];
        } else if (difficultyLevel === 'orta') {
            // Orta: Kazan, engelle, merkeze oyna stratejisi
            bestCol = findBestMoveMedium();
        } else if (difficultyLevel === 'zor') {
            // Zor: Minimax algoritması ile en iyi hamleyi bul
            const { col } = minimax(board, 5, -Infinity, Infinity, true); // 5 hamle derinliğe bak
            bestCol = col;
        }
        await placePiece(bestCol);
    }

    function findBestMoveMedium() {
        // 1. Kazanma hamlesi var mı?
        for (const c of getValidLocations()) {
            if (isWinningMove(c, AI_PLAYER)) return c;
        }
        // 2. Rakibin kazanma hamlesini engelle
        for (const c of getValidLocations()) {
            if (isWinningMove(c, HUMAN_PLAYER)) return c;
        }
        // 3. Stratejik bir hamle yap (merkeze öncelik ver)
        const strategicOrder = [3, 4, 2, 5, 1, 6, 0];
        for (const c of strategicOrder) {
            if (board[0][c] === 0) return c;
        }
        return getValidLocations()[0]; // Son çare
    }

    function getValidLocations(currentBoard = board) {
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (currentBoard[0][c] === 0) {
                validCols.push(c);
            }
        }
        return validCols;
    }

    // --- Zor Seviye (Minimax) için Yardımcı Fonksiyonlar ---

    function scorePosition(board, piece) {
        let score = 0;
        // Merkez sütun bonusu
        const centerArray = board.map(row => row[Math.floor(COLS / 2)]);
        const centerCount = centerArray.filter(p => p === piece).length;
        score += centerCount * 3;

        // Yatay, Dikey, Çapraz skorlama
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
                score += evaluateWindow(window, piece);
            }
        }
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS - 3; r++) {
                const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
                score += evaluateWindow(window, piece);
            }
        }
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
                score += evaluateWindow(window, piece);
            }
        }
        for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
                score += evaluateWindow(window, piece);
            }
        }
        return score;
    }

    function evaluateWindow(window, piece) {
        let score = 0;
        const oppPiece = (piece === HUMAN_PLAYER) ? AI_PLAYER : HUMAN_PLAYER;
        const pieceCount = window.filter(p => p === piece).length;
        const oppCount = window.filter(p => p === oppPiece).length;
        const emptyCount = window.filter(p => p === 0).length;

        if (pieceCount === 4) score += 1000;
        else if (pieceCount === 3 && emptyCount === 1) score += 10;
        else if (pieceCount === 2 && emptyCount === 2) score += 5;

        if (oppCount === 3 && emptyCount === 1) score -= 80;
        if (oppCount === 4) score -= 10000;

        return score;
    }

    function isTerminalNode(board) {
        return !!checkForWin(board) || getValidLocations(board).length === 0;
    }

    function minimax(currentBoard, depth, alpha, beta, maximizingPlayer) {
        const winningLine = checkForWin(currentBoard);
        const isTerminal = !!winningLine || getValidLocations(currentBoard).length === 0;

        if (depth === 0 || isTerminal) {
            if (isTerminal) {
                if (winningLine) {
                    const winner = currentBoard[winningLine[0].r][winningLine[0].c];
                    // AI kazanırsa yüksek skor, insan kazanırsa düşük skor döndür
                    return { score: winner === AI_PLAYER ? 10000000 + depth : -10000000 - depth };
                } else { // Berabere
                    return { score: 0 };
                }
            } else { // Derinlik 0
                return { score: scorePosition(currentBoard, AI_PLAYER) };
            }
        }

        const validCols = getValidLocations(currentBoard);
        if (maximizingPlayer) {
            let value = -Infinity;
            let column = validCols[0];
            for (const col of validCols) {
                const row = getNextOpenRow(currentBoard, col);
                if (row === undefined) {
                    // Bu durumun yaşanmaması gerekir, ancak bir önlem olarak eklenmiştir.
                    // Geçerli bir sütunun dolu olduğu anlamına gelir, bu yüzden atla.
                    continue;
                }
                let b_copy = currentBoard.map(r => [...r]);
                b_copy[row][col] = AI_PLAYER;
                let new_score = minimax(b_copy, depth - 1, alpha, beta, false).score;
                if (new_score > value) {
                    value = new_score;
                    column = col;
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break;
            }
            return { col: column, score: value };
        } else { // Minimizing player
            let value = Infinity;
            let column = validCols[0];
            for (const col of validCols) {
                const row = getNextOpenRow(currentBoard, col);
                if (row === undefined) {
                    // Bu durumun yaşanmaması gerekir, ancak bir önlem olarak eklenmiştir.
                    // Geçerli bir sütunun dolu olduğu anlamına gelir, bu yüzden atla.
                    continue;
                }
                let b_copy = currentBoard.map(r => [...r]);
                b_copy[row][col] = HUMAN_PLAYER;
                let new_score = minimax(b_copy, depth - 1, alpha, beta, true).score;
                if (new_score < value) {
                    value = new_score;
                    column = col;
                }
                beta = Math.min(beta, value);
                if (alpha >= beta) break;
            }
            return { col: column, score: value };
        }
    }

    function getNextOpenRow(board, col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][col] === 0) return r;
        }
    }
    /**
     * Bir hamlenin kazanıp kazandırmayacağını tahtayı değiştirmeden test eder.
     * @param {number} col - Test edilecek sütun
     * @param {number} player - Test edilecek oyuncu (HUMAN_PLAYER veya AI_PLAYER)
     * @returns {boolean} - Hamle kazandırıyorsa true, aksi halde false
     */
    function isWinningMove(col, player) {
        // Global 'board' durumunu değiştirmek yerine bir kopya üzerinde çalış
        const tempBoard = board.map(r => [...r]);

        let rowToPlace = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (tempBoard[r][col] === 0) { // Kopyayı kontrol et
                rowToPlace = r;
                break;
            }
        }
        if (rowToPlace === -1) return false;

        tempBoard[rowToPlace][col] = player; // Kopyayı değiştir
        return !!checkForWin(tempBoard); // Kopyayı kontrol et
    }

    /**
     * Tahtayı tarayarak kazanan olup olmadığını kontrol eder.
     * @param {Array<Array<number>>} currentBoard - Kontrol edilecek oyun tahtası.
     * @returns {Array<{r: number, c: number}> | null} - Kazanan hücrelerin dizisini veya null döndürür.
     */
    function checkForWin(currentBoard = board) {
        // Yatay kontrol
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const player = currentBoard[r][c];
                if (player !== 0 &&
                    player === currentBoard[r][c + 1] &&
                    player === currentBoard[r][c + 2] &&
                    player === currentBoard[r][c + 3]) {
                    return [{ r, c }, { r, c: c + 1 }, { r, c: c + 2 }, { r, c: c + 3 }];
                }
            }
        }

        // Dikey kontrol
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS - 3; r++) {
                const player = currentBoard[r][c];
                if (player !== 0 &&
                    player === currentBoard[r + 1][c] &&
                    player === currentBoard[r + 2][c] &&
                    player === currentBoard[r + 3][c]) {
                    return [{ r, c }, { r: r + 1, c }, { r: r + 2, c }, { r: r + 3, c }];
                }
            }
        }

        // Pozitif eğimli çapraz kontrol (\)
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const player = currentBoard[r][c];
                if (player !== 0 &&
                    player === currentBoard[r + 1][c + 1] &&
                    player === currentBoard[r + 2][c + 2] &&
                    player === currentBoard[r + 3][c + 3]) {
                    return [{ r, c }, { r: r + 1, c: c + 1 }, { r: r + 2, c: c + 2 }, { r: r + 3, c: c + 3 }];
                }
            }
        }

        // Negatif eğimli çapraz kontrol (/)
        for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const player = currentBoard[r][c];
                if (player !== 0 &&
                    player === currentBoard[r - 1][c + 1] &&
                    player === currentBoard[r - 2][c + 2] &&
                    player === currentBoard[r - 3][c + 3]) {
                    return [{ r, c }, { r: r - 1, c: c + 1 }, { r: r - 2, c: c + 2 }, { r: r - 3, c: c + 3 }];
                }
            }
        }

        return null; // Kazanan yok
    }

    // --- Skor Yönetimi ---
    function initializeScore() {
        const savedScore = sessionStorage.getItem('connect4-score');
        if (savedScore) {
            score = JSON.parse(savedScore);
        } else {
            score = { player1: 0, player2: 0 };
        }
    }

    function updateScoreDisplay() {
        player1ScoreDisplay.textContent = score.player1;
        player2ScoreDisplay.textContent = score.player2;
    }

    function saveScore() {
        sessionStorage.setItem('connect4-score', JSON.stringify(score));
    }

    // --- Modal Yönetimi ---
    function showEndGameModal(message) {
        modalMessage.textContent = message;
        endGameModal.classList.remove('hidden');
        // Oyun durumu metnini temizle veya oyun sonu mesajı göster
        statusDisplay.textContent = 'Oyun Bitti!';
    }

    // --- Olay Dinleyicileri ve Başlangıç ---
    resetButton.addEventListener('click', startGame);
    modalPlayAgainButton.addEventListener('click', startGame);
    gameModeSelector.addEventListener('change', startGame);
    difficultySelector.addEventListener('change', startGame);
    gameBoard.addEventListener('click', handleHumanMove); // Tüm tıklamaları tek bir yerden yönet (Event Delegation)
    initializeScore();
    startGame(); // Oyunu ilk kez başlat
});
