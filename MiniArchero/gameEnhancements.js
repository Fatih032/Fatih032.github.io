        function spawnHeart() {
            // %60 ihtimalle kalp oluştur
            if (Math.random() < 0.6) {
                gameState.heart = {
                    x: Math.random() * (canvas.width - 40) + 20,
                    y: Math.random() * (canvas.height - 80) + 40,
                    size: 28,
                    collected: false
                };
            } else {
                gameState.heart = null;
            }
        }

        function drawHeart() {
            if (!gameState.heart || gameState.heart.collected) return;
            ctx.save();
            ctx.beginPath();
            // Basit kalp şekli (emoji gibi)
            ctx.font = "28px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("❤️", gameState.heart.x, gameState.heart.y);
            ctx.restore();
        }

        function checkHeart() {
            if (!gameState.heart || gameState.heart.collected) return;
            const px = gameState.player.x + gameState.player.size/2;
            const py = gameState.player.y + gameState.player.size/2;
            const dx = px - gameState.heart.x;
            const dy = py - gameState.heart.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < gameState.player.size/2 + gameState.heart.size/2) {
                gameState.heart.collected = true;
                if (gameState.lives < gameState.maxLives) {
                    gameState.lives++;
                }
                spawnParticles(gameState.heart.x, gameState.heart.y, "#ff1744");
            }
        }

        function spawnSpeedBoost() {
            // %40 ihtimalle hızlanma ödülü oluştur
            if (Math.random() < 0.4) {
                gameState.speedBoost = {
                    x: Math.random() * (canvas.width - 40) + 20,
                    y: Math.random() * (canvas.height - 80) + 40,
                    size: 24,
                    collected: false
                };
            } else {
                gameState.speedBoost = null;
            }
        }

        function drawSpeedBoost() {
            if (!gameState.speedBoost || gameState.speedBoost.collected) return;
            ctx.save();
            ctx.beginPath();
            ctx.font = "bold 22px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#00e6ff";
            ctx.fillText("⚡", gameState.speedBoost.x, gameState.speedBoost.y);
            ctx.restore();
        }

        function checkSpeedBoost() {
            if (!gameState.speedBoost || gameState.speedBoost.collected) return;
            const px = gameState.player.x + gameState.player.size/2;
            const py = gameState.player.y + gameState.player.size/2;
            const dx = px - gameState.speedBoost.x;
            const dy = py - gameState.speedBoost.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < gameState.player.size/2 + gameState.speedBoost.size/2) {
                gameState.speedBoost.collected = true;
                gameState.speedBoostActive = true;
                gameState.speedBoostTimer = 300; // 5 saniye (60 FPS)
                spawnParticles(gameState.speedBoost.x, gameState.speedBoost.y, "#00e6ff");
            }
        }