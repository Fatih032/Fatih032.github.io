import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, TILE_TYPE, PLAYER_MOVE_COOLDOWN_DEFAULT } from './constants.js';
import { map } from './map.js';
import { placeBomb, bombs } from './bomb.js';
import { explosions } from './explosion.js';
import { assets } from './assets.js';

let lastMoveTime = 0;

export const player = {
    gridX: 1,
    gridY: 1,
    isAlive: true,
    maxBombs: 1,
    bombRange: 1, // Varsayılan patlama menzili
    canKick: false, // Bomba tekmeleyebilir mi?
    canPassBombs: false, // Bombaların üzerinden geçebilir mi?
    facingDirection: { x: 0, y: 1 }, // Başlangıçta aşağı bakıyor
    piercePower: 1, // Aynı anda kırabileceği tuğla sayısı
    canGhost: false, // Duvarlardan geçebilir mi?
    moveCooldown: PLAYER_MOVE_COOLDOWN_DEFAULT,
    sprite: 'playerDown' // Başlangıç görseli
};

export function drawPlayer(ctx) {
    if (!player.isAlive) return;
    const pixelX = player.gridX * TILE_SIZE;
    const pixelY = player.gridY * TILE_SIZE;
    ctx.drawImage(assets[player.sprite], pixelX, pixelY, TILE_SIZE, TILE_SIZE);
}

function isWalkable(x, y) {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
        return false;
    }

    const targetTile = map[y][x];

    // Yürünemez karolar (üzerinden geçilemeyenler)
    let nonWalkableTiles = [
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

    if (player.canGhost) {
        // Eğer "hayalet" gücü varsa, sadece katı duvarları yürünemez kabul et.
        nonWalkableTiles = [TILE_TYPE.SOLID_WALL];
    }

    if (nonWalkableTiles.includes(targetTile)) return false;

    // Gidilecek karede patlama var mı?
    if (explosions.some(exp => exp.affectedTiles.some(tile => tile.gridX === x && tile.gridY === y))) return false;

    return true;
}

export function handleKeyDown(e) {
    if (!player.isAlive) return;

    // Tekmeleme Tuşu
    if (e.key === 'v') {
        // Sadece gerçek bir event nesnesi ise preventDefault'u çağır
        if (e.preventDefault) e.preventDefault();
        // Sadece tekmeleme gücü varsa çalışır
        if (player.canKick) {
            const kickTargetX = player.gridX + player.facingDirection.x;
            const kickTargetY = player.gridY + player.facingDirection.y;

            const targetBomb = bombs.find(bomb => bomb.gridX === kickTargetX && bomb.gridY === kickTargetY);

            if (targetBomb && !targetBomb.isSliding) {
                targetBomb.isSliding = true;
                targetBomb.slideDirection.x = player.facingDirection.x;
                targetBomb.slideDirection.y = player.facingDirection.y;
                targetBomb.lastSlideTime = performance.now();
            }
        }
        return; // v tuşu başka bir eylem yapmaz
    }

    // Bomba Bırakma Tuşu
    if (e.key === ' ' || e.code === 'Space') {
        // Sadece gerçek bir event nesnesi ise preventDefault'u çağır
        // Dokunmatik kontrolden gelen simüle edilmiş event'te bu fonksiyon yoktur.
        if (e.preventDefault) e.preventDefault();
        placeBomb(player.gridX, player.gridY);
        return;
    }

    // Hareket Tuşları
    let nextX = player.gridX;
    let nextY = player.gridY;
    const currentTime = performance.now();

    if (currentTime - lastMoveTime < player.moveCooldown) {
        return; // Bekleme süresi dolmadı, hareket etme
    }

    switch (e.key) {
        case 'ArrowUp': player.facingDirection = { x: 0, y: -1 }; player.sprite = 'playerUp'; break;
        case 'ArrowDown': player.facingDirection = { x: 0, y: 1 }; player.sprite = 'playerDown'; break;
        case 'ArrowLeft': player.facingDirection = { x: -1, y: 0 }; player.sprite = 'playerLeft'; break;
        case 'ArrowRight': player.facingDirection = { x: 1, y: 0 }; player.sprite = 'playerRight'; break;
        default: return;
    }

    nextX = player.gridX + player.facingDirection.x;
    nextY = player.gridY + player.facingDirection.y;

    // Oyuncunun bir bombaya doğru dönmesini sağlamak için,
    // hedefte bomba varsa hareketi engelle.
    const targetHasBomb = bombs.some(bomb => bomb.gridX === nextX && bomb.gridY === nextY);

    if (targetHasBomb && !player.canPassBombs) {
        return; // Sadece dön, hareket etme.
    }

    if (isWalkable(nextX, nextY)) {
        player.gridX = nextX;
        player.gridY = nextY;
        lastMoveTime = currentTime;
    }
}