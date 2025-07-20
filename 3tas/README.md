# 3 Taş Oyunu

Klasik 3 Taş (Tic-Tac-Toe) oyununun web tabanlı versiyonu.

## Nasıl Oynanır

### Yerleştirme Aşaması
1. Oyun, web tarayıcısında çalışan bir uygulamadır.
2. İki oyuncu sırayla 3'er taş yerleştirir (X ve O).
3. Taş yerleştirmek için tahtadaki boş hücrelere tıklamanız yeterlidir.

### Hareket Aşaması
4. Tüm taşlar yerleştirildikten sonra, oyuncular sırayla kendi taşlarından birini hareket ettirir.
5. Hareket ettirmek için önce taşınıza, sonra gitmek istediğiniz boş hücreye tıklayın.
6. Taşlar sadece yatay veya dikey olarak bir kare hareket edebilir (komşu boş hücrelere).
7. Yatay veya dikey olarak üç taşını sıralayan ilk oyuncu kazanır (çapraz dizilişler kazanç sayılmaz).

## Oyun Modları

- **İki Oyunculu Mod**: İki kişi karşılıklı oynar
- **Bilgisayara Karşı (Siz Başlarsınız)**: Siz X olarak başlarsınız, bilgisayar O olur
- **Bilgisayara Karşı (Bilgisayar Başlar)**: Bilgisayar X olarak başlar, siz O olursunuz

## Çalıştırma

Oyunu çalıştırmak için `index.html` dosyasını bir web tarayıcısında açmanız yeterlidir.

## Dosyalar

- `index.html`: Oyunun HTML yapısı
- `style.css`: Oyunun görsel stilleri
- `script.js`: Oyun mantığını içeren JavaScript kodu

## Zorluk Seviyeleri

- **Kolay**: Bilgisayar rastgele hamleler yapar
- **Orta**: Bilgisayar bazen akıllı hamleler yapar, bazen hatalar yapar
- **Zor**: Bilgisayar her zaman en iyi hamleyi yapmaya çalışır

## Geliştirme Fikirleri

- Oyun istatistikleri tutulabilir
- Çoklu oyuncu desteği eklenebilir
- Mobil uyumluluk iyileştirilebilir
- Ses efektleri eklenebilir