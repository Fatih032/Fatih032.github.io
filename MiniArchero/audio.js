// Sesleri tutacak olan nesne
const sounds = {};

/**
 * Gerekli tüm ses dosyalarını yükler ve başlangıç ses seviyelerini ayarlar.
 * Bu fonksiyon oyun başladığında bir kez çağrılmalıdır.
 */
function loadSounds() {
    // Kenney.nl'den indirilen yerel ses dosyaları (.wav formatında)
    sounds.shoot = new Audio('sounds/laser.ogg');
    sounds.hit = new Audio('sounds/explosion.ogg');
    sounds.coin = new Audio('sounds/coin.ogg');
    sounds.playerHit = new Audio('sounds/hit.ogg');
    sounds.levelUp = new Audio('sounds/powerup.ogg');
    sounds.dash = new Audio('sounds/whoosh.ogg');

    // Tüm seslerin başlangıç ses seviyesini ayarla
    for (const key in sounds) {
        sounds[key].volume = 0.3; // Ses seviyesini %30 yap (isteğe bağlı)
    }
}

function playSound(name) {
    // Sesi klonlayarak aynı anda birden fazla kez çalınabilmesini sağla
    if (sounds[name]) {
        const audio = sounds[name].cloneNode();
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Otomatik oynatma engellendi veya başka bir hata oluştu.
                // Bu hatayı konsolda görmek normal olabilir, özellikle kullanıcı sayfayla etkileşime geçmeden önce.
                // Bu, oyunun çökmesini engeller.
                console.log(`Ses oynatılamadı: ${name}. Tarayıcı etkileşim bekliyor olabilir. Hata: ${error.message}`);
            });
        }
    }
}