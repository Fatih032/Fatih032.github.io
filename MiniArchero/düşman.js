  
        function moveEnemies() {
            for (const enemy of gameState.enemies) {
                // Gelişmiş düşman davranış sistemi varsa onu kullan
                if (window.enemyBehaviors) {
                    // Düşman davranışını güncelle
                    window.enemyBehaviors.updateEnemyBehavior(
                        enemy, 
                        gameState.player.x + gameState.player.size/2, 
                        gameState.player.y + gameState.player.size/2,
                        canvas
                    );
                    
                    // Patlayan düşman için patlama kontrolü
                    if (enemy.type === 'exploder' && window.enemyBehaviors.applyExploderBehavior(
                        enemy, 
                        gameState.player.x + gameState.player.size/2, 
                        gameState.player.y + gameState.player.size/2,
                        canvas
                    )) {
                        createExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, gameState.difficulty.exploderRadius);
                        const index = gameState.enemies.indexOf(enemy);
                        if (index > -1) gameState.enemies.splice(index, 1);
                        continue; // Düşman patladığı için döngünün geri kalanını atla
                    }
                    
                    // Nişancı düşman için saldırı kontrolü
                    if (enemy.type === 'shooter') {
                        enemy.attackTimer = (enemy.attackTimer || 0) + 1;
                        if (enemy.attackTimer >= enemy.attackCooldown) {
                            spawnEnemyProjectile(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2);
                        }
                    }
                } else {
                    // Eski sistem
                    if (enemy.type === 'shooter') {
                        // Nişancı mantığı
                        const distX = gameState.player.x - enemy.x;
                        const distY = gameState.player.y - enemy.y;
                        const dist = Math.sqrt(distX * distX + distY * distY);
                        const idealDistance = 250;
                        const repositionSpeed = 1.0;

                        if (dist > idealDistance + 20) { // Çok uzaksa yaklaş
                            enemy.dx = (distX / dist) * repositionSpeed;
                            enemy.dy = (distY / dist) * repositionSpeed;
                        } else if (dist < idealDistance - 20) { // Çok yakınsa uzaklaş
                            enemy.dx = -(distX / dist) * repositionSpeed;
                            enemy.dy = -(distY / dist) * repositionSpeed;
                        } else { // İdeal mesafede, dur ve ateş et
                            enemy.dx = 0;
                            enemy.dy = 0;
                            enemy.attackTimer = (enemy.attackTimer || 0) + 1;
                            if (enemy.attackTimer >= enemy.attackCooldown) {
                                enemy.attackTimer = 0;
                                spawnEnemyProjectile(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2);
                            }
                        }
                    } else if (enemy.type === 'exploder') {
                        // Patlayan düşman mantığı
                        const distX = gameState.player.x - enemy.x;
                        const distY = gameState.player.y - enemy.y;
                        const dist = Math.sqrt(distX * distX + distY * distY);
                        const primingDistance = 60;

                        if (enemy.isPriming) {
                            enemy.dx = 0;
                            enemy.dy = 0;
                            enemy.primingTimer--;
                            // Oyuncuyu uyarmak için renk değiştir
                            enemy.color = (Math.floor(enemy.primingTimer / 10) % 2 === 0) ? '#ff4500' : '#ffff00';

                            if (enemy.primingTimer <= 0) {
                                createExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, gameState.difficulty.exploderRadius);
                                const index = gameState.enemies.indexOf(enemy);
                                if (index > -1) gameState.enemies.splice(index, 1);
                                continue; // Düşman patladığı için döngünün geri kalanını atla
                            }
                        } else if (dist < primingDistance) {
                            enemy.isPriming = true; // Patlama sürecini başlat
                        } else {
                            // Oyuncuyu kovalamaya devam et
                            enemy.dx = (distX / dist) * (gameState.difficulty.enemySpeed * 0.8);
                            enemy.dy = (distY / dist) * (gameState.difficulty.enemySpeed * 0.8);
                        }
                    } else {
                        // Normal düşman mantığı: Oyuncuya doğru hareket et
                        const distX = gameState.player.x - enemy.x;
                        const distY = gameState.player.y - enemy.y;
                        const dist = Math.sqrt(distX * distX + distY * distY);
                        if (dist > 0) {
                            enemy.dx = (distX / dist) * gameState.difficulty.enemySpeed;
                            enemy.dy = (distY / dist) * gameState.difficulty.enemySpeed;
                        }
                    }
                }

                // --- Geliştirilmiş Engel Çarpışma ve Kayma Mantığı ---
                // Önce X ekseninde hareket etmeyi dene
                let nextX = enemy.x + enemy.dx;
                for (const ob of gameState.obstacles) {
                    if (isCircleRectColliding(nextX + enemy.size / 2, enemy.y + enemy.size / 2, enemy.size / 2, ob.x, ob.y, ob.w, ob.h)) {
                        nextX = enemy.x; // Çarpışma varsa X hareketini iptal et
                        break;
                    }
                }

                // Sonra Y ekseninde hareket etmeyi dene
                let nextY = enemy.y + enemy.dy;
                for (const ob of gameState.obstacles) {
                    // X'in güncel halini kullanarak kontrol et
                    if (isCircleRectColliding(nextX + enemy.size / 2, nextY + enemy.size / 2, enemy.size / 2, ob.x, ob.y, ob.w, ob.h)) {
                        nextY = enemy.y; // Çarpışma varsa Y hareketini iptal et
                        break;
                    }
                }

                enemy.x = Math.max(0, Math.min(canvas.width - enemy.size, nextX));
                enemy.y = Math.max(0, Math.min(canvas.height - enemy.size, nextY));
            }
            handleSpecialEnemyPortals();
        }

        function moveArrows() {
            for (let i = gameState.arrows.length - 1; i >= 0; i--) {
                const arrow = gameState.arrows[i];
                let nextX = arrow.x + arrow.dx;
                let nextY = arrow.y + arrow.dy;
                let hit = false;
                for (const ob of gameState.obstacles) {
                    if (isCircleRectColliding(nextX, nextY, arrow.size/2, ob.x, ob.y, ob.w, ob.h)) {
                        hit = true;
                        spawnParticles(arrow.x, arrow.y, '#cccccc', 5); // Engel vurma efekti
                        break;
                    }
                }
                if (hit) {
                    gameState.arrows.splice(i, 1);
                } else {
                    arrow.x = nextX;
                    arrow.y = nextY;
                }
            }
        }

        function drawEnemies() {
            for (const enemy of gameState.enemies) {
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.size/2, enemy.y + enemy.size/2, enemy.size/2, 0, Math.PI*2);
                ctx.fill();
            }
        }

        // --- Nişancı Mermileri ---

        function spawnEnemyProjectile(ex, ey, tx, ty) {
            // Gelişmiş düşman saldırı sistemi varsa onu kullan
            if (window.enemyAttacks) {
                // Düşman davranışına göre farklı saldırı tipleri kullan
                const enemy = gameState.enemies.find(e => e.x + e.size/2 === ex && e.y + e.size/2 === ey);
                
                if (enemy && enemy.behavior) {
                    // Düşman davranışına göre saldırı tipi belirle
                    const projectiles = window.enemyBehaviors.applyShooterBehavior(enemy, tx, ty, canvas);
                    if (projectiles && projectiles.length > 0) {
                        gameState.enemyProjectiles.push(...projectiles);
                        return;
                    }
                }
                
                // Varsayılan saldırı tipi
                const projectile = window.enemyAttacks.createStraightAttack(
                    ex, ey, tx, ty, 4, 8, window.enemyAttacks.attackColors.SHOOTER
                );
                gameState.enemyProjectiles.push(projectile);
            } else {
                // Eski sistem
                const angle = Math.atan2(ty - ey, tx - ex);
                gameState.enemyProjectiles.push({
                    x: ex,
                    y: ey,
                    dx: Math.cos(angle) * 4, // Oyuncu okundan daha yavaş
                    dy: Math.sin(angle) * 4,
                    size: 8, // Oyuncu okundan daha küçük
                    color: '#f06292' // Pembe
                });
            }
        }

        function moveEnemyProjectiles() {
            // Gelişmiş düşman saldırı sistemi varsa onu kullan
            if (window.enemyAttacks) {
                window.enemyAttacks.updateProjectiles(
                    gameState.enemyProjectiles, 
                    gameState.player.x + gameState.player.size/2, 
                    gameState.player.y + gameState.player.size/2
                );
                
                // Engel çarpışmalarını kontrol et
                for (let i = gameState.enemyProjectiles.length - 1; i >= 0; i--) {
                    const p = gameState.enemyProjectiles[i];
                    let hitObstacle = false;

                    for (const ob of gameState.obstacles) {
                        if (isCircleRectColliding(p.x, p.y, p.size / 2, ob.x, ob.y, ob.w, ob.h)) {
                            hitObstacle = true;
                            break;
                        }
                    }

                    if (hitObstacle) {
                        spawnParticles(p.x, p.y, p.color, 5);
                        gameState.enemyProjectiles.splice(i, 1);
                    }
                }
            } else {
                // Eski sistem
                for (let i = gameState.enemyProjectiles.length - 1; i >= 0; i--) {
                    const p = gameState.enemyProjectiles[i];
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
                        gameState.enemyProjectiles.splice(i, 1);
                        continue;
                    }

                    p.x = nextX;
                    p.y = nextY;

                    // Ekran dışına çıkarsa sil
                    if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
                        gameState.enemyProjectiles.splice(i, 1);
                    }
                }
            }
        }

        function drawEnemyProjectiles() {
            // Gelişmiş düşman saldırı sistemi varsa onu kullan
            if (window.enemyAttacks) {
                window.enemyAttacks.drawProjectiles(ctx, gameState.enemyProjectiles);
            } else {
                // Eski sistem
                for (const p of gameState.enemyProjectiles) {
                    ctx.save();
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        function drawArrows() {
            ctx.fillStyle = '#fff';
            for (const arrow of gameState.arrows) {
                ctx.beginPath();
                ctx.arc(arrow.x, arrow.y, arrow.size/2, 0, Math.PI*2);
                ctx.fill();
            }
        }