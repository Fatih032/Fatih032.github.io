import { TILE_SIZE, EXPLOSION_DURATION, TILE_TYPE, SCORE_PER_BRICK, SCORE_PER_ENEMY } from './constants.js';
import { map } from './map.js';
import { addScore } from './game.js';
import { enemies } from './enemy.js';
import { assets } from './assets.js';
import { player } from './player.js';

export const explosions = [];

function createExplosion(bomb) {
    const affectedTiles = []; // Patlamadan etkilenen karoları ve kullanılacak görselleri tutar
    const { gridX, gridY } = bomb;

    // Patlamanın merkezini ekle
    affectedTiles.push({ gridX, gridY, sprite: 'explosionCenter' });

    const directions = [
        { x: 0, y: -1, sprite: 'explosionUp' },
        { x: 0, y: 1, sprite: 'explosionDown' },
        { x: -1, y: 0, sprite: 'explosionLeft' },
        { x: 1, y: 0, sprite: 'explosionRight' }
    ];

    directions.forEach(dir => {
        let bricksBroken = 0;
        for (let i = 1; i <= player.bombRange; i++) {
            const nextX = gridX + dir.x * i;
            const nextY = gridY + dir.y * i;
            const tile = map[nextY]?.[nextX];

            if (tile === undefined || tile === TILE_TYPE.SOLID_WALL) {
                break; // Bu yöndeki patlamayı durdur
            }

            // Her zaman yönün kendi spritenı kullan
            affectedTiles.push({ gridX: nextX, gridY: nextY, sprite: dir.sprite });

            const breakableBricks = [
                TILE_TYPE.BRICK_WALL, TILE_TYPE.BRICK_WITH_DOOR,
                TILE_TYPE.BRICK_WITH_POWERUP_BOMB, TILE_TYPE.BRICK_WITH_POWERUP_FLAME,
                TILE_TYPE.BRICK_WITH_POWERUP_KICK,
                TILE_TYPE.BRICK_WITH_POWERUP_BOMB_PASS,
                TILE_TYPE.BRICK_WITH_POWERUP_SPEED,
                TILE_TYPE.BRICK_WITH_POWERUP_PIERCE,
                TILE_TYPE.BRICK_WITH_POWERUP_GHOST
            ];
            const isBreakable = breakableBricks.includes(tile);

            if (isBreakable) {
                let newTile = TILE_TYPE.EMPTY;
                if (tile === TILE_TYPE.BRICK_WITH_DOOR) newTile = TILE_TYPE.DOOR;
                if (tile === TILE_TYPE.BRICK_WITH_POWERUP_BOMB) newTile = TILE_TYPE.POWERUP_BOMB;
                if (tile === TILE_TYPE.BRICK_WITH_POWERUP_FLAME) newTile = TILE_TYPE.POWERUP_FLAME;
                if (tile === TILE_TYPE.BRICK_WITH_POWERUP_KICK) newTile = TILE_TYPE.POWERUP_KICK;
                if (tile === TILE_TYPE.BRICK_WITH_POWERUP_BOMB_PASS) newTile = TILE_TYPE.POWERUP_BOMB_PASS;
                if (tile === TILE_TYPE.BRICK_WITH_POWERUP_SPEED) newTile = TILE_TYPE.POWERUP_SPEED;
                if (tile === TILE_TYPE.BRICK_WITH_POWERUP_PIERCE) newTile = TILE_TYPE.POWERUP_PIERCE;
                if (tile === TILE_TYPE.BRICK_WITH_POWERUP_GHOST) newTile = TILE_TYPE.POWERUP_GHOST;
                
                map[nextY][nextX] = newTile;
                addScore(SCORE_PER_BRICK);
                bricksBroken++;
                if (bricksBroken >= player.piercePower) {
                    break; // Patlama bu yönde daha fazla ilerlemez
                }
            }
        }
    });

    affectedTiles.forEach(tile => {
        enemies.forEach(enemy => {
            if (enemy.isAlive && enemy.gridX === tile.gridX && enemy.gridY === tile.gridY) {
                enemy.isAlive = false;
                addScore(SCORE_PER_ENEMY);
            }
        });
    });

    const explosion = {
        affectedTiles,
        timerId: setTimeout(() => {
            explosions.splice(explosions.indexOf(explosion), 1);
        }, EXPLOSION_DURATION)
    };
    explosions.push(explosion);
}

export function detonateBomb(bomb, bombs) {
    const bombIndex = bombs.indexOf(bomb);
    if (bombIndex > -1) bombs.splice(bombIndex, 1);
    createExplosion(bomb);
}

export function drawExplosions(ctx) {
    explosions.forEach(exp => {
        exp.affectedTiles.forEach(tile => {
            if (assets[tile.sprite]) {
                ctx.drawImage(assets[tile.sprite], tile.gridX * TILE_SIZE, tile.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        });
    });
}