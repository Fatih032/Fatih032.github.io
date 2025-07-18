// Sadece klasik portal tanımı yeterli
const PORTAL_TYPE = { key: 'portal', color: '#00e6ff', name: 'Klasik Portal', desc: 'Karşıya ışınlar' };

// Sadece 1, 2, 5 ve 8. bölümde portal çiz
function drawPortals() {
    if (![1,2,5,8].includes(gameState.level)) return;
    ctx.save();

    // TURKUAZ RENK
    const portalColor = "#00e6ff";
    ctx.strokeStyle = portalColor;
    ctx.fillStyle = portalColor;
    ctx.globalAlpha = 0.25;

    // Portal dikdörtgen boyutları ve konumu (oyun alanı içine)
    const portalWidth = 24;
    const portalHeight = 90;
    const offsetX = 30; // kenardan içeriye mesafe
    const cy = canvas.height / 2 - portalHeight / 2;

    // Sol portal dikdörtgeni
    ctx.fillRect(offsetX, cy, portalWidth, portalHeight);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 5;
    ctx.strokeRect(offsetX, cy, portalWidth, portalHeight);

    // Sağ portal dikdörtgeni
    ctx.globalAlpha = 0.25;
    ctx.fillRect(canvas.width - offsetX - portalWidth, cy, portalWidth, portalHeight);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 5;
    ctx.strokeRect(canvas.width - offsetX - portalWidth, cy, portalWidth, portalHeight);

    ctx.restore();
}

// Sadece 1, 2, 5 ve 8. bölümde klasik portal geçişi uygula
function handlePlayerPortal() {
    if (![1,2,5,8].includes(gameState.level)) return;
    if (gameState.playerPortalCooldown > 0) {
        gameState.playerPortalCooldown--;
        return;
    }
    // Sol portal
    if (
        gameState.player.x < 30 &&
        Math.abs(gameState.player.y + gameState.player.size/2 - canvas.height/2) < 40
    ) {
        gameState.player.x = canvas.width - gameState.player.size - 30;
        gameState.playerPortalCooldown = 30;
        spawnParticles(gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2, PORTAL_TYPE.color);
    }
    // Sağ portal
    else if (
        gameState.player.x + gameState.player.size > canvas.width - 30 &&
        Math.abs(gameState.player.y + gameState.player.size/2 - canvas.height/2) < 40
    ) {
        gameState.player.x = 30;
        gameState.playerPortalCooldown = 30;
        spawnParticles(gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2, PORTAL_TYPE.color);
    }
}

// Düşmanlar için de aynı mantık
function handleSpecialEnemyPortals() {
    if (![1,2,5,8].includes(gameState.level)) return;
    for (const enemy of gameState.enemies) {
        if (enemy.type !== 'portal') continue;
        if (enemy.portalCooldown > 0) {
            enemy.portalCooldown--;
            continue;
        }
        // Sol portal
        if (
            enemy.x < 30 &&
            Math.abs(enemy.y + enemy.size/2 - canvas.height/2) < 40
        ) {
            enemy.x = canvas.width - enemy.size - 30;
            enemy.portalCooldown = 30;
            spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, PORTAL_TYPE.color);
        }
        // Sağ portal
        else if (
            enemy.x + enemy.size > canvas.width - 30 &&
            Math.abs(enemy.y + enemy.size/2 - canvas.height/2) < 40
        ) {
            enemy.x = 30;
            enemy.portalCooldown = 30;
            spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, PORTAL_TYPE.color);
        }
    }
}

// drawPortals(): Portalların görselini çizer.
// handlePlayerPortal(): Oyuncu bir portal bölgesine girerse uygun şekilde ışınlar.
// handleSpecialEnemyPortals(): Düşmanlar için de aynı mantıkla çalışır.
