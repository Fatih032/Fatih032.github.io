import { GRID_WIDTH, GRID_HEIGHT, TILE_SIZE, BACKGROUND_COLOR } from './js/constants.js';
import { drawMap } from './js/map.js';
import { drawPlayer, handleKeyDown } from './js/player.js';
import { drawBombs, updateBombs } from './js/bomb.js';
import { drawExplosions } from './js/explosion.js';
import { updateGame, startNewGame } from './js/game.js';
import { updateEnemies, drawEnemies } from './js/enemy.js';
import { loadAssets } from './js/assets.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = TILE_SIZE * GRID_WIDTH;
canvas.height = TILE_SIZE * GRID_HEIGHT;

function gameLoop() {
    // Arkaplanı temizle ve yeşil renge boya
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMap(ctx);
    drawBombs(ctx);
    drawExplosions(ctx);
    drawEnemies(ctx);
    drawPlayer(ctx);

    updateBombs();
    updateEnemies();
    updateGame(ctx);
}

async function main() {
    try {
        console.log("Varlıklar yükleniyor...");
        await loadAssets();
        console.log("Varlıklar yüklendi. Oyun başlatılıyor.");
        startNewGame();
        setInterval(gameLoop, 1000 / 60);
        window.addEventListener('keydown', handleKeyDown);
    } catch (error) {
        console.error("Oyun başlatılamadı:", error);
    }
}

main();
