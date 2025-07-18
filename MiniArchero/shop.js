// Mağaza ürünlerini bir veri yapısında saklamak daha yönetilebilir olur.
const shopItems = [
    {
        name: "Can Satın Al",
        cost: 50,
        description: "Maksimum 5 cana kadar 1 can ekler.",
        key: "1",
        purchase: () => {
            if (gameState.coinCount >= 50 && gameState.lives < gameState.maxLives) {
                gameState.coinCount -= 50;
                gameState.lives++;
                return true; // Satın alma başarılı
            }
            return false; // Satın alma başarısız
        }
    },
    {
        name: "Geçici Hızlanma",
        cost: 5,
        description: "5 saniyeliğine hızını arttırır.",
        key: "2",
        purchase: () => {
            if (gameState.coinCount >= 5) {
                gameState.coinCount -= 5;
                gameState.speedBoostActive = true;
                gameState.speedBoostTimer = 300; // 5 saniye (60 FPS)
                return true;
            }
            return false;
        }
    },
    {
        name: "Geçici Kalkan",
        cost: 25,
        description: "10 saniyeliğine hasar almazsın.",
        key: "3",
        purchase: () => {
            if (gameState.coinCount >= 25 && !gameState.shieldInvincible) {
                gameState.coinCount -= 25;
                gameState.shieldInvincible = true;
                gameState.shieldInvincibleTimer = 600; // 10 saniye (60 FPS)
                // Görsel efekt için parçacık oluştur
                spawnParticles(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2, '#00e6ff');
                return true;
            }
            return false;
        } 
    },
    {
        name: "Ekstra Can Haznesi",
        cost: 150,
        description: "Maksimum can sayını kalıcı olarak 1 artırır.",
        key: "5",
        purchase: () => {
            // Henüz satın alınmadıysa ve yeterli altın varsa
            if (!gameState.maxHealthUpgraded && gameState.coinCount >= 150) {
                gameState.coinCount -= 150;
                gameState.maxHealthUpgraded = true; // Yükseltme yapıldı olarak işaretle
                gameState.maxLives++; // Maksimum canı artır
                gameState.lives = gameState.maxLives; // Canı tamamen doldur
                playSound('levelUp');
                return true;
            }
            return false;
        }
    },
    {
        name: "Mıknatıs",
        cost: 30,
        description: "10 saniyeliğine tüm altınları kendine çeker.",
        key: "4",
        purchase: () => {
            if (gameState.coinCount >= 30 && !gameState.magnetActive) {
                gameState.coinCount -= 30;
                gameState.magnetActive = true;
                gameState.magnetTimer = 600; // 10 saniye (60 FPS)
                playSound('levelUp'); // Güçlenme sesi
                return true;
            }
            return false;
        }
    },
    {
        name: "Çeviklik Eğitimi",
        cost: 200,
        description: "Hareket hızını kalıcı olarak artırır.",
        key: "6",
        purchase: () => {
            if (!gameState.permanentSpeedUpgrade && gameState.coinCount >= 200) {
                gameState.coinCount -= 200;
                gameState.permanentSpeedUpgrade = true;
                gameState.player.speed += 1.5; // Hızı kalıcı olarak artır
                playSound('levelUp');
                return true;
            }
            return false;
        }
    },
    {
        name: "Refleks Geliştirici",
        cost: 250,
        description: "Dash bekleme süresini kalıcı olarak azaltır.",
        key: "7",
        purchase: () => {
            if (!gameState.permanentDashUpgrade && gameState.coinCount >= 250) {
                gameState.coinCount -= 250;
                gameState.permanentDashUpgrade = true;
                // Bekleme süresini %25 azalt (0.75 ile çarp)
                gameState.player.dashCooldownTime = Math.round(gameState.player.dashCooldownTime * 0.75);
                playSound('levelUp');
                return true;
            }
            return false;
        }
    },
    {
        name: "Vampir Saldırısı",
        cost: 300,
        description: "Düşmanları öldürdüğünde can çalma şansı kazanırsın.",
        key: "8",
        purchase: () => {
            if (!gameState.permanentVampireUpgrade && gameState.coinCount >= 300) {
                gameState.coinCount -= 300;
                gameState.permanentVampireUpgrade = true;
                playSound('levelUp');
                return true;
            }
            return false;
        }
    }
    // Buraya yeni ürünler kolayca eklenebilir.
];

// Mağaza arayüzünü çiz
function drawShop(ctx) {
    if (!gameState.shopOpen) return;
    ctx.save();
    // Arka plan
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#222";
    ctx.fillRect(150, 100, 500, 400);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(150, 100, 500, 400);

    // Başlık
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MAĞAZA", 400, 140);

    // Satın alınmış kalıcı ürünleri gösterme
    const visibleItems = shopItems.filter(item => {
        // '5' tuşuna bağlı ürün (Can Haznesi) satın alındıysa gösterme
        if (item.key === '5' && gameState.maxHealthUpgraded) {
            return false;
        }
        if (item.key === '6' && gameState.permanentSpeedUpgrade) {
            return false;
        }
        if (item.key === '7' && gameState.permanentDashUpgrade) {
            return false;
        }
        if (item.key === '8' && gameState.permanentVampireUpgrade) {
            return false;
        }
        return true;
    });

    // Görüntülenecek ürünleri çiz
    let yPos = 190;
    for (const item of visibleItems) {
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText(`${item.name} (${item.cost} Altın)`, 400, yPos);
        
        ctx.font = "16px Arial";
        ctx.fillStyle = "#ccc";
        ctx.fillText(item.description, 400, yPos + 25);

        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#ffd700";
        ctx.fillText(`Satın almak için: [${item.key}] tuşuna bas`, 400, yPos + 55);
        yPos += 90;
    }

    ctx.font = "bold 20px Arial";
    ctx.fillText("Altınınız: " + gameState.coinCount, 400, 450);
    ctx.font = "18px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Kapatmak için [M] tuşuna tekrar basın", 400, 480);
    ctx.restore();
}

// Mağaza tuş kontrolleri
function handleShopKey(e) {
    if (!gameState.shopOpen) return;
    const item = shopItems.find(i => i.key === e.key);
    if (item) {
        item.purchase();
    }
}
