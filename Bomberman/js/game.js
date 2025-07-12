import { player } from './player.js';
import { explosions } from './explosion.js';
import { INITIAL_TIME, TILE_TYPE, SCORE_PER_SECOND, PLAYER_MOVE_COOLDOWN_DEFAULT, PLAYER_MOVE_COOLDOWN_FAST } from './constants.js';
import { map, resetMap } from './map.js';
import { enemies, spawnEnemies } from './enemy.js';

// UI Elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const timerEl = document.getElementById('timer');
const levelEl = document.getElementById('level');

let score = 0;
let time = INITIAL_TIME;
let timerInterval = null;
let levelComplete = false;
let level = 1;

function updateScore(newScore) {
    score = newScore;
    scoreEl.textContent = score;
}

export function addScore(amount) {
    updateScore(score + amount);
}

function updateTimer() {
    if (levelComplete) return; // Seviye tamamlandığında sayacı durdur
    time--;
    timerEl.textContent = time;
    if (time <= 0) {
        player.isAlive = false;
    }
}

function stopGame() {
    clearInterval(timerInterval);
    const highScore = localStorage.getItem('bombermanHighScore') || 0;
    if (score > highScore) {
        localStorage.setItem('bombermanHighScore', score);
        highScoreEl.textContent = score;
    }
}

function checkPlayerDeath() {
    const playerIsOnExplosion = explosions.some(exp =>
        exp.affectedTiles.some(tile => tile.gridX === player.gridX && tile.gridY === player.gridY)
    );
 
    if (playerIsOnExplosion) {
        player.isAlive = false;
    }

    // Düşmanla çarpışma kontrolü
    const playerIsOnEnemy = enemies.some(enemy =>
        enemy.isAlive && enemy.gridX === player.gridX && enemy.gridY === player.gridY
    );

    if (playerIsOnEnemy) {
        player.isAlive = false;
    }
}
 
function placeDoor() {
    // --- TEST İÇİN ---
    // Kapıyı her zaman (3, 1) konumundaki tuğlanın altına yerleştir.
    // Not: Harita koordinatları [satır][sütun] şeklindedir.
    map[3][1] = TILE_TYPE.BRICK_WITH_DOOR;
}

function placePowerups() {
    // --- TEST İÇİN ---
    // Bomba güçlendirmesini (1, 3) konumundaki tuğlanın altına yerleştir.
    map[1][3] = TILE_TYPE.BRICK_WITH_POWERUP_BOMB;

    // Alev güçlendirmesini (3, 2) konumundaki tuğlanın altına yerleştir.
    map[3][2] = TILE_TYPE.BRICK_WITH_POWERUP_FLAME;

    // Tekmeleme güçlendirmesini (1, 4) konumundaki tuğlanın altına yerleştir.
    map[1][4] = TILE_TYPE.BRICK_WITH_POWERUP_KICK;

    // Bomba üzerinden geçme güçlendirmesini (2, 3) konumundaki tuğlanın altına yerleştir.
    map[2][3] = TILE_TYPE.BRICK_WITH_POWERUP_BOMB_PASS;

    // Hız güçlendirmesini (3, 3) konumundaki tuğlanın altına yerleştir.
    map[3][3] = TILE_TYPE.BRICK_WITH_POWERUP_SPEED;

    // Delici bomba güçlendirmesini (4, 1) konumundaki tuğlanın altına yerleştir.
    map[4][1] = TILE_TYPE.BRICK_WITH_POWERUP_PIERCE;

    // Hayalet güçlendirmesini, kalıcı duvarın üzerinden alıp yakındaki bir tuğlaya taşıyalım.
    map[3][4] = TILE_TYPE.BRICK_WITH_POWERUP_GHOST;
}

