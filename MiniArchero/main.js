// Oyun değişkenleri
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const winMsg = document.getElementById('winMsg');

        // Yükseltme ekranını açan fonksiyon (henüz tam olarak uygulanmadı)
        // Bu fonksiyon, checkDoor içinde çağrıldığı için oyunun çökmesini engeller.
        function openUpgradeScreen() {
            console.log("Yükseltme ekranı açılacak (henüz kodlanmadı).");
            // TODO: Yükseltme arayüzünü burada göster.
            // Şimdilik, oyunun kilitlenmemesi için kapıyı direkt açıyoruz.
            gameState.door.open = true;
            if (typeof startDoorOpenAnim === "function") startDoorOpenAnim();
        }

        function getRandomUpgrade() {
            // Henüz alınmamış bir ödül seç
            const available = gameState.UPGRADE_LIST.filter(u => !gameState.playerUpgrades.includes(u.key));
            if (available.length === 0) return gameState.UPGRADE_LIST[Math.floor(Math.random()*gameState.UPGRADE_LIST.length)];
            return available[Math.floor(Math.random()*available.length)];
        }

        // Altın sistemi coins.js üzerinden yönetiliyor, burada coins ve coinCount TANIMLAMAYIN!
        // spawnCoin, drawCoins, checkCoins, resetCoins fonksiyonları coins.js'den gelmeli.

        function checkCollisions() {
    // Ok ve düşman çarpışması
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        for (let j = gameState.arrows.length - 1; j >= 0; j--) {
            const arrow = gameState.arrows[j];
            const dx = (arrow.x) - (enemy.x + enemy.size / 2);
            const dy = (arrow.y) - (enemy.y + enemy.size / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < enemy.size / 2 + arrow.size / 2) {
                // Altın bırakma
                if (typeof spawnCoin === "function" && Math.random() < gameState.difficulty.coinDropChance) {
                    spawnCoin(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2);
                }
                playSound('hit');
                spawnParticles(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color);
                // Vampir Saldırısı (Can Çalma) Mantığı
                if (gameState.permanentVampireUpgrade) {
                    if (Math.random() < gameState.difficulty.vampireLifestealChance && gameState.lives < gameState.maxLives) {
                        gameState.lives++;
                        // Can çalma efekti
                        spawnParticles(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2, '#ff1744', 20);
                    }
                }
                gameState.enemies.splice(i, 1);
                gameState.arrows.splice(j, 1);
                break;
            }
        }
    }
    // Düşman ve oyuncu çarpışması
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        if (gameState.player.isDashing) continue; // Dash sırasında hasar alma
        const dx = (gameState.player.x + gameState.player.size / 2) - (enemy.x + enemy.size / 2);
        const dy = (gameState.player.y + gameState.player.size / 2) - (enemy.y + enemy.size / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < gameState.player.size / 2 + enemy.size / 2) {
            // Kalkan ve ölüm kontrolleri
            if (gameState.playerUpgrades.includes('shield') && !gameState.shieldActive && !gameState.shieldInvincible) {
                gameState.shieldActive = true;
                gameState.shieldInvincible = true;
                gameState.shieldInvincibleTimer = 180;
                gameState.playerUpgrades = gameState.playerUpgrades.filter(u => u !== 'shield');
                spawnParticles(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2, '#00e6ff');
                setTimeout(() => { gameState.shieldActive = false; }, 1000);
                return;
            }
            if (gameState.shieldInvincible) return;
            playSound('playerHit');
            spawnParticles(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color);
            spawnParticles(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2, '#ffd600');
            winMsg.innerText = 'Kaybettiniz!';
            winMsg.style.display = 'block';
            gameState.isGameOver = true;
            gameState.gameOverTimer = 60;
            return;
        }
    }

    // Düşman mermisi ve oyuncu çarpışması
    for (let i = gameState.enemyProjectiles.length - 1; i >= 0; i--) {
        const projectile = gameState.enemyProjectiles[i];
        if (gameState.player.isDashing) continue; // Dash sırasında hasar alma
        const dx = (gameState.player.x + gameState.player.size / 2) - (projectile.x + projectile.size / 2);
        const dy = (gameState.player.y + gameState.player.size / 2) - (projectile.y + projectile.size / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < gameState.player.size / 2 + projectile.size / 2) {
            // Kalkanı kontrol et
            if (gameState.playerUpgrades.includes('shield') && !gameState.shieldActive && !gameState.shieldInvincible) {
                // Kalkanı aktifleştir ve mermiyi yok et
                gameState.shieldActive = true;
                gameState.shieldInvincible = true;
                gameState.shieldInvincibleTimer = 180;
                gameState.playerUpgrades = gameState.playerUpgrades.filter(u => u !== 'shield');
                spawnParticles(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2, '#00e6ff');
                setTimeout(() => { gameState.shieldActive = false; }, 1000);
                gameState.enemyProjectiles.splice(i, 1);
                continue; // Bir sonraki mermiye geç
            }
            // Aktif kalkan varsa mermiyi yok et
            if (gameState.shieldInvincible) {
                gameState.enemyProjectiles.splice(i, 1);
                continue;
            }
            // Kalkan yoksa oyuncu hasar alır
            playSound('playerHit');
            spawnParticles(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2, '#ffd600');
            winMsg.innerText = 'Kaybettiniz!';
            winMsg.style.display = 'block';
            gameState.isGameOver = true;
            gameState.gameOverTimer = 60;
            gameState.enemyProjectiles.splice(i, 1);
            return; // Oyuncu öldü, fonksiyondan çık
        }
    }

    // Patlama ve oyuncu çarpışması
    for (const exp of gameState.explosions) {
        if (exp.hitPlayer || gameState.player.isDashing) continue; // Zaten hasar verdi veya oyuncu dash atıyor

        const dx = (gameState.player.x + gameState.player.size / 2) - exp.x;
        const dy = (gameState.player.y + gameState.player.size / 2) - exp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < exp.radius + gameState.player.size / 2) {
            exp.hitPlayer = true; // Hasar sadece bir kez verilir

            // Kalkan mantığı
            if (gameState.playerUpgrades.includes('shield') && !gameState.shieldActive && !gameState.shieldInvincible) {
                // Kalkanı aktifleştir ve hasarı engelle
                gameState.shieldActive = true;
                gameState.shieldInvincible = true;
                gameState.shieldInvincibleTimer = 180;
                gameState.playerUpgrades = gameState.playerUpgrades.filter(u => u !== 'shield');
                spawnParticles(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2, '#00e6ff');
                setTimeout(() => { gameState.shieldActive = false; }, 1000);
                return;
            }
            if (gameState.shieldInvincible) {
                return; // Kalkan aktif, hasar almadı
            }

            // Hasar al
            playSound('playerHit');
            spawnParticles(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2, '#ffd600');
            winMsg.innerText = 'Kaybettiniz!';
            winMsg.style.display = 'block';
            gameState.isGameOver = true;
            gameState.gameOverTimer = 60;
            return; // Oyuncu öldü, fonksiyondan çık
        }
    }
}

