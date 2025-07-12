const assetSources = {
    playerDown: './assets/player-down.png',
    playerUp: './assets/player-up.png',
    playerLeft: './assets/player-left.png',
    playerRight: './assets/player-right.png',
    solidWall: './assets/solid-wall.png',
    brickWall: './assets/brick-wall.png',
    bomb: './assets/bomb.png',
    door: './assets/door.png',
    enemy: './assets/enemy.png',
    powerupBomb: './assets/powerup-bomb.png',
    powerupFlame: './assets/powerup-flame.png',
    powerupKick: './assets/powerup-kick.png',
    powerupBombPass: './assets/powerup-bomb-pass.png',
    powerupPierce: './assets/powerup-pierce.png',
    powerupGhost: './assets/powerup-ghost.png',
    powerupSpeed: './assets/powerup-speed.png',
    explosionCenter: './assets/explosion-center.png',
    explosionUp: './assets/explosion-up.png',
    explosionDown: './assets/explosion-down.png',
    explosionLeft: './assets/explosion-left.png',
    explosionRight: './assets/explosion-right.png'
};

export const assets = {};

export function loadAssets() {
    const promises = Object.entries(assetSources).map(([name, src]) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                assets[name] = img;
                resolve();
            };
            img.onerror = (err) => {
                console.error(`Failed to load asset: ${name} from ${src}`);
                reject(err);
            };
        });
    });

    return Promise.all(promises);
}