function checkPowerupCollection() {
    const playerTile = map[player.gridY][player.gridX];
    if (playerTile === TILE_TYPE.POWERUP_BOMB) {
        player.maxBombs++;
        map[player.gridY][player.gridX] = TILE_TYPE.EMPTY; // Güçlendirmeyi haritadan kaldır
    } else if (playerTile === TILE_TYPE.POWERUP_FLAME) {
        player.bombRange++;
        map[player.gridY][player.gridX] = TILE_TYPE.EMPTY; // Güçlendirmeyi haritadan kaldır
    } else if (playerTile === TILE_TYPE.POWERUP_KICK) {
        player.canKick = true;
        map[player.gridY][player.gridX] = TILE_TYPE.EMPTY; // Güçlendirmeyi haritadan kaldır
    } else if (playerTile === TILE_TYPE.POWERUP_BOMB_PASS) {
        player.canPassBombs = true;
        map[player.gridY][player.gridX] = TILE_TYPE.EMPTY; // Güçlendirmeyi haritadan kaldır
    } else if (playerTile === TILE_TYPE.POWERUP_SPEED) {
        player.moveCooldown = PLAYER_MOVE_COOLDOWN_FAST;
        map[player.gridY][player.gridX] = TILE_TYPE.EMPTY; // Güçlendirmeyi haritadan kaldır
    } else if (playerTile === TILE_TYPE.POWERUP_PIERCE) {
        player.piercePower = 2;
        map[player.gridY][player.gridX] = TILE_TYPE.EMPTY; // Güçlendirmeyi haritadan kaldır
    } else if (playerTile === TILE_TYPE.POWERUP_GHOST) {
        player.canGhost = true;
        map[player.gridY][player.gridX] = TILE_TYPE.EMPTY; // Güçlendirmeyi haritadan kaldır
    }
}

function checkLevelComplete() {
    if (levelComplete) return;

    const playerIsOnDoor = map[player.gridY][player.gridX] === TILE_TYPE.DOOR;
    // Kapının çalışması için tüm düşmanların yenilmiş olması gerekir
    const allEnemiesDefeated = enemies.every(enemy => !enemy.isAlive);

    if (playerIsOnDoor && allEnemiesDefeated) {
        clearInterval(timerInterval); // Zamanlayıcıyı hemen durdur
        levelComplete = true;
        addScore(time * SCORE_PER_SECOND); // Kalan süreyi skora ekle
        level++; // Seviyeyi artır
        // Bir sonraki seviyeyi kısa bir gecikmeyle başlat
        setTimeout(initGame, 2000);
    }
}

function drawGameOver(ctx) {
    if (player.isAlive) return;
 
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
 
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2);
}
 
export function updateGame(ctx) {
    if (player.isAlive) {
        checkPlayerDeath();
        checkPowerupCollection();
        checkLevelComplete();
    } else {
        stopGame();
    }
    drawGameOver(ctx);
}

function initGame() {
    resetMap();
    placeDoor();
    placePowerups();
    spawnEnemies(level);

    player.isAlive = true;
    player.gridX = 1;
    player.gridY = 1;
    player.maxBombs = 1; // Her seviye başında bomba limitini sıfırla
    player.bombRange = 1; // Her seviye başında menzili sıfırla
    player.canKick = false; // Her seviye başında tekmeleme yeteneğini sıfırla
    player.canPassBombs = false; // Her seviye başında bu yeteneği sıfırla
    player.piercePower = 1; // Her seviye başında delici gücü sıfırla
    player.canGhost = false; // Her seviye başında hayalet gücünü sıfırla
    player.moveCooldown = PLAYER_MOVE_COOLDOWN_DEFAULT; // Her seviye başında hızı sıfırla
    levelComplete = false;
    levelEl.textContent = level;

    time = INITIAL_TIME;
    timerEl.textContent = time;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

export function startNewGame() {
    level = 1;
    updateScore(0);
    const highScore = localStorage.getItem('bombermanHighScore') || 0;
    highScoreEl.textContent = highScore;
    initGame();
}