function gameLoop() {
    // Dükkan veya yükseltme ekranı açıkken oyunu duraklat
    if (gameState.shopOpen || gameState.isUpgradeScreenOpen) {
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }
    if (typeof updateDoorAnim === "function") updateDoorAnim();
    if (!gameState.isGameOver) {
        movePlayer();
        moveEnemies();
        moveBoss();
        moveBossProjectiles();
        moveEnemyProjectiles();
        moveArrows();
        if (typeof updateParticles === "function") updateParticles();
        if (typeof updateExplosions === "function") updateExplosions();
        if (typeof checkHeart === "function") checkHeart();
        if (typeof checkCoins === "function") checkCoins(gameState.player);
        if (typeof checkSpeedBoost === "function") checkSpeedBoost();
        checkPowerupItem(); // Güçlendirme öğesini kontrol et
        if (gameState.speedBoostActive) {
            gameState.speedBoostTimer--;
            if (gameState.speedBoostTimer <= 0) gameState.speedBoostActive = false;
        }
        if (gameState.magnetActive) {
            gameState.magnetTimer--;
            if (gameState.magnetTimer <= 0) gameState.magnetActive = false;
        }
        checkCollisions();
        checkBossCollisions();
        checkDoor();
        draw();
        // Oklar ekran dışına çıkarsa sil
        for (let i = gameState.arrows.length - 1; i >= 0; i--) {
            if (
                gameState.arrows[i].x < 0 || gameState.arrows[i].x > canvas.width ||
                gameState.arrows[i].y < 0 || gameState.arrows[i].y > canvas.height
            ) {
                gameState.arrows.splice(i, 1);
            }
        }
        // Kazanma kontrolü
        if (gameState.level > gameState.maxLevel) {
            winMsg.innerText = 'Tebrikler! Tüm bölümleri geçtiniz!';
            winMsg.style.display = 'block';
            return;
        }
        animId = requestAnimationFrame(gameLoop);
    } else {
        // Sadece efektler ve "Kaybettiniz" mesajı
        if (typeof updateParticles === "function") updateParticles();
        draw();
        gameState.gameOverTimer--;
        if (gameState.gameOverTimer > 0 && gameState.particles.length > 0) {
            animId = requestAnimationFrame(gameLoop);
        } else if (gameState.lives > 1) {
            // Can varsa devam et
            gameState.lives--;
            gameState.isGameOver = false;
            winMsg.style.display = 'none';
            resetLevel();
            animId = requestAnimationFrame(gameLoop);
        } else {
            // Tüm canlar bitti
            winMsg.innerText = 'Tüm canlarınız bitti!';
            winMsg.style.display = 'block';
        }
    }
}

        function resetLevel() {
    const isArenaLevel = gameState.level % 10 === 0 && gameState.level > 0;

    // Oyuncu konumunu sıfırla
    gameState.player.x = 400;
    gameState.player.y = 400;
    // Okları ve mermileri temizle
    gameState.arrows.length = 0;
    gameState.enemyProjectiles.length = 0;
    gameState.bossProjectiles.length = 0;
    // Engelleri temizle (şimdilik kaldırıldı)
    gameState.obstacles = []; 
    // Düşmanları yeniden oluştur
    gameState.enemies.length = 0;

    if (!isArenaLevel) {
        let count = gameState.difficulty.enemyBaseCount + Math.floor(gameState.level * gameState.difficulty.enemyPerLevel);
        let specialTypes = ([1, 2, 5, 8].includes(gameState.level)) ? ['portal'] : [];
        
        if (gameState.level >= 4) {
            const shooterCount = 1 + Math.floor((gameState.level - 4) / 3);
            for(let i = 0; i < shooterCount; i++) specialTypes.push('shooter');
        }

        if (gameState.level >= 6) {
            const exploderCount = 1 + Math.floor((gameState.level - 6) / 4);
            for(let i = 0; i < exploderCount; i++) specialTypes.push('exploder');
        }

        for (let i = 0; i < count; i++) {
            let tries = 0;
            let ex, ey, valid;
            do {
                // Mobil cihazlarda daha küçük bir alanda düşmanları oluştur
                const maxWidth = canvas.width - 100;
                const maxHeight = canvas.height / 3;
                
                ex = Math.random() * maxWidth + 50;
                ey = Math.random() * maxHeight + 50;
                valid = true;
                // Diğer düşmanlarla çakışma kontrolü
                for (const other of gameState.enemies) {
                    const dx = (ex + 15) - (other.x + 15);
                    const dy = (ey + 15) - (other.y + 15);
                    if (Math.sqrt(dx * dx + dy * dy) < 30) {
                        valid = false;
                        break;
                    }
                }
                // Oyuncu başlangıç alanı ile çakışma kontrolü
                if (valid) {
                    const playerX = window.innerWidth <= 800 ? canvas.width / 2 : 400;
                    const playerY = window.innerWidth <= 800 ? canvas.height / 2 + 50 : 400;
                    const dx = (ex + 15) - (playerX + 15);
                    const dy = (ey + 15) - (playerY + 15);
                    if (Math.sqrt(dx * dx + dy * dy) < 80) valid = false;
                }
                tries++;
            } while (!valid && tries < 40);

            if (valid) {
                if (specialTypes.length > 0) {
                    const type = specialTypes.shift();
                    let color = '#e53935';
                    if (type === 'portal') color = '#00e6ff';
                    else if (type === 'shooter') color = '#ab47bc';
                    else if (type === 'exploder') color = '#ffa726';

                    const newEnemy = { x: ex, y: ey, size: 30, color: color, dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2, type: type };

                    if (type === 'portal') newEnemy.portalCooldown = 0;
                    else if (type === 'shooter') {
                        newEnemy.attackTimer = 0;
                        newEnemy.attackCooldown = gameState.difficulty.shooterAttackCooldown;
                    } else if (type === 'exploder') {
                        newEnemy.isPriming = false;
                        newEnemy.primingTimer = 60;
                    }
                    gameState.enemies.push(newEnemy);
                } else {
                    gameState.enemies.push({ x: ex, y: ey, size: 30, color: '#e53935', dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2 });
                }
            }
        }
    }
    // Boss bölümü mü?
    if (isArenaLevel || gameState.level % 3 === 0 || gameState.level === 1) {
        spawnBoss();
    } else {
        gameState.boss = null;
    }
    // Arena dışındaki bölümlerde toplanabilirler oluştur
    if (!isArenaLevel) {
        if (typeof spawnHeart === "function") spawnHeart();
        if (typeof spawnSpeedBoost === "function") spawnSpeedBoost();
        // 3 bölümde bir rastgele güçlendirme oluştur
        if (gameState.level % 3 === 0) {
            spawnPowerupItem();
        }
    } else {
        gameState.heart = null;
        gameState.speedBoost = null;
        gameState.powerupItem = null;
    }
    // Kapıyı kapalı yap
    gameState.door.open = false;
    if (typeof gameState.doorAnim !== "undefined") {
        gameState.doorAnim.progress = 0;
        gameState.doorAnim.opening = false;
    }
    // Kalkanı sıfırla
    gameState.shieldActive = false;
    gameState.shieldInvincible = false;
    gameState.shieldInvincibleTimer = 0;
    // Parçacık efektlerini temizle
    if (typeof gameState.particles !== 'undefined') gameState.particles.length = 0;
    // Oyun bitti bayrağını sıfırla
    gameState.isGameOver = false;
    if (gameState.coins) gameState.coins.length = 0;
}

