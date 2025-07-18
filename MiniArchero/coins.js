// Düşman öldüğünde altın bırak
function spawnCoin(x, y) {
    // Artık gameState üzerinden yönetiliyor.
    gameState.coins.push({
        x: x,
        y: y,
        size: 18,
        collected: false
    });
}

// Altınları çiz
function drawCoins(ctx) {
    for (const coin of gameState.coins) {
        if (coin.collected) continue;
        ctx.save();
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🪙", coin.x, coin.y);
        ctx.restore();
    }
}

// Altın toplama kontrolü
function checkCoins(player) {
    if (!player) return;
    const magnetSpeed = 8; // Mıknatısın çekim hızı

    for (let i = gameState.coins.length - 1; i >= 0; i--) {
        const coin = gameState.coins[i];
        if (coin.collected) { // Güvenlik kontrolü, normalde olmamalı
            gameState.coins.splice(i, 1);
            continue;
        }

        const px = player.x + player.size / 2;
        const py = player.y + player.size / 2;

        if (gameState.magnetActive) {
            const distX = px - coin.x;
            const distY = py - coin.y;
            const dist = Math.sqrt(distX * distX + distY * distY);
            if (dist > 1) { // Çok yakın değilse hareket ettir
                coin.x += (distX / dist) * magnetSpeed;
                coin.y += (distY / dist) * magnetSpeed;
            }
        }

        // Toplama kontrolü
        const collectionDistance = Math.sqrt(Math.pow(px - coin.x, 2) + Math.pow(py - coin.y, 2));
        if (collectionDistance < player.size / 2 + coin.size / 2) {
            gameState.coinCount++;
            playSound('coin');
            if (typeof spawnParticles === "function") spawnParticles(coin.x, coin.y, "#ffd700");
            gameState.coins.splice(i, 1); // Altını kaldır
            
            // Görev sistemine altın toplama bilgisini gönder
            if (window.questSystem) {
                window.questSystem.updateQuestProgress("COLLECT_COINS");
            }
        }
    }
}

// Not: resetCoins fonksiyonu artık gerekli değil.
// Altınlar, main.js'deki resetLevel fonksiyonu içinde
// `gameState.coins.length = 0;` satırı ile sıfırlanmaktadır.
