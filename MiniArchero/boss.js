        function spawnBoss() {
            // Her 10. bölümde veya test için 1. bölümde büyük boss
            const isBigBoss = (gameState.level % 10 === 0 );
            // Normal boss canı
            const normalBossHp = gameState.difficulty.bossBaseHp + Math.floor(gameState.level * gameState.difficulty.bossHpPerLevel);
            // Big boss canı normal bossun 2 katı
            const bigBossHp = normalBossHp * 2;
            gameState.boss = {
                x: Math.random() * 600 + 50,
                y: 80,
                size: isBigBoss ? 120 : 60,
                color: isBigBoss ? '#ffd600' : '#6a1b9a', // Big boss sarı
                dx: 0,
                dy: 0,
                maxHp: isBigBoss ? bigBossHp : normalBossHp,
                hp: isBigBoss ? bigBossHp : normalBossHp,
                attackTimer: 0,
                attackCooldown: isBigBoss ? 60 : 120 // büyük boss daha sık saldırır
            };
        }

        function drawBoss() {
            if (!gameState.boss) return;
            ctx.save();
            ctx.fillStyle = gameState.boss.color;
            ctx.beginPath();
            ctx.arc(gameState.boss.x + gameState.boss.size/2, gameState.boss.y + gameState.boss.size/2, gameState.boss.size/2, 0, Math.PI*2);
            ctx.fill();
            // Can barı
            ctx.fillStyle = '#222';
            ctx.fillRect(gameState.boss.x, gameState.boss.y - 18, gameState.boss.size, 10);
            ctx.fillStyle = '#e53935';
            ctx.fillRect(gameState.boss.x, gameState.boss.y - 18, gameState.boss.size * (gameState.boss.hp / gameState.boss.maxHp), 10);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(gameState.boss.x, gameState.boss.y - 18, gameState.boss.size, 10);
            ctx.restore();
        }

        function moveBoss() {
            if (!gameState.boss) return;
            // Oyuncuya doğru hareket
            const distX = gameState.player.x - gameState.boss.x;
            const distY = gameState.player.y - gameState.boss.y;
            const dist = Math.sqrt(distX*distX + distY*distY);
            if (dist > 0) {
                gameState.boss.dx = (distX / dist) * (gameState.boss.size > 100 ? 1.7 : 1.2);
                gameState.boss.dy = (distY / dist) * (gameState.boss.size > 100 ? 1.7 : 1.2);
            }
            // --- Geliştirilmiş Engel Çarpışma ve Kayma Mantığı ---
            // Önce X ekseninde hareket etmeyi dene
            let nextX = gameState.boss.x + gameState.boss.dx;
            for (const ob of gameState.obstacles) {
                if (isCircleRectColliding(nextX + gameState.boss.size / 2, gameState.boss.y + gameState.boss.size / 2, gameState.boss.size / 2, ob.x, ob.y, ob.w, ob.h)) {
                    nextX = gameState.boss.x; // Çarpışma varsa X hareketini iptal et
                    break;
                }
            }

            // Sonra Y ekseninde hareket etmeyi dene
            let nextY = gameState.boss.y + gameState.boss.dy;
            for (const ob of gameState.obstacles) {
                // X'in güncel halini kullanarak kontrol et
                if (isCircleRectColliding(nextX + gameState.boss.size / 2, nextY + gameState.boss.size / 2, gameState.boss.size / 2, ob.x, ob.y, ob.w, ob.h)) {
                    nextY = gameState.boss.y; // Çarpışma varsa Y hareketini iptal et
                    break;
                }
            }

            gameState.boss.x = nextX;
            gameState.boss.y = nextY;
            gameState.boss.x = Math.max(0, Math.min(canvas.width - gameState.boss.size, gameState.boss.x));
            gameState.boss.y = Math.max(0, Math.min(canvas.height - gameState.boss.size, gameState.boss.y));
            // Saldırı: büyük boss her 60 frame'de bir oyuncuya doğru mermi atar
            if (gameState.boss.size > 100) {
                gameState.boss.attackTimer = (gameState.boss.attackTimer || 0) + 1;
                if (gameState.boss.attackTimer >= gameState.boss.attackCooldown) {
                    gameState.boss.attackTimer = 0;
                    // Boss'tan oyuncuya doğru büyük bir mermi fırlat
                    spawnBossProjectile(gameState.boss.x + gameState.boss.size/2, gameState.boss.y + gameState.boss.size/2, gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2);
                }
            }
        }

        function spawnBossProjectile(bx, by, tx, ty) {
            const angle = Math.atan2(ty - by, tx - bx);
            gameState.bossProjectiles.push({
                x: bx,
                y: by,
                dx: Math.cos(angle) * 7,
                dy: Math.sin(angle) * 7,
                size: 24,
                color: '#ff9800',
                life: 120
            });
        }
        function moveBossProjectiles() {
            for (let i = gameState.bossProjectiles.length - 1; i >= 0; i--) {
                const p = gameState.bossProjectiles[i];
                let nextX = p.x + p.dx;
                let nextY = p.y + p.dy;
                let hitObstacle = false;

                for (const ob of gameState.obstacles) {
                    if (isCircleRectColliding(nextX, nextY, p.size / 2, ob.x, ob.y, ob.w, ob.h)) {
                        hitObstacle = true;
                        break;
                    }
                }

                if (hitObstacle) {
                    spawnParticles(p.x, p.y, p.color, 5);
                    gameState.bossProjectiles.splice(i, 1);
                    continue;
                }

                p.x = nextX;
                p.y = nextY;
                p.life--;
                // Oyuncuya çarparsa
                if (gameState.player.isDashing) continue; // Dash sırasında hasar alma
                const dx = (gameState.player.x + gameState.player.size/2) - p.x;
                const dy = (gameState.player.y + gameState.player.size/2) - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < gameState.player.size/2 + p.size/2) {
                    // Kalkan ve ölüm kontrolleri
                    if (gameState.playerUpgrades.includes('shield') && !gameState.shieldActive && !gameState.shieldInvincible) {
                        gameState.shieldActive = true;
                        gameState.shieldInvincible = true;
                        gameState.shieldInvincibleTimer = 180;
                        gameState.playerUpgrades = gameState.playerUpgrades.filter(u => u !== 'shield');
                        spawnParticles(gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2, '#00e6ff');
                        setTimeout(() => { gameState.shieldActive = false; }, 1000);
                        gameState.bossProjectiles.splice(i, 1);
                        continue;
                    }
                    if (gameState.shieldInvincible) {
                        gameState.bossProjectiles.splice(i, 1);
                        continue;
                    }
                    spawnParticles(p.x, p.y, p.color);
                    spawnParticles(gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2, '#ffd600');
                    winMsg.innerText = 'Kaybettiniz!';
                    winMsg.style.display = 'block';
                    gameState.isGameOver = true;
                    gameState.gameOverTimer = 60;
                    gameState.bossProjectiles.splice(i, 1);
                    continue;
                }
                // Ekran dışına çıkarsa veya ömrü biterse sil
                if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.life <= 0) {
                    gameState.bossProjectiles.splice(i, 1);
                }
            }
        }
        function drawBossProjectiles() {
            for (const p of gameState.bossProjectiles) {
                ctx.save();
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size/2, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
        }

        function checkBossCollisions() {
            if (!gameState.boss) return;
            // Ok ve boss çarpışması
            for (let i = gameState.arrows.length - 1; i >= 0; i--) {
                const arrow = gameState.arrows[i];
                const dx = (arrow.x) - (gameState.boss.x + gameState.boss.size/2);
                const dy = (arrow.y) - (gameState.boss.y + gameState.boss.size/2);
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < gameState.boss.size/2 + arrow.size/2) {
                    gameState.boss.hp--;
                    spawnParticles(arrow.x, arrow.y, '#e53935');
                    gameState.arrows.splice(i, 1);
                    if (gameState.boss.hp <= 0) {
                        spawnParticles(gameState.boss.x + gameState.boss.size/2, gameState.boss.y + gameState.boss.size/2, gameState.boss.color);
                        
                        // Boss öldüğünde büyük patlama efekti
                        createExplosion(gameState.boss.x + gameState.boss.size/2, gameState.boss.y + gameState.boss.size/2, 150);
                        playSound('explosion');
                        
                        // Altın bırak
                        for (let i = 0; i < 10; i++) {
                            const offsetX = (Math.random() - 0.5) * 60;
                            const offsetY = (Math.random() - 0.5) * 60;
                            spawnCoin(gameState.boss.x + gameState.boss.size/2 + offsetX, gameState.boss.y + gameState.boss.size/2 + offsetY);
                        }
                        
                        // Görev sistemine boss yenme bilgisini gönder
                        if (window.questSystem) {
                            window.questSystem.updateQuestProgress("DEFEAT_BOSS");
                        }
                        
                        gameState.boss = null;
                        return; // boss öldü, fonksiyondan çık
                    }
                }
            }
            if (!gameState.boss) return; // boss öldüyse fonksiyondan çık
            // Boss ve oyuncu çarpışması
            if (gameState.player.isDashing) return; // Dash sırasında hasar alma
            const dx = (gameState.player.x + gameState.player.size/2) - (gameState.boss.x + gameState.boss.size/2);
            const dy = (gameState.player.y + gameState.player.size/2) - (gameState.boss.y + gameState.boss.size/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < gameState.player.size/2 + gameState.boss.size/2) {
                // Kalkan ve ölüm kontrolleri
                if (gameState.playerUpgrades.includes('shield') && !gameState.shieldActive && !gameState.shieldInvincible) {
                    gameState.shieldActive = true;
                    gameState.shieldInvincible = true;
                    gameState.shieldInvincibleTimer = 180;
                    gameState.playerUpgrades = gameState.playerUpgrades.filter(u => u !== 'shield');
                    spawnParticles(gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2, '#00e6ff');
                    setTimeout(() => { gameState.shieldActive = false; }, 1000);
                    return;
                }
                if (gameState.shieldInvincible) return;
                spawnParticles(gameState.boss.x + gameState.boss.size/2, gameState.boss.y + gameState.boss.size/2, gameState.boss.color);
                spawnParticles(gameState.player.x + gameState.player.size/2, gameState.player.y + gameState.player.size/2, '#ffd600');
                winMsg.innerText = 'Kaybettiniz!';
                winMsg.style.display = 'block';
                gameState.isGameOver = true;
                gameState.gameOverTimer = 60;
            }
        }