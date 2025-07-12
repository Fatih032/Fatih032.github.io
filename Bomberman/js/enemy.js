import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, TILE_TYPE } from './constants.js';
import { map } from './map.js';
import { bombs } from './bomb.js';
import { assets } from './assets.js';

export let enemies = [];

const ENEMY_MOVE_DELAY = 500; // Düşmanın her hareket arasındaki ms cinsinden bekleme süresi

function isEnemyWalkable(x, y) {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
        return false;
    }
    const targetTile = map[y][x];
    const nonWalkableTiles = [
        TILE_TYPE.SOLID_WALL,
        TILE_TYPE.BRICK_WALL,
        TILE_TYPE.BRICK_WITH_DOOR,
        TILE_TYPE.BRICK_WITH_POWERUP_BOMB,
        TILE_TYPE.BRICK_WITH_POWERUP_FLAME,
        TILE_TYPE.BRICK_WITH_POWERUP_KICK,
        TILE_TYPE.BRICK_WITH_POWERUP_BOMB_PASS,
        TILE_TYPE.BRICK_WITH_POWERUP_SPEED,
        TILE_TYPE.BRICK_WITH_POWERUP_PIERCE,
        TILE_TYPE.BRICK_WITH_POWERUP_GHOST
    ];
    if (nonWalkableTiles.includes(targetTile)) {
        return false;
    }
    if (bombs.some(bomb => bomb.gridX === x && bomb.gridY === y)) {
        return false;
    }
    return true;
}

function createEnemy(gridX, gridY) {
    let lastMoveTime = 0;
    let currentDirection = { x: 0, y: 0 };

    return {
        gridX,
        gridY,
        isAlive: true,
        update(currentTime) {
            if (!this.isAlive || currentTime - lastMoveTime < ENEMY_MOVE_DELAY) return;
 
            lastMoveTime = currentTime;
 
            const directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
            const validDirections = directions.filter(dir => isEnemyWalkable(this.gridX + dir.x, this.gridY + dir.y));
 
            const isCurrentDirectionValid = validDirections.some(dir => dir.x === currentDirection.x && dir.y === currentDirection.y);
            const isAtIntersection = validDirections.length > 2;
            const shouldChangeDirection = !isCurrentDirectionValid || (isAtIntersection && Math.random() < 0.5);
 
            if (shouldChangeDirection && validDirections.length > 0) {
                const oppositeDir = { x: -currentDirection.x, y: -currentDirection.y };
                let possibleDirections = validDirections;
                if (validDirections.length > 1 && isCurrentDirectionValid) {
                    possibleDirections = validDirections.filter(dir => dir.x !== oppositeDir.x || dir.y !== oppositeDir.y);
                }
                currentDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            }
            
            const nextX = this.gridX + currentDirection.x;
            const nextY = this.gridY + currentDirection.y;
 
            if (isEnemyWalkable(nextX, nextY)) {
                this.gridX = nextX;
                this.gridY = nextY;
            }
        }
    };
}

export function spawnEnemies(level) {
    enemies.length = 0; // Eski düşmanları temizle
    const enemyCount = 4; // Düşman sayısı 4 olarak sabitlendi
    const emptyTiles = [];

    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === TILE_TYPE.EMPTY && (r > 3 || c > 3)) emptyTiles.push({ r, c });
        }
    }

    for (let i = 0; i < enemyCount && emptyTiles.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * emptyTiles.length);
        const { r, c } = emptyTiles.splice(randomIndex, 1)[0];
        enemies.push(createEnemy(c, r));
    }
}

export function updateEnemies() {
    const currentTime = performance.now();
    enemies.forEach(enemy => enemy.update(currentTime));
}

export function drawEnemies(ctx) {
    enemies.filter(e => e.isAlive).forEach(enemy => {
        ctx.drawImage(assets.enemy, enemy.gridX * TILE_SIZE, enemy.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
}