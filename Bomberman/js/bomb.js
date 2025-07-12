import { TILE_SIZE, BOMB_TIMER, BOMB_SLIDE_SPEED, GRID_WIDTH, GRID_HEIGHT, TILE_TYPE } from './constants.js';
import { map } from './map.js';
import { detonateBomb } from './explosion.js';
import { assets } from './assets.js';
import { player } from './player.js';

export const bombs = [];

// Oyuncunun aynı anda sadece bir bomba bırakmasını sağlar
export function placeBomb(gridX, gridY) {
    const bombExists = bombs.some(bomb => bomb.gridX === gridX && bomb.gridY === gridY);
    if (bombExists || bombs.length >= player.maxBombs) {
        return;
    }

    const newBomb = {
        gridX: gridX,
        gridY: gridY,
        timerId: setTimeout(() => detonateBomb(newBomb, bombs), BOMB_TIMER),
        isSliding: false,
        slideDirection: { x: 0, y: 0 },
        lastSlideTime: 0
    };
    bombs.push(newBomb);
}

function isBombPathClear(x, y) {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
        return false;
    }
    const targetTile = map[y][x];

    // Bombanın üzerinden kayabileceği karolar
    const slideThruTiles = [
        TILE_TYPE.EMPTY,
        TILE_TYPE.POWERUP_BOMB,
        TILE_TYPE.POWERUP_FLAME,
        TILE_TYPE.POWERUP_KICK,
        TILE_TYPE.POWERUP_BOMB_PASS,
        TILE_TYPE.DOOR
    ];

    // Eğer hedef karo, üzerinden kayılabilir bir karo değilse yolu temiz kabul etme
    if (!slideThruTiles.includes(targetTile)) return false;

    // Başka bir bombanın olduğu yere kayamaz
    if (bombs.some(bomb => bomb.gridX === x && bomb.gridY === y)) {
        return false;
    }
    return true;
}

export function updateBombs() {
    const currentTime = performance.now();
    bombs.forEach(bomb => {
        if (bomb.isSliding) {
            if (currentTime - bomb.lastSlideTime > BOMB_SLIDE_SPEED) {
                const nextX = bomb.gridX + bomb.slideDirection.x;
                const nextY = bomb.gridY + bomb.slideDirection.y;

                if (isBombPathClear(nextX, nextY)) {
                    bomb.gridX = nextX;
                    bomb.gridY = nextY;
                    bomb.lastSlideTime = currentTime;
                } else {
                    bomb.isSliding = false;
                }
            }
        }
    });
}

export function drawBombs(ctx) {
    bombs.forEach(bomb => {
        ctx.drawImage(assets.bomb, bomb.gridX * TILE_SIZE, bomb.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
}