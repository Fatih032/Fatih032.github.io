export const TILE_SIZE = 40; // Her bir karenin piksel boyutu
export const GRID_WIDTH = 15; // Izgara genişliği (kare sayısı)
export const GRID_HEIGHT = 13; // Izgara yüksekliği (kare sayısı)
export const BOMB_TIMER = 3000; // 3 saniye
export const EXPLOSION_DURATION = 500; // 0.5 saniye
export const INITIAL_TIME = 300; // Saniye cinsinden başlangıç süresi
export const SCORE_PER_BRICK = 10; // Tuğla başına skor
export const BOMB_SLIDE_SPEED = 100; // Bombanın kayma hızı (ms)
export const SCORE_PER_SECOND = 1; // Kalan saniye başına skor
export const SCORE_PER_ENEMY = 100; // Düşman başına skor
export const PLAYER_MOVE_COOLDOWN_DEFAULT = 150; // Oyuncu hareket bekleme süresi (ms)
export const PLAYER_MOVE_COOLDOWN_FAST = 100; // Hızlı hareket bekleme süresi
export const BACKGROUND_COLOR = '#01933eff'; // Yeşil arkaplan rengi

export const TILE_TYPE = {
    EMPTY: 0,
    SOLID_WALL: 1,
    BRICK_WALL: 2,
    DOOR: 3,
    BRICK_WITH_DOOR: 4,
    ENEMY: 5,
    POWERUP_BOMB: 6,
    BRICK_WITH_POWERUP_BOMB: 7,
    POWERUP_FLAME: 8,
    BRICK_WITH_POWERUP_FLAME: 9,
    POWERUP_KICK: 10, // Bomba tekmeleme güçlendirmesi
    BRICK_WITH_POWERUP_KICK: 11, // Güçlendirme içeren tuğla
    POWERUP_BOMB_PASS: 12, // Bomba üzerinden geçme
    BRICK_WITH_POWERUP_BOMB_PASS: 13, // Güçlendirme içeren tuğla
    POWERUP_SPEED: 14, // Hız artırma güçlendirmesi
    BRICK_WITH_POWERUP_SPEED: 15, // Güçlendirme içeren tuğla
    POWERUP_PIERCE: 16, // Delici bomba güçlendirmesi
    BRICK_WITH_POWERUP_PIERCE: 17, // Güçlendirme içeren tuğla
    POWERUP_GHOST: 18, // Duvarlardan geçme güçlendirmesi
    BRICK_WITH_POWERUP_GHOST: 19 // Güçlendirme içeren tuğla
};