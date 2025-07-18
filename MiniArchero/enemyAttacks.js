// Gelişmiş düşman saldırı hareketleri
window.enemyAttacks = {
    // Düşman saldırı tipleri
    attackTypes: {
        STRAIGHT: "straight", // Düz saldırı
        SPREAD: "spread",     // Yayılan saldırı
        CIRCLE: "circle",     // Çember şeklinde saldırı
        HOMING: "homing",     // Takip eden saldırı
        WAVE: "wave",         // Dalga şeklinde saldırı
        BURST: "burst"        // Patlamalı saldırı
    },
    
    // Düşman saldırı renkleri
    attackColors: {
        NORMAL: "#ff5252",    // Normal düşman
        SHOOTER: "#ab47bc",   // Nişancı düşman
        EXPLODER: "#ffa726",  // Patlayan düşman
        BOSS: "#f44336",      // Boss
        ELITE: "#ffeb3b"      // Elit düşman
    },
    
    // Düz saldırı - Tek yönde mermi atar
    createStraightAttack: function(x, y, targetX, targetY, speed = 3, size = 8, color = this.attackColors.NORMAL) {
        // Hedef yönünü hesapla
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize edilmiş yön vektörü
        const vx = dx / dist * speed;
        const vy = dy / dist * speed;
        
        return {
            x: x,
            y: y,
            size: size,
            color: color,
            vx: vx,
            vy: vy,
            type: this.attackTypes.STRAIGHT,
            damage: 1,
            lifespan: 300 // Mermi ömrü (frame)
        };
    },
    
    // Yayılan saldırı - Birden fazla yöne mermi atar
    createSpreadAttack: function(x, y, targetX, targetY, count = 3, spreadAngle = 30, speed = 3, size = 8, color = this.attackColors.SHOOTER) {
        const projectiles = [];
        
        // Ana yönü hesapla
        const dx = targetX - x;
        const dy = targetY - y;
        const angle = Math.atan2(dy, dx);
        
        // Yayılma açısını radyana çevir
        const spreadRad = (spreadAngle * Math.PI) / 180;
        
        // Mermileri oluştur
        for (let i = 0; i < count; i++) {
            // Merkez açıdan yayılma açısını çıkar, sonra her mermi için açı ekle
            const currentAngle = angle - (spreadRad / 2) + (spreadRad / (count - 1)) * i;
            
            const vx = Math.cos(currentAngle) * speed;
            const vy = Math.sin(currentAngle) * speed;
            
            projectiles.push({
                x: x,
                y: y,
                size: size,
                color: color,
                vx: vx,
                vy: vy,
                type: this.attackTypes.SPREAD,
                damage: 1,
                lifespan: 300
            });
        }
        
        return projectiles;
    },
    
    // Çember saldırısı - Her yöne mermi atar
    createCircleAttack: function(x, y, count = 8, speed = 2.5, size = 8, color = this.attackColors.BOSS) {
        const projectiles = [];
        
        // Her yöne mermi oluştur
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            projectiles.push({
                x: x,
                y: y,
                size: size,
                color: color,
                vx: vx,
                vy: vy,
                type: this.attackTypes.CIRCLE,
                damage: 1,
                lifespan: 300
            });
        }
        
        return projectiles;
    },
    
    // Takip eden saldırı - Oyuncuyu takip eden mermi
    createHomingAttack: function(x, y, targetX, targetY, speed = 2, size = 10, color = this.attackColors.ELITE) {
        // Başlangıç yönünü hesapla
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize edilmiş yön vektörü
        const vx = dx / dist * speed;
        const vy = dy / dist * speed;
        
        return {
            x: x,
            y: y,
            size: size,
            color: color,
            vx: vx,
            vy: vy,
            type: this.attackTypes.HOMING,
            damage: 1,
            lifespan: 400, // Daha uzun ömürlü
            trackingSpeed: 0.05, // Takip hızı
            target: { x: targetX, y: targetY } // Hedef konum
        };
    },
    
    // Dalga saldırısı - Sinüs dalgası şeklinde hareket eden mermi
    createWaveAttack: function(x, y, targetX, targetY, speed = 3, size = 8, color = this.attackColors.SHOOTER) {
        // Ana yönü hesapla
        const dx = targetX - x;
        const dy = targetY - y;
        const angle = Math.atan2(dy, dx);
        
        // Ana yön vektörü
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        return {
            x: x,
            y: y,
            size: size,
            color: color,
            vx: vx,
            vy: vy,
            type: this.attackTypes.WAVE,
            damage: 1,
            lifespan: 300,
            waveAmplitude: 10, // Dalga genişliği
            waveFrequency: 0.1, // Dalga frekansı
            wavePhase: 0, // Dalga fazı
            baseAngle: angle // Ana hareket açısı
        };
    },
    
    // Patlamalı saldırı - Belirli bir mesafeden sonra patlayan ve parçalara ayrılan mermi
    createBurstAttack: function(x, y, targetX, targetY, speed = 3, size = 12, color = this.attackColors.EXPLODER) {
        // Hedef yönünü hesapla
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize edilmiş yön vektörü
        const vx = dx / dist * speed;
        const vy = dy / dist * speed;
        
        return {
            x: x,
            y: y,
            size: size,
            color: color,
            vx: vx,
            vy: vy,
            type: this.attackTypes.BURST,
            damage: 1,
            lifespan: 200,
            burstDistance: 150, // Patlama mesafesi
            burstCount: 6, // Patlama sonrası oluşacak mermi sayısı
            hasBurst: false // Patladı mı?
        };
    },
    
    // Mermileri güncelle
    updateProjectiles: function(projectiles, playerX, playerY) {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            
            // Mermi tipine göre hareket güncelle
            switch (proj.type) {
                case this.attackTypes.HOMING:
                    // Oyuncuyu takip et
                    proj.target.x = playerX;
                    proj.target.y = playerY;
                    
                    // Yeni yönü hesapla
                    const dx = proj.target.x - proj.x;
                    const dy = proj.target.y - proj.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 0) {
                        // Yeni yön vektörü
                        const newVx = dx / dist;
                        const newVy = dy / dist;
                        
                        // Mevcut yönü yeni yöne doğru yavaşça değiştir
                        proj.vx += (newVx - proj.vx / Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy)) * proj.trackingSpeed;
                        proj.vy += (newVy - proj.vy / Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy)) * proj.trackingSpeed;
                        
                        // Hızı normalize et
                        const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
                        if (speed > 0) {
                            proj.vx = (proj.vx / speed) * 2; // Sabit hız
                            proj.vy = (proj.vy / speed) * 2;
                        }
                    }
                    break;
                    
                case this.attackTypes.WAVE:
                    // Dalga hareketi
                    proj.wavePhase += proj.waveFrequency;
                    
                    // Ana yönde ilerle, ancak dik yönde sinüs dalgası oluştur
                    const perpX = Math.cos(proj.baseAngle + Math.PI/2);
                    const perpY = Math.sin(proj.baseAngle + Math.PI/2);
                    
                    // Dalga etkisini hesapla
                    const waveEffect = Math.sin(proj.wavePhase) * proj.waveAmplitude;
                    
                    // Yeni pozisyonu hesapla
                    proj.x += proj.vx + perpX * waveEffect * 0.1;
                    proj.y += proj.vy + perpY * waveEffect * 0.1;
                    continue; // Diğer güncellemeyi atla
                    
                case this.attackTypes.BURST:
                    // Belirli bir mesafe sonra patla
                    if (!proj.hasBurst) {
                        const travelDist = Math.sqrt(
                            Math.pow(proj.x - (proj.x - proj.vx * proj.lifespan), 2) + 
                            Math.pow(proj.y - (proj.y - proj.vy * proj.lifespan), 2)
                        );
                        
                        if (travelDist >= proj.burstDistance) {
                            proj.hasBurst = true;
                            
                            // Patlamadan sonra çember şeklinde mermiler oluştur
                            const burstProjectiles = this.createCircleAttack(
                                proj.x, proj.y, proj.burstCount, 3, proj.size * 0.7, proj.color
                            );
                            
                            // Yeni mermileri listeye ekle
                            for (const burstProj of burstProjectiles) {
                                projectiles.push(burstProj);
                            }
                            
                            // Orijinal mermiyi kaldır
                            projectiles.splice(i, 1);
                            
                            // Patlama efekti
                            if (typeof spawnParticles === "function") {
                                spawnParticles(proj.x, proj.y, proj.color, 15, 1, 30);
                            }
                            
                            continue;
                        }
                    }
                    break;
            }
            
            // Standart hareket güncelleme
            proj.x += proj.vx;
            proj.y += proj.vy;
            
            // Mermi ömrünü azalt
            proj.lifespan--;
            
            // Ömrü biten mermileri kaldır
            if (proj.lifespan <= 0) {
                projectiles.splice(i, 1);
            }
        }
    },
    
    // Mermileri çiz
    drawProjectiles: function(ctx, projectiles) {
        ctx.save();
        
        for (const proj of projectiles) {
            ctx.beginPath();
            
            // Mermi tipine göre farklı görünüm
            switch (proj.type) {
                case this.attackTypes.STRAIGHT:
                    // Basit yuvarlak mermi
                    ctx.fillStyle = proj.color;
                    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case this.attackTypes.SPREAD:
                    // Elmas şeklinde mermi
                    ctx.fillStyle = proj.color;
                    const angle = Math.atan2(proj.vy, proj.vx);
                    
                    ctx.translate(proj.x, proj.y);
                    ctx.rotate(angle);
                    
                    ctx.beginPath();
                    ctx.moveTo(proj.size * 1.5, 0);
                    ctx.lineTo(0, proj.size * 0.8);
                    ctx.lineTo(-proj.size * 0.8, 0);
                    ctx.lineTo(0, -proj.size * 0.8);
                    ctx.closePath();
                    ctx.fill();
                    
                    ctx.resetTransform();
                    break;
                    
                case this.attackTypes.CIRCLE:
                    // Parlayan yuvarlak mermi
                    const gradient = ctx.createRadialGradient(
                        proj.x, proj.y, 0,
                        proj.x, proj.y, proj.size
                    );
                    gradient.addColorStop(0, '#ffffff');
                    gradient.addColorStop(0.7, proj.color);
                    gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
                    
                    ctx.fillStyle = gradient;
                    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case this.attackTypes.HOMING:
                    // Takip eden mermi (kuyruklu)
                    ctx.fillStyle = proj.color;
                    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Kuyruk efekti
                    const tailLength = 5;
                    const tailAngle = Math.atan2(proj.vy, proj.vx);
                    
                    ctx.beginPath();
                    ctx.moveTo(proj.x, proj.y);
                    ctx.lineTo(
                        proj.x - Math.cos(tailAngle) * proj.size * tailLength,
                        proj.y - Math.sin(tailAngle) * proj.size * tailLength
                    );
                    ctx.strokeStyle = proj.color;
                    ctx.globalAlpha = 0.5;
                    ctx.lineWidth = proj.size;
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                    break;
                    
                case this.attackTypes.WAVE:
                    // Dalga şeklinde mermi
                    ctx.fillStyle = proj.color;
                    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Dalga izi
                    ctx.beginPath();
                    ctx.arc(proj.x, proj.y, proj.size + 5, 0, Math.PI * 2);
                    ctx.strokeStyle = proj.color;
                    ctx.globalAlpha = 0.3;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                    break;
                    
                case this.attackTypes.BURST:
                    // Patlamalı mermi
                    ctx.fillStyle = proj.color;
                    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Patlama göstergesi
                    if (!proj.hasBurst) {
                        const pulseSize = Math.sin(Date.now() / 100) * 3;
                        ctx.beginPath();
                        ctx.arc(proj.x, proj.y, proj.size + pulseSize, 0, Math.PI * 2);
                        ctx.strokeStyle = '#ffffff';
                        ctx.globalAlpha = 0.5;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.globalAlpha = 1.0;
                    }
                    break;
            }
        }
        
        ctx.restore();
    }
};