function checkDoor() {
    // Kapı zaten açık mı veya yükseltme ekranı mı bekleniyor?
    if (gameState.door.open || gameState.isUpgradeScreenOpen) {
        // Bir şey yapma.
    } else {
        // Kapının açılma koşulları
        const bossIsAlive = gameState.boss !== null;
        const enemiesAreAlive = gameState.enemies.length > 0;
        
        if (!bossIsAlive && !enemiesAreAlive) { // Seviye temizlendiğinde
            const isArenaLevel = gameState.level % 10 === 0 && gameState.level > 0;
            const isUpgradeLevel = gameState.level % 3 === 0; // 3 bölümde bir yükseltme

            if (isUpgradeLevel && !isArenaLevel) { // 3'ün katı olan bölümlerde (ve arena değilse) yükseltme ekranını aç
                openUpgradeScreen();
            } else { // Diğer durumlarda direkt kapıyı aç
                gameState.door.open = true;
                if (typeof startDoorOpenAnim === "function") startDoorOpenAnim();
            }
        }
    }
    // Oyuncu kapıya temas ettiyse ve kapı açıksa sonraki bölüme geç
    const px = gameState.player.x + gameState.player.size / 2;
    const py = gameState.player.y + gameState.player.size / 2;
    if (
        gameState.door.open &&
        px - gameState.player.size / 2 < gameState.door.x + gameState.door.width &&
        px + gameState.player.size / 2 > gameState.door.x &&
        py - gameState.player.size / 2 < gameState.door.y + gameState.door.height &&
        py + gameState.player.size / 2 > gameState.door.y
    ) {
        gameState.level++;
        playSound('levelUp');
        resetLevel();
    }
}

        function drawPlayer() {
            ctx.save();
            ctx.fillStyle = gameState.player.color;
            ctx.beginPath();
            ctx.arc(gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2, gameState.player.size/2, 0, Math.PI*2);
            ctx.fill();
            // Kalıcı Kalkan (hazır) efekti
            if (gameState.playerUpgrades.includes('shield') && !gameState.isGameOver && !gameState.shieldInvincible) {
                ctx.save();
                // Kalkanın hazır olduğunu belirten yavaşça dönen bir halka
                const rotation = (Date.now() / 4000) % (Math.PI * 2); // Yavaş dönüş
                ctx.globalAlpha = 0.9;
                ctx.strokeStyle = '#81d4fa'; // Daha açık, sakin bir mavi
                ctx.lineWidth = 3;
                ctx.beginPath();
                // Tam bir çember yerine küçük bir boşluk bırakarak daha teknolojik bir görünüm
                ctx.arc(gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2, gameState.player.size/2 + 8, rotation, rotation + Math.PI * 1.8);
                ctx.stroke();
                ctx.restore();
            }
            // Geçici Kalkan (aktif) efekti
            if (gameState.shieldInvincible && !gameState.isGameOver) {
                ctx.save();
                const pulse = Math.abs(Math.sin(Date.now() / 200)); // 0-1 arası titreşim değeri
                ctx.globalAlpha = 0.6 + pulse * 0.3; // Opaklık 0.6 ile 0.9 arası değişir
                ctx.strokeStyle = '#00e6ff'; // Kalkan rengi
                ctx.lineWidth = 3 + pulse * 3; // Kalınlık 3 ile 6 arası değişir
                ctx.beginPath();
                // Kalkanın oyuncu etrafında dönmesi için başlangıç açısını değiştir
                const rotation = (Date.now() / 1000) % (Math.PI * 2);
                ctx.arc(gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2, gameState.player.size/2 + 10, rotation, rotation + Math.PI * 1.5); // 3/4 çember
                ctx.stroke();
                ctx.restore();
            }
            // Yön göstergesi (üçgen ok)
            const cx = gameState.player.x + gameState.player.size/2;
            const cy = gameState.player.y + gameState.player.size/2;
            const dir = gameState.lastArrowDir.x === 0 && gameState.lastArrowDir.y === 0 ? {x: 0, y: -1} : gameState.lastArrowDir;
            // Üçgenin ucu
            const tipX = cx + dir.x * (gameState.player.size/2 + 10);
            const tipY = cy + dir.y * (gameState.player.size/2 + 10);
            // Üçgenin taban noktaları
            const angle = Math.atan2(dir.y, dir.x);
            const baseAngle1 = angle + Math.PI/2.5;
            const baseAngle2 = angle - Math.PI/2.5;
            const baseLen = gameState.player.size/2;
            const base1X = cx + Math.cos(baseAngle1) * baseLen;
            const base1Y = cy + Math.sin(baseAngle1) * baseLen;
            const base2X = cx + Math.cos(baseAngle2) * baseLen;
            const base2Y = cy + Math.sin(baseAngle2) * baseLen;
            ctx.fillStyle = '#ffd600';
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(base1X, base1Y);
            ctx.lineTo(base2X, base2Y);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Mağaza açma/kapama tuşu
        document.addEventListener("keydown", function(e) {
            if (e.key === "m" || e.key === "M") gameState.shopOpen = !gameState.shopOpen;
            if (typeof handleShopKey === "function") handleShopKey(e);
        });

        function draw() {
            // Temayı uygula
            const themeIndex = Math.floor((gameState.level - 1) / 5) % gameState.themes.length;
            const currentTheme = gameState.themes[themeIndex];
            canvas.style.backgroundColor = currentTheme.backgroundColor;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // drawObstacles(); // Engeller şimdilik kaldırıldı.
            if (typeof drawPortals === "function") drawPortals();
            drawPlayer();
            drawEnemies();
            drawBoss();
            drawBossProjectiles();
            drawEnemyProjectiles();
            if (typeof drawExplosions === "function") drawExplosions(ctx);
            drawArrows();
            if (typeof drawDoorAnim === "function") drawDoorAnim(ctx, gameState.door);
            if (window.coins && typeof drawCoins === "function") drawCoins(ctx);
            if (typeof drawHeart === "function") drawHeart();
            if (typeof drawSpeedBoost === "function") drawSpeedBoost();
            drawPowerupItem(); // Güçlendirme öğesini çiz

            // --- HUD (Can, Altın, Bölüm) ---
            ctx.save();
            // Arka plan paneli
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, 60);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, canvas.width, 60);

            // Can Göstergesi
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#e53935';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('❤️ ' + gameState.lives, 20, 30);

            // Altın Sayacı
            ctx.fillStyle = '#ffd700';
            ctx.fillText('🪙 ' + gameState.coinCount, 120, 30);

            // Bölüm Göstergesi
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'right';
            let isArenaLevel = gameState.level % 10 === 0 && gameState.level > 0;
            if (isArenaLevel) {
                ctx.fillStyle = '#ff5252'; // Arena yazısı kırmızı
                ctx.fillText('ARENA: ' + gameState.level, canvas.width - 20, 30);
            } else {
                ctx.fillText('Bölüm: ' + gameState.level, canvas.width - 20, 30);
            }
            ctx.restore(); // textAlign'ı ve diğer ayarları sıfırlamak için

            // Dash Bekleme Süresi Arayüzü
            ctx.save();
            if (gameState.player.dashCooldown > 0) {
                const cooldownRatio = gameState.player.dashCooldown / gameState.player.dashCooldownTime;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(220, 20, 100, 20);
                ctx.fillStyle = '#00e6ff';
                ctx.fillRect(220, 20, 100 * (1 - cooldownRatio), 20);
                ctx.strokeStyle = 'white';
                ctx.strokeRect(220, 20, 100, 20);
            } else {
                ctx.fillStyle = '#00e6ff';
                ctx.font = 'bold 14px Arial';
                ctx.fillText('DASH HAZIR [SHIFT]', 270, 30);
            }
            ctx.restore();

            // Aktif ödüller
            ctx.font = 'bold 14px Arial';
            let y = 80;
            for (const key of gameState.playerUpgrades) {
                const upg = gameState.UPGRADE_LIST.find(u => u.key === key);
                if (upg) {
                    ctx.fillStyle = '#ffd700';
                    ctx.fillText(upg.name, 120, y);
                    y += 22;
                }
            }
            if (typeof drawParticles === "function") drawParticles(ctx);
            if (typeof drawShop === "function") drawShop(ctx);
        }

        // --- Çarpışma Yardımcı Fonksiyonu ---
        function isCircleRectColliding(cx, cy, radius, rx, ry, rw, rh) {
            // Dikdörtgene en yakın noktayı bul
            let testX = cx;
            let testY = cy;

            // Hangi kenar en yakın?
            if (cx < rx)         testX = rx;      // sol kenar
            else if (cx > rx + rw) testX = rx + rw;   // sağ kenar
            if (cy < ry)         testY = ry;      // üst kenar
            else if (cy > ry + rh) testY = ry + rh;   // alt kenar

            // En yakın kenara olan mesafeyi bul
            const distX = cx - testX;
            const distY = cy - testY;
            const distance = Math.sqrt((distX * distX) + (distY * distY));

            // Mesafe yarıçaptan küçükse, çarpışma var!
            return distance <= radius;
        }

        // --- Engeller ---
        function spawnObstacles() {
            gameState.obstacles = [];
            const themeIndex = Math.floor((gameState.level - 1) / 5) % gameState.themes.length;
            const currentTheme = gameState.themes[themeIndex];

            // Arena bölümlerinde engel oluşturma
            const isArenaLevel = gameState.level % 10 === 0 && gameState.level > 0;
            if (isArenaLevel) return;

            const count = 2 + Math.floor(Math.random() * 3) + Math.floor(gameState.level / 10);
            for (let i = 0; i < count; i++) {
                let tries = 0;
                let ox, oy, ow, oh, valid;
                do {
                    valid = true;
                    ow = 60 + Math.random() * 60;
                    oh = 30 + Math.random() * 60;
                    ox = Math.random() * (canvas.width - ow - 40) + 20;
                    oy = Math.random() * (canvas.height - oh - 100) + 80; // HUD'ın altına

                    // Kapı alanı ile çakışma kontrolü
                    if (ox < gameState.door.x + gameState.door.width + 20 && ox + ow > gameState.door.x - 20 &&
                        oy < gameState.door.y + gameState.door.height + 40 && oy + oh > gameState.door.y - 20) {
                        valid = false;
                    }

                    // Oyuncu başlangıç alanı ile çakışma kontrolü
                    const playerStartX = 400;
                    const playerStartY = 400;
                    if (ox < playerStartX + 80 && ox + ow > playerStartX - 80 &&
                        oy < playerStartY + 80 && oy + oh > playerStartY - 80) {
                        valid = false;
                    }

                    // Diğer engellerle çakışma kontrolü (üst üste binmesinler)
                    for (const other of gameState.obstacles) {
                        if (ox < other.x + other.w && ox + ow > other.x &&
                            oy < other.y + other.h && oy + oh > other.y) {
                            valid = false;
                            break;
                        }
                    }
                    tries++;
                } while (!valid && tries < 50);

                if (valid) {
                    gameState.obstacles.push({ x: ox, y: oy, w: ow, h: oh, color: currentTheme.obstacleColor });
                }
            }
        }

        function drawObstacles() {
            ctx.save();
            for (const ob of gameState.obstacles) {
                ctx.fillStyle = ob.color;
                ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
                ctx.strokeStyle = '#222'; // Engellere koyu bir çerçeve
                ctx.lineWidth = 3;
                ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
            }
            ctx.restore();
        }

        // --- Güçlendirme Sistemi ---
        function spawnPowerupItem() {
            // Oyuncunun henüz sahip olmadığı güçlendirmeleri bul
            const availableUpgrades = gameState.UPGRADE_LIST.filter(u => !gameState.playerUpgrades.includes(u.key));
            
            // Eğer alınabilecek güçlendirme kalmadıysa, bir şey yapma
            if (availableUpgrades.length === 0) {
                gameState.powerupItem = null;
                return;
            }
            
            // Rastgele bir güçlendirme seç
            const randomUpgrade = availableUpgrades[Math.floor(Math.random() * availableUpgrades.length)];
            
            // Güçlendirme öğesini oyun alanında rastgele bir konuma yerleştir
            gameState.powerupItem = {
                x: Math.random() * (canvas.width - 40) + 20,
                y: Math.random() * (canvas.height - 80) + 40,
                size: 30,
                collected: false,
                upgrade: randomUpgrade
            };
        }
        
        function drawPowerupItem() {
            if (!gameState.powerupItem || gameState.powerupItem.collected) return;
            
            ctx.save();
            // Güçlendirme türüne göre farklı görünüm
            let icon = '⚡'; // Varsayılan ikon
            let color = '#ffd700';
            
            switch(gameState.powerupItem.upgrade.key) {
                case 'multi':
                    icon = '🔱'; // Çoklu atış
                    color = '#ff9800';
                    break;
                case 'fastArrow':
                    icon = '⚡'; // Hızlı ok
                    color = '#00e6ff';
                    break;
                case 'bigArrow':
                    icon = '🏹'; // Büyük ok
                    color = '#9c27b0';
                    break;
                case 'speed':
                    icon = '👟'; // Hızlı hareket
                    color = '#4caf50';
                    break;
                case 'shield':
                    icon = '🛡️'; // Kalkan
                    color = '#2196f3';
                    break;
            }
            
            // Animasyon efektleri
            const pulse = Math.abs(Math.sin(Date.now() / 300)); // 0-1 arası titreşim değeri
            const hover = Math.sin(Date.now() / 500) * 5; // Yükseklik animasyonu
            const rotation = (Date.now() / 2000) % (Math.PI * 2); // Dönüş animasyonu
            
            // Parlama efekti
            ctx.shadowColor = color;
            ctx.shadowBlur = 10 + pulse * 15;
            
            // İşık halkası
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 + pulse * 2;
            ctx.globalAlpha = 0.7 + pulse * 0.3;
            ctx.arc(gameState.powerupItem.x, gameState.powerupItem.y + hover, gameState.powerupItem.size/2 + 8 + pulse * 5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Dış çember
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.5 + pulse * 0.5;
            ctx.arc(gameState.powerupItem.x, gameState.powerupItem.y + hover, gameState.powerupItem.size/2 + 15 + pulse * 3, rotation, rotation + Math.PI * 1.5);
            ctx.stroke();
            
            // İkonu çiz
            ctx.globalAlpha = 1.0;
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = color;
            ctx.fillText(icon, gameState.powerupItem.x, gameState.powerupItem.y + hover);
            
            // Küçük parçacıklar
            if (Math.random() < 0.1) { // %10 şans ile parçacık oluştur
                const angle = Math.random() * Math.PI * 2;
                const distance = gameState.powerupItem.size/2 + 5;
                const particleX = gameState.powerupItem.x + Math.cos(angle) * distance;
                const particleY = gameState.powerupItem.y + hover + Math.sin(angle) * distance;
                
                if (typeof spawnParticles === "function") {
                    spawnParticles(particleX, particleY, color, 1, 0.5, 20);
                }
            }
            
            ctx.restore();
        }
        
        function checkPowerupItem() {
            if (!gameState.powerupItem || gameState.powerupItem.collected) return;
            
            const px = gameState.player.x + gameState.player.size/2;
            const py = gameState.player.y + gameState.player.size/2;
            const dx = px - gameState.powerupItem.x;
            const dy = py - gameState.powerupItem.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < gameState.player.size/2 + gameState.powerupItem.size/2) {
                // Güçlendirmeyi topla
                gameState.powerupItem.collected = true;
                
                // Güçlendirmeyi oyuncuya ekle
                gameState.playerUpgrades.push(gameState.powerupItem.upgrade.key);
                
                // Efekt oluştur
                spawnParticles(gameState.powerupItem.x, gameState.powerupItem.y, '#ffd700', 20);
                playSound('powerup');
                
                // Güçlendirme alındığında bildirim göster
                const upgrade = gameState.powerupItem.upgrade;
                const notification = document.createElement('div');
                notification.className = 'upgrade-notification';
                notification.innerHTML = `<strong>${upgrade.name}</strong> güçlendirmesi kazandınız!<br>${upgrade.desc}`;
                notification.style.position = 'absolute';
                notification.style.top = '100px';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                notification.style.color = '#ffd700';
                notification.style.padding = '15px';
                notification.style.borderRadius = '5px';
                notification.style.zIndex = '1000';
                document.body.appendChild(notification);
                
                // 3 saniye sonra bildirimi kaldır
                setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transition = 'opacity 0.5s';
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 500);
                }, 3000);
            }
        }
        
        // Canvas boyutunu ayarlama fonksiyonu
        function resizeCanvas() {
            if (window.innerWidth <= 800) {
                // Mobil cihazlarda daha küçük boyut
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                
                // Ekranın %90 genişliği ve %70 yüksekliği
                canvas.width = Math.min(screenWidth * 0.9, 600);
                canvas.height = Math.min(screenHeight * 0.7, 400);
                
                // Oyun alanını yeniden ayarla
                gameState.door.x = canvas.width / 2 - 20;
                gameState.door.y = 20;
            } else {
                // Masaüstünde sabit boyut
                canvas.width = 800;
                canvas.height = 500;
                
                // Kapıyı varsayılan konuma getir
                gameState.door.x = 380;
                gameState.door.y = 20;
            }
        }
        
        // Pencere boyutu değiştiğinde canvas'i yeniden boyutlandır
        window.addEventListener('resize', resizeCanvas);
        
        // --- OYUNU BAŞLATMA ---
        const startScreen = document.getElementById('startScreen');
        const startButton = document.getElementById('startButton');
        let animId;

        function startGame() {
            startScreen.style.display = 'none'; // Başlat ekranını gizle
            loadSounds(); // Sesleri kullanıcı etkileşiminden sonra yükle
            resizeCanvas(); // Canvas boyutunu ayarla
            
            // Mobil cihazlarda oyuncu başlangıç konumunu ayarla
            if (window.innerWidth <= 800) {
                gameState.player.x = canvas.width / 2 - gameState.player.size / 2;
                gameState.player.y = canvas.height / 2 + 50;
            }
            
            resetLevel(); // İlk bölümü kur
            animId = requestAnimationFrame(gameLoop); // Oyun döngüsünü başlat
        }

        startButton.addEventListener('click', startGame);
