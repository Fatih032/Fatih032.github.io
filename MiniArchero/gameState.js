// Oyunun tüm durumunu tek bir yerden yönetmek için merkezi nesne.
window.gameState = {
    // Ana oyun durumu
    level: 1,
    maxLevel: 100,
    isGameOver: false,
    gameOverTimer: 0,
    isUpgradeScreenOpen: false,
    shopOpen: false,
    isPaused: false,
    showLevelInfo: true, // Bölüm bilgisini gösterme bayrağı

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

    // Seviye Temaları ve Bölüm Tasarımları
    themes: [
        // Bölüm 1-5: Zindan
        { 
            name: 'Zindan', 
            backgroundColor: '#333333', 
            obstacleColor: '#888888',
            enemyColor: '#e53935',
            shooterColor: '#ab47bc',
            exploderColor: '#ffa726',
            portalColor: '#00e6ff',
            description: 'Karanlık ve nemli bir zindan. Duvarlardan su damlıyor.'
        },
        // Bölüm 6-10: Orman
        { 
            name: 'Orman', 
            backgroundColor: '#2E7D32', 
            obstacleColor: '#5D4037',
            enemyColor: '#8BC34A',
            shooterColor: '#CDDC39',
            exploderColor: '#FF5722',
            portalColor: '#29B6F6',
            description: 'Sık ağaçlarla dolu bir orman. Yapraklar hışırdıyor.'
        },
        // Bölüm 11-15: Çöl
        { 
            name: 'Çöl', 
            backgroundColor: '#F57F17', 
            obstacleColor: '#795548',
            enemyColor: '#FF9800',
            shooterColor: '#F44336',
            exploderColor: '#D32F2F',
            portalColor: '#26C6DA',
            description: 'Kavurucu sıcaklıktaki çöl. Kum fırtınası yaklaşıyor.'
        },
        // Bölüm 16-20: Buz Mağarası
        { 
            name: 'Buz Mağarası', 
            backgroundColor: '#01579B', 
            obstacleColor: '#E0E0E0',
            enemyColor: '#4FC3F7',
            shooterColor: '#B3E5FC',
            exploderColor: '#81D4FA',
            portalColor: '#00BCD4',
            description: 'Dondurucu soğuktaki buz mağarası. Her yer buz tutmuş.'
        },
        // Bölüm 21-25: Volkan
        { 
            name: 'Volkan', 
            backgroundColor: '#BF360C', 
            obstacleColor: '#3E2723',
            enemyColor: '#FF5722',
            shooterColor: '#FFAB00',
            exploderColor: '#FF6F00',
            portalColor: '#FFC107',
            description: 'Aktif bir volkanın içi. Lavlar her an patlayabilir.'
        },
        // Bölüm 26-30: Uzay İstasyonu
        { 
            name: 'Uzay İstasyonu', 
            backgroundColor: '#263238', 
            obstacleColor: '#546E7A',
            enemyColor: '#4DD0E1',
            shooterColor: '#00BCD4',
            exploderColor: '#0097A7',
            portalColor: '#18FFFF',
            description: 'Terk edilmiş bir uzay istasyonu. Robotlar kontrolü ele geçirmiş.'
        },
        // Bölüm 31-35: Kristal Mağarası
        { 
            name: 'Kristal Mağarası', 
            backgroundColor: '#4A148C', 
            obstacleColor: '#6A1B9A',
            enemyColor: '#9C27B0',
            shooterColor: '#BA68C8',
            exploderColor: '#E1BEE7',
            portalColor: '#CE93D8',
            description: 'Renkli kristallerle dolu büyülü bir mağara. Her yer parlıyor.'
        },
        // Bölüm 36-40: Gökyüzü Adaları
        { 
            name: 'Gökyüzü Adaları', 
            backgroundColor: '#1A237E', 
            obstacleColor: '#BBDEFB',
            enemyColor: '#64B5F6',
            shooterColor: '#2196F3',
            exploderColor: '#1976D2',
            portalColor: '#90CAF9',
            description: 'Gökyüzünde süzülen yüzen adalar. Bulutların üzerinde savaş.'
        },
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