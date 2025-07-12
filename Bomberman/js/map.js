import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, TILE_TYPE } from './constants.js';
import { assets } from './assets.js';

// Harita verisi
const initialMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
    [1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1],
    [1, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
export let map = [];

export function resetMap() {
    // Haritayı başlangıç durumuna sıfırlamak için derin bir kopya oluştur
    map = JSON.parse(JSON.stringify(initialMap));
}

const tileToAssetMap = {
    [TILE_TYPE.SOLID_WALL]: 'solidWall',
    [TILE_TYPE.BRICK_WALL]: 'brickWall',
    [TILE_TYPE.BRICK_WITH_DOOR]: 'brickWall',
    [TILE_TYPE.BRICK_WITH_POWERUP_BOMB]: 'brickWall',
    [TILE_TYPE.BRICK_WITH_POWERUP_FLAME]: 'brickWall',
    [TILE_TYPE.BRICK_WITH_POWERUP_KICK]: 'brickWall',
    [TILE_TYPE.BRICK_WITH_POWERUP_BOMB_PASS]: 'brickWall',
    [TILE_TYPE.BRICK_WITH_POWERUP_SPEED]: 'brickWall',
    [TILE_TYPE.BRICK_WITH_POWERUP_PIERCE]: 'brickWall',
    [TILE_TYPE.BRICK_WITH_POWERUP_GHOST]: 'brickWall',
    [TILE_TYPE.DOOR]: 'door',
    [TILE_TYPE.POWERUP_BOMB]: 'powerupBomb',
    [TILE_TYPE.POWERUP_FLAME]: 'powerupFlame',
    [TILE_TYPE.POWERUP_KICK]: 'powerupKick',
    [TILE_TYPE.POWERUP_BOMB_PASS]: 'powerupBombPass',
    [TILE_TYPE.POWERUP_SPEED]: 'powerupSpeed',
    [TILE_TYPE.POWERUP_PIERCE]: 'powerupPierce',
    [TILE_TYPE.POWERUP_GHOST]: 'powerupGhost',
};

export function drawMap(ctx) {
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const tileType = map[row][col];
            const assetName = tileToAssetMap[tileType];

            if (assetName) {
                ctx.drawImage(assets[assetName], col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}