// Düşman saldırı davranışları
window.enemyBehaviors = {
    // Düşman davranış tipleri
    behaviorTypes: {
        NORMAL: "normal",         // Normal hareket
        AGGRESSIVE: "aggressive", // Agresif takip
        CAUTIOUS: "cautious",     // Temkinli hareket
        FLANKING: "flanking",     // Yandan dolaşma
        STATIONARY: "stationary"  // Sabit durma
    },
    
    // Düşman davranışını güncelle
    updateEnemyBehavior: function(enemy, playerX, playerY, canvas) {
        if (!enemy.behavior) {
            // Varsayılan davranış ata
            enemy.behavior = this.behaviorTypes.NORMAL;
            enemy.behaviorTimer = 0;
            enemy.behaviorDuration = 180; // 3 saniye
        }
        
        // Davranış süresini kontrol et ve gerekirse değiştir
        enemy.behaviorTimer++;
        if (enemy.behaviorTimer >= enemy.behaviorDuration) {
            // Rastgele yeni davranış seç
            const behaviors = Object.values(this.behaviorTypes);
            enemy.behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
            enemy.behaviorTimer = 0;
            enemy.behaviorDuration = 120 + Math.floor(Math.random() * 180); // 2-5 saniye
        }
        
        // Düşman tipine göre davranış uygula
        switch (enemy.type) {
            case 'shooter':
                this.applyShooterBehavior(enemy, playerX, playerY, canvas);
                break;
                
            case 'exploder':
                this.applyExploderBehavior(enemy, playerX, playerY, canvas);
                break;
                
            case 'portal':
                // Portal düşmanları için özel davranış yok
                break;
                
            default:
                this.applyNormalEnemyBehavior(enemy, playerX, playerY, canvas);
                break;
        }
    },
    
    // Normal düşman davranışı
    applyNormalEnemyBehavior: function(enemy, playerX, playerY, canvas) {
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        switch (enemy.behavior) {
            case this.behaviorTypes.NORMAL:
                // Normal hareket - rastgele yönde hareket et
                if (Math.random() < 0.02) {
                    enemy.dx = (Math.random() - 0.5) * 3;
                    enemy.dy = (Math.random() - 0.5) * 3;
                }
                break;
                
            case this.behaviorTypes.AGGRESSIVE:
                // Agresif takip - oyuncuya doğru hızlıca hareket et
                if (dist > 0) {
                    enemy.dx = dx / dist * 2;
                    enemy.dy = dy / dist * 2;
                }
                break;
                
            case this.behaviorTypes.CAUTIOUS:
                // Temkinli hareket - oyuncuya belirli bir mesafede kal
                if (dist < 150) {
                    // Oyuncudan uzaklaş
                    enemy.dx = -dx / dist * 1.5;
                    enemy.dy = -dy / dist * 1.5;
                } else if (dist > 250) {
                    // Oyuncuya yaklaş
                    enemy.dx = dx / dist * 1.5;
                    enemy.dy = dy / dist * 1.5;
                } else {
                    // Mesafeyi koru, yavaşça hareket et
                    enemy.dx *= 0.95;
                    enemy.dy *= 0.95;
                }
                break;
                
            case this.behaviorTypes.FLANKING:
                // Yandan dolaşma - oyuncunun etrafında dön
                if (dist > 0) {
                    // Oyuncuya dik açıda hareket et
                    enemy.dx = dy / dist * 2;
                    enemy.dy = -dx / dist * 2;
                    
                    // Oyuncudan çok uzaklaşırsa yaklaş
                    if (dist > 200) {
                        enemy.dx += dx / dist * 0.5;
                        enemy.dy += dy / dist * 0.5;
                    }
                }
                break;
                
            case this.behaviorTypes.STATIONARY:
                // Sabit durma - hareket etme
                enemy.dx *= 0.9;
                enemy.dy *= 0.9;
                break;
        }
        
        // Sınırları kontrol et
        this.checkBoundaries(enemy, canvas);
    },
    
    // Nişancı düşman davranışı
    applyShooterBehavior: function(enemy, playerX, playerY, canvas) {
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Nişancılar genellikle mesafeli durur
        switch (enemy.behavior) {
            case this.behaviorTypes.NORMAL:
            case this.behaviorTypes.CAUTIOUS:
                // Oyuncudan uzak dur
                if (dist < 200) {
                    enemy.dx = -dx / dist * 1.2;
                    enemy.dy = -dy / dist * 1.2;
                } else if (dist > 300) {
                    enemy.dx = dx / dist * 0.8;
                    enemy.dy = dy / dist * 0.8;
                } else {
                    // İdeal mesafede yavaşça hareket et
                    enemy.dx *= 0.95;
                    enemy.dy *= 0.95;
                    
                    // Rastgele küçük hareketler
                    if (Math.random() < 0.05) {
                        enemy.dx += (Math.random() - 0.5) * 0.5;
                        enemy.dy += (Math.random() - 0.5) * 0.5;
                    }
                }
                break;
                
            case this.behaviorTypes.AGGRESSIVE:
                // Saldırgan nişancı - yaklaş ve ateş et
                if (dist > 150) {
                    enemy.dx = dx / dist * 1.5;
                    enemy.dy = dy / dist * 1.5;
                } else {
                    // Yakınsa durup ateş et
                    enemy.dx *= 0.8;
                    enemy.dy *= 0.8;
                }
                break;
                
            case this.behaviorTypes.FLANKING:
                // Yandan dolaşan nişancı
                if (dist > 0) {
                    enemy.dx = dy / dist * 1.5;
                    enemy.dy = -dx / dist * 1.5;
                    
                    // Mesafeyi koru
                    if (dist < 150) {
                        enemy.dx -= dx / dist * 0.5;
                        enemy.dy -= dy / dist * 0.5;
                    } else if (dist > 250) {
                        enemy.dx += dx / dist * 0.5;
                        enemy.dy += dy / dist * 0.5;
                    }
                }
                break;
                
            case this.behaviorTypes.STATIONARY:
                // Sabit nişancı - hareket etme, sadece ateş et
                enemy.dx *= 0.9;
                enemy.dy *= 0.9;
                break;
        }
        
        // Saldırı zamanlamasını güncelle
        enemy.attackTimer++;
        
        // Saldırı zamanı geldi mi?
        if (enemy.attackTimer >= enemy.attackCooldown) {
            enemy.attackTimer = 0;
            
            // Davranışa göre farklı saldırı tipleri
            let projectile;
            
            switch (enemy.behavior) {
                case this.behaviorTypes.AGGRESSIVE:
                    // Yayılan atış
                    return window.enemyAttacks.createSpreadAttack(
                        enemy.x + enemy.size/2, 
                        enemy.y + enemy.size/2, 
                        playerX, 
                        playerY, 
                        3, // 3 mermi
                        30, // 30 derece açı
                        3, // Hız
                        8, // Boyut
                        window.enemyAttacks.attackColors.SHOOTER
                    );
                    
                case this.behaviorTypes.CAUTIOUS:
                    // Dalga atışı
                    projectile = window.enemyAttacks.createWaveAttack(
                        enemy.x + enemy.size/2, 
                        enemy.y + enemy.size/2, 
                        playerX, 
                        playerY, 
                        3, // Hız
                        8, // Boyut
                        window.enemyAttacks.attackColors.SHOOTER
                    );
                    return [projectile];
                    
                case this.behaviorTypes.FLANKING:
                    // Takip eden atış
                    projectile = window.enemyAttacks.createHomingAttack(
                        enemy.x + enemy.size/2, 
                        enemy.y + enemy.size/2, 
                        playerX, 
                        playerY, 
                        2, // Hız
                        10, // Boyut
                        window.enemyAttacks.attackColors.SHOOTER
                    );
                    return [projectile];
                    
                case this.behaviorTypes.STATIONARY:
                    // Çember atışı
                    if (Math.random() < 0.3) { // %30 şans
                        return window.enemyAttacks.createCircleAttack(
                            enemy.x + enemy.size/2, 
                            enemy.y + enemy.size/2, 
                            8, // 8 mermi
                            2.5, // Hız
                            8, // Boyut
                            window.enemyAttacks.attackColors.SHOOTER
                        );
                    }
                    // Devam et ve normal atış yap
                    
                default:
                    // Normal düz atış
                    projectile = window.enemyAttacks.createStraightAttack(
                        enemy.x + enemy.size/2, 
                        enemy.y + enemy.size/2, 
                        playerX, 
                        playerY, 
                        3, // Hız
                        8, // Boyut
                        window.enemyAttacks.attackColors.SHOOTER
                    );
                    return [projectile];
            }
        }
        
        // Saldırı zamanı gelmedi, boş dizi döndür
        return [];
    },
    
    // Patlayan düşman davranışı
    applyExploderBehavior: function(enemy, playerX, playerY, canvas) {
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Patlama hazırlığında mı?
        if (enemy.isPriming) {
            // Patlama hazırlığı - yavaşça büyü ve titre
            enemy.primingTimer--;
            
            // Titreşim efekti
            enemy.x += (Math.random() - 0.5) * 2;
            enemy.y += (Math.random() - 0.5) * 2;
            
            // Patlama zamanı geldi mi?
            if (enemy.primingTimer <= 0) {
                return true; // Patlama zamanı
            }
            
            return false; // Henüz patlama zamanı değil
        }
        
        // Normal hareket - oyuncuya doğru git
        switch (enemy.behavior) {
            case this.behaviorTypes.NORMAL:
                // Normal hareket - oyuncuya doğru yavaşça git
                if (dist > 0) {
                    enemy.dx = dx / dist * 1.2;
                    enemy.dy = dy / dist * 1.2;
                }
                break;
                
            case this.behaviorTypes.AGGRESSIVE:
                // Agresif takip - oyuncuya doğru hızlıca git
                if (dist > 0) {
                    enemy.dx = dx / dist * 2.5;
                    enemy.dy = dy / dist * 2.5;
                }
                break;
                
            case this.behaviorTypes.CAUTIOUS:
                // Temkinli yaklaşma
                if (dist > 200) {
                    // Uzaksa yaklaş
                    enemy.dx = dx / dist * 1.5;
                    enemy.dy = dy / dist * 1.5;
                } else if (dist < 100) {
                    // Çok yakınsa patlamaya hazırlan
                    enemy.isPriming = true;
                    enemy.primingTimer = 60; // 1 saniye
                    
                    // Ses efekti
                    if (typeof playSound === "function") {
                        playSound('warning');
                    }
                } else {
                    // Orta mesafede yavaşça yaklaş
                    enemy.dx = dx / dist * 0.8;
                    enemy.dy = dy / dist * 0.8;
                }
                break;
                
            case this.behaviorTypes.FLANKING:
                // Yandan dolaşma ve yaklaşma
                if (dist > 0) {
                    // Oyuncunun etrafında dön
                    enemy.dx = dy / dist * 1.5;
                    enemy.dy = -dx / dist * 1.5;
                    
                    // Aynı zamanda yaklaş
                    enemy.dx += dx / dist * 0.5;
                    enemy.dy += dy / dist * 0.5;
                    
                    // Yeterince yakınsa patlamaya hazırlan
                    if (dist < 100) {
                        enemy.isPriming = true;
                        enemy.primingTimer = 60; // 1 saniye
                        
                        // Ses efekti
                        if (typeof playSound === "function") {
                            playSound('warning');
                        }
                    }
                }
                break;
                
            case this.behaviorTypes.STATIONARY:
                // Sabit dur ve oyuncu yaklaşırsa patla
                enemy.dx *= 0.9;
                enemy.dy *= 0.9;
                
                if (dist < 150) {
                    enemy.isPriming = true;
                    enemy.primingTimer = 60; // 1 saniye
                    
                    // Ses efekti
                    if (typeof playSound === "function") {
                        playSound('warning');
                    }
                }
                break;
        }
        
        // Oyuncu çok yakınsa patlamaya hazırlan
        if (dist < 80 && !enemy.isPriming) {
            enemy.isPriming = true;
            enemy.primingTimer = 30; // 0.5 saniye (daha hızlı)
            
            // Ses efekti
            if (typeof playSound === "function") {
                playSound('warning');
            }
        }
        
        // Sınırları kontrol et
        this.checkBoundaries(enemy, canvas);
        
        return false; // Patlama yok
    },
    
    // Sınırları kontrol et
    checkBoundaries: function(enemy, canvas) {
        // Kenarlardan sekme
        if (enemy.x < 0) {
            enemy.x = 0;
            enemy.dx = Math.abs(enemy.dx);
        } else if (enemy.x + enemy.size > canvas.width) {
            enemy.x = canvas.width - enemy.size;
            enemy.dx = -Math.abs(enemy.dx);
        }
        
        if (enemy.y < 60) { // HUD alanının altı
            enemy.y = 60;
            enemy.dy = Math.abs(enemy.dy);
        } else if (enemy.y + enemy.size > canvas.height) {
            enemy.y = canvas.height - enemy.size;
            enemy.dy = -Math.abs(enemy.dy);
        }
    }
};