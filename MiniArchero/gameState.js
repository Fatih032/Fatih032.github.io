// Oyunun tüm durumunu tek bir yerden yönetmek için merkezi nesne.
window.gameState = {
    // Ana oyun durumu
    level: 1,
    maxLevel: 100,
    isGameOver: false,
    gameOverTimer: 0,
    isUpgradeScreenOpen: false,
    shopOpen: false,

    // Oyuncu durumu
    player: {
        x: 400,
        y: 400,
        size: 30,
        color: '#4caf50',
        speed: 5,
        dx: 0,
        dy: 0,
        // Dash özellikleri
        isDashing: false,
        dashTimer: 0,
        dashCooldown: 0,
        dashDuration: 8,      // Dash süresi (frame)
        dashCooldownTime: 90, // 1.5 saniye bekleme süresi
        dashSpeed: 20,        // Dash hızı
        dashDirection: { x: 0, y: 0 }
    },
    lives: 3,
    maxLives: 5, // Dükkanda 5'e kadar can alınabildiği için 5 olmalı
    playerUpgrades: [],
    permanentSpeedUpgrade: false, // Kalıcı hız yükseltmesi
    permanentDashUpgrade: false, // Kalıcı dash bekleme süresi yükseltmesi
    permanentVampireUpgrade: false, // Kalıcı can çalma yükseltmesi
    maxHealthUpgraded: false, // Kalıcı can yükseltmesi satın alındı mı?
    lastArrowDir: { x: 0, y: -1 }, // Son nişan alma yönü
    playerPortalCooldown: 0,

    // Varlıklar (Entities)
    enemies: [],
    arrows: [],
    boss: null,
    bossProjectiles: [], 
    enemyProjectiles: [],
    explosions: [],
    particles: [],
    coins: [],

    // Toplanabilirler ve Ödüller
    currentUpgradeChoices: [], // Oyuncuya sunulan 3 yükseltme seçeneği
    heart: null,
    speedBoost: null,
    powerupItem: null, // Toplanabilir güçlendirme öğesi

    // Geçici Efektler ve Zamanlayıcılar
    speedBoostActive: false,
    speedBoostTimer: 0,
    shieldActive: false, // Kalkanın ilk temas anı için (görsel efekt)
    shieldInvincible: false, // Kalkanın aktif olup olmadığı
    shieldInvincibleTimer: 0,
    magnetActive: false, // Mıknatıs aktif mi?
    magnetTimer: 0,      // Mıknatıs zamanlayıcısı

    // Dünya ve Çevre
    door: {
        x: 380,
        y: 20,
        width: 40,
        height: 20,
        open: false
    },
    doorAnim: {
        progress: 0,
        opening: false
    },
    obstacles: [], // Dinamik engelleri tutacak dizi

    // Ekonomi
    coinCount: 20,

    // Sabitler (Değişmeyen Değerler)
    UPGRADE_LIST: [
        { key: 'multi', name: 'Çoklu Atış', desc: '3 yöne ok atışı' },
        { key: 'fastArrow', name: 'Hızlı Ok', desc: 'Oklar daha hızlı' },
        { key: 'bigArrow', name: 'Büyük Ok', desc: 'Oklar daha büyük' },
        { key: 'speed', name: 'Hızlı Hareket', desc: 'Oyuncu daha hızlı' },
        { key: 'shield', name: 'Kalkan', desc: 'Bir kez temasta ölmez' }
    ],

    // Seviye Temaları
    themes: [
        { name: 'Zindan', backgroundColor: '#333333', obstacleColor: '#888888' },
        { name: 'Orman', backgroundColor: '#2E7D32', obstacleColor: '#5D4037' },
        { name: 'Çöl', backgroundColor: '#F57F17', obstacleColor: '#795548' },
        { name: 'Buz Mağarası', backgroundColor: '#01579B', obstacleColor: '#E0E0E0' },
    ],

    // Oyun zorluk ayarları
    difficulty: {
        enemyBaseCount: 5,          // Başlangıçtaki düşman sayısı
        enemyPerLevel: 0.5,         // Her bölümde düşman sayısındaki artış (0.5 = 2 bölümde 1 düşman)
        enemySpeed: 1.5,            // Normal düşmanların hızı
        shooterAttackCooldown: 120, // Nişancıların atış sıklığı (frame)
        bossBaseHp: 5,              // Boss'ların başlangıç canı
        bossHpPerLevel: 0.5,        // Her bölümde boss canındaki artış
        coinDropChance: 0.5,        // Düşmandan altın düşme ihtimali (%50)
        exploderRadius: 100,        // Patlayan düşmanın patlama yarıçapı
        vampireLifestealChance: 0.1 // Vampir Saldırısı can çalma şansı (%10)
    }
};