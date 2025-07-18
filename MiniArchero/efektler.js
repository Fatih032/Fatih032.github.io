// Parçacık oluşturma fonksiyonu
function spawnParticles(x, y, color, count = 16) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        gameState.particles.push({
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: color,
            size: Math.random() * 4 + 3,
            life: 24 + Math.floor(Math.random() * 12),
            maxLife: 30
        });
    }
}

// Parçacıkları güncelleme fonksiyonu
function updateParticles() {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }
}

// Parçacıkları çizme fonksiyonu
function drawParticles(ctx) {
    for (const p of gameState.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / (p.maxLife || 30));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- Patlama Efektleri ---

function createExplosion(x, y, radius) {
    playSound('hit'); // Mevcut patlama sesini kullan
    spawnParticles(x, y, '#ff4500', 50); // Patlama için daha fazla parçacık
    gameState.explosions.push({
        x: x,
        y: y,
        radius: radius,
        timer: 10, // Hasar alanı 10 frame aktif kalır
        alpha: 1,
        hitPlayer: false // Oyuncuya sadece bir kez hasar vermek için
    });
}

function updateExplosions() {
    for (let i = gameState.explosions.length - 1; i >= 0; i--) {
        const exp = gameState.explosions[i];
        exp.timer--;
        exp.alpha = exp.timer / 10; // Solma efekti

        if (exp.timer <= 0) {
            gameState.explosions.splice(i, 1);
        }
    }
}

function drawExplosions(ctx) {
    for (const exp of gameState.explosions) {
        ctx.save();
        ctx.globalAlpha = exp.alpha;
        ctx.fillStyle = '#ff4500'; // Turuncu-kırmızı
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
