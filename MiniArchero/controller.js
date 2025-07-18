// Tuşlar ve Mobil Kontroller
        const keys = {};
        let isMobile = false;
        let joystickActive = false;
        let joystickPos = { x: 0, y: 0 };
        
        // Mobil cihaz kontrolü
        function checkMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
        }
        
        // Sayfa yüklendiğinde mobil kontrolü
        window.addEventListener('load', () => {
            isMobile = checkMobile();
            if (isMobile) {
                setupMobileControls();
            }
        });
        
        // Pencere boyutu değiştiğinde mobil kontrolü
        window.addEventListener('resize', () => {
            isMobile = checkMobile();
            if (isMobile) {
                setupMobileControls();
            }
        });
        
        // Klavye kontrolleri
        document.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            if (["ArrowUp","w","W"].includes(e.key)) gameState.lastArrowDir = {x: 0, y: -1};
            if (["ArrowDown","s","S"].includes(e.key)) gameState.lastArrowDir = {x: 0, y: 1};
            if (["ArrowLeft","a","A"].includes(e.key)) gameState.lastArrowDir = {x: -1, y: 0};
            if (["ArrowRight","d","D"].includes(e.key)) gameState.lastArrowDir = {x: 1, y: 0};
            if (e.key === ' ' || e.key === 'Spacebar') shootArrow();
            if (e.key === 'Shift') {
                if (!gameState.player.isDashing && gameState.player.dashCooldown <= 0) {
                    startDash();
                }
            }
        });
        document.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });
        
        // Mobil kontrolleri ayarla
        function setupMobileControls() {
            const joystickArea = document.getElementById('joystickArea');
            const joystick = document.getElementById('joystick');
            const joystickKnob = document.getElementById('joystickKnob');
            const shootButton = document.getElementById('shootButton');
            const dashButton = document.getElementById('dashButton');
            
            // Joystick kontrolleri
            joystickArea.addEventListener('touchstart', (e) => {
                e.preventDefault();
                joystickActive = true;
                updateJoystickPosition(e.touches[0]);
            });
            
            joystickArea.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (joystickActive) {
                    updateJoystickPosition(e.touches[0]);
                }
            });
            
            joystickArea.addEventListener('touchend', () => {
                joystickActive = false;
                joystickKnob.style.transform = 'translate(-50%, -50%)';
                joystickPos = { x: 0, y: 0 };
                // Hareket tuşlarını sıfırla
                keys['ArrowUp'] = false;
                keys['ArrowDown'] = false;
                keys['ArrowLeft'] = false;
                keys['ArrowRight'] = false;
            });
            
            // Aksiyon butonları
            shootButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                shootArrow();
            });
            
            dashButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!gameState.player.isDashing && gameState.player.dashCooldown <= 0) {
                    startDash();
                }
            });
            
            // Joystick pozisyonunu güncelle
            function updateJoystickPosition(touch) {
                const joystickRect = joystick.getBoundingClientRect();
                const centerX = joystickRect.left + joystickRect.width / 2;
                const centerY = joystickRect.top + joystickRect.height / 2;
                
                // Joystick merkezine göre dokunma pozisyonu
                let deltaX = touch.clientX - centerX;
                let deltaY = touch.clientY - centerY;
                
                // Maksimum mesafe (joystick yarıçapı)
                const maxDistance = joystickRect.width / 2;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Mesafeyi sınırla
                if (distance > maxDistance) {
                    deltaX = deltaX * maxDistance / distance;
                    deltaY = deltaY * maxDistance / distance;
                }
                
                // Joystick topunu hareket ettir
                joystickKnob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
                
                // Hareket yönünü belirle (-1 ile 1 arasında)
                joystickPos.x = deltaX / maxDistance;
                joystickPos.y = deltaY / maxDistance;
                
                // Hareket tuşlarını güncelle
                keys['ArrowUp'] = joystickPos.y < -0.3;
                keys['ArrowDown'] = joystickPos.y > 0.3;
                keys['ArrowLeft'] = joystickPos.x < -0.3;
                keys['ArrowRight'] = joystickPos.x > 0.3;
                
                // Nişan alma yönünü güncelle
                if (Math.abs(joystickPos.x) > 0.3 || Math.abs(joystickPos.y) > 0.3) {
                    gameState.lastArrowDir = {
                        x: joystickPos.x,
                        y: joystickPos.y
                    };
                    // Yön vektörünü normalize et
                    const magnitude = Math.sqrt(gameState.lastArrowDir.x * gameState.lastArrowDir.x + gameState.lastArrowDir.y * gameState.lastArrowDir.y);
                    if (magnitude > 0) {
                        gameState.lastArrowDir.x /= magnitude;
                        gameState.lastArrowDir.y /= magnitude;
                    }
                }
            }
        }

        function shootArrow() {
            playSound('shoot');
            if (gameState.lastArrowDir.x === 0 && gameState.lastArrowDir.y === 0) return;
            const isMulti = gameState.playerUpgrades.includes('multi');
            const isFast = gameState.playerUpgrades.includes('fastArrow');
            const isBig = gameState.playerUpgrades.includes('bigArrow');
            const arrowSz = isBig ? 18 : 10;
            const arrowSpeed = 10; // Varsayılan ok hızı
            const speed = isFast ? 18 : arrowSpeed;
            if (!isMulti) {
                gameState.arrows.push({
                    x: gameState.player.x + gameState.player.size/2,
                    y: gameState.player.y + gameState.player.size/2,
                    dx: gameState.lastArrowDir.x * speed,
                    dy: gameState.lastArrowDir.y * speed,
                    size: arrowSz
                });
            } else {
                // 3 yöne yayılım atış
                const angles = [0, Math.PI/8, -Math.PI/8];
                const baseAngle = Math.atan2(gameState.lastArrowDir.y, gameState.lastArrowDir.x);
                for (let a of angles) {
                    const angle = baseAngle + a;
                    gameState.arrows.push({
                        x: gameState.player.x + gameState.player.size/2,
                        y: gameState.player.y + gameState.player.size/2,
                        dx: Math.cos(angle) * speed,
                        dy: Math.sin(angle) * speed,
                        size: arrowSz
                    });
                }
            }
        }

        function startDash() {
            playSound('dash');
            gameState.player.isDashing = true;
            gameState.player.dashTimer = gameState.player.dashDuration;
            gameState.player.dashCooldown = gameState.player.dashCooldownTime;

            let dashDirX = 0;
            let dashDirY = 0;
            if (keys['ArrowUp'] || keys['w'] || keys['W']) dashDirY = -1;
            if (keys['ArrowDown'] || keys['s'] || keys['S']) dashDirY = 1;
            if (keys['ArrowLeft'] || keys['a'] || keys['A']) dashDirX = -1;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) dashDirX = 1;

            // Eğer hareket tuşuna basılmıyorsa, son nişan alınan yöne doğru dash at
            if (dashDirX === 0 && dashDirY === 0) {
                dashDirX = gameState.lastArrowDir.x;
                dashDirY = gameState.lastArrowDir.y;
            }

            // Yön vektörünü normalize et (her yöne aynı hızda gitmek için)
            const magnitude = Math.sqrt(dashDirX * dashDirX + dashDirY * dashDirY);
            if (magnitude > 0) {
                gameState.player.dashDirection.x = dashDirX / magnitude;
                gameState.player.dashDirection.y = dashDirY / magnitude;
            } else {
                // Hala yön yoksa (oyun başlangıcı gibi), varsayılan olarak yukarı dash at
                gameState.player.dashDirection.x = 0;
                gameState.player.dashDirection.y = -1;
            }
        }

        function movePlayer() {
            // Dash bekleme süresini azalt
            if (gameState.player.dashCooldown > 0 && !gameState.player.isDashing) {
                gameState.player.dashCooldown--;
            }

            // Dash halindeyken hareket
            if (gameState.player.isDashing) {
                gameState.player.dashTimer--;

                const nextX = gameState.player.x + gameState.player.dashDirection.x * gameState.player.dashSpeed;
                const nextY = gameState.player.y + gameState.player.dashDirection.y * gameState.player.dashSpeed;

                gameState.player.x = Math.max(0, Math.min(canvas.width - gameState.player.size, nextX));
                gameState.player.y = Math.max(0, Math.min(canvas.height - gameState.player.size, nextY));

                // Dash sırasında görsel efekt için parçacık oluştur
                if (typeof spawnParticles === "function") {
                    spawnParticles(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2, '#ffffff');
                }

                if (gameState.player.dashTimer <= 0) {
                    gameState.player.isDashing = false;
                }
                return; // Dash sırasında normal hareketi atla
            }

            // Normal hareket
            gameState.player.dx = 0; gameState.player.dy = 0;
            let spd = gameState.player.speed; // Kalıcı yükseltme varsa bu değer zaten artmış olur.
            if (gameState.playerUpgrades.includes('speed')) spd += 3; // Geçici "Hızlı Hareket" ödülü hızı 3 birim artırır.
            if (gameState.speedBoostActive) spd += 4;
            if (keys['ArrowUp'] || keys['w'] || keys['W']) gameState.player.dy = -spd;
            if (keys['ArrowDown'] || keys['s'] || keys['S']) gameState.player.dy = spd;
            if (keys['ArrowLeft'] || keys['a'] || keys['A']) gameState.player.dx = -spd;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) gameState.player.dx = spd;
            let nextX = gameState.player.x + gameState.player.dx;
            let nextY = gameState.player.y + gameState.player.dy;

            // Engel çarpışma kontrolü
            for (const ob of gameState.obstacles) {
                // isCircleRectColliding fonksiyonu main.js'de tanımlı olduğu için burada kullanılabilir.
                if (isCircleRectColliding(nextX + gameState.player.size / 2, nextY + gameState.player.size / 2, gameState.player.size / 2, ob.x, ob.y, ob.w, ob.h)) {
                    // Çarpışma varsa, hareketi engelle.
                    nextX = gameState.player.x;
                    nextY = gameState.player.y;
                    break; // Bir engelle çarpışmak yeterli.
                }
            }

            gameState.player.x = Math.max(0, Math.min(canvas.width - gameState.player.size, nextX));
            gameState.player.y = Math.max(0, Math.min(canvas.height - gameState.player.size, nextY));
            // Kalkan süresi
            if (gameState.shieldInvincible) {
                gameState.shieldInvincibleTimer--;
                if (gameState.shieldInvincibleTimer <= 0) {
                    gameState.shieldInvincible = false;
                }
            }
            handlePlayerPortal();
        }
