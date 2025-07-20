document.addEventListener('DOMContentLoaded', () => {
    const hucreler = document.querySelectorAll('.hucre');
    const durumMetni = document.getElementById('durum');
    const yeniOyunButonu = document.getElementById('yeniOyun');
    const bilgisayarSecimi = document.getElementById('bilgisayarSecimi');
    const zorlukSecimi = document.getElementById('zorlukSecimi');
    
    let oyunDevam = true;
    let siradakiOyuncu = 'X';
    let oyunDurumu = ['', '', '', '', '', '', '', '', ''];
    let oyunAsamasi = 'yerleştirme'; // 'yerleştirme' veya 'hareket'
    let yerleştirilmisTaslar = { 'X': 0, 'O': 0 };
    let secilenTas = null;
    let bilgisayarOyuncu = null; // 'X' veya 'O' veya null (iki oyunculu mod)
    let zorlukSeviyesi = 'orta'; // 'kolay', 'orta', 'zor'
    
    const kazanmaKombinasyonlari = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Yatay
        [0, 3, 6], [1, 4, 7], [2, 5, 8]  // Dikey (çapraz yok)
    ];
    
    function guncelleDurumMetni() {
        if (!oyunDevam) return;

        let mesaj = '';
        if (bilgisayarOyuncu) { // Bilgisayara karşı mod
            if (siradakiOyuncu === bilgisayarOyuncu) {
                mesaj = `Bilgisayar (${siradakiOyuncu}) düşünüyor...`;
            } else {
                mesaj = oyunAsamasi === 'yerleştirme'
                    ? `Siz (${siradakiOyuncu}) taşınızı yerleştirin (${3 - yerleştirilmisTaslar[siradakiOyuncu]} taş kaldı)`
                    : `Siz (${siradakiOyuncu}) bir taşınızı hareket ettirin`;
            }
        } else { // İki oyunculu mod
            mesaj = oyunAsamasi === 'yerleştirme'
                ? `Oyuncu ${siradakiOyuncu} taşını yerleştirsin (${3 - yerleştirilmisTaslar[siradakiOyuncu]} taş kaldı)`
                : `Oyuncu ${siradakiOyuncu} bir taşını hareket ettirsin`;
        }
        durumMetni.textContent = mesaj;
    }

    function sonrakiTuraGec() {
        if (kazananKontrol()) return;

        if (oyunAsamasi === 'yerleştirme' && yerleştirilmisTaslar['X'] === 3 && yerleştirilmisTaslar['O'] === 3) {
            oyunAsamasi = 'hareket';
        }

        siradakiOyuncu = siradakiOyuncu === 'X' ? 'O' : 'X';
        guncelleDurumMetni();

        if (bilgisayarOyuncu === siradakiOyuncu && oyunDevam) {
            setTimeout(bilgisayarHamlesiYap, 700);
        }
    }

    function hucreKontrol(hucre, index) {
        if (!oyunDevam) return;
        if (bilgisayarOyuncu === siradakiOyuncu) return; // Bilgisayarın sırasında oyuncu hamle yapamaz
        
        if (oyunAsamasi === 'yerleştirme') {
            // Yerleştirme aşaması
            if (oyunDurumu[index] !== '') return;
            
            // Taşı yerleştir
            oyunDurumu[index] = siradakiOyuncu;
            hucre.textContent = siradakiOyuncu;
            hucre.classList.add(siradakiOyuncu.toLowerCase());
            
            yerleştirilmisTaslar[siradakiOyuncu]++;
            
            sonrakiTuraGec();
        } else {
            // Hareket aşaması
            if (secilenTas === null) {
                // Taş seçme
                if (oyunDurumu[index] === siradakiOyuncu) {
                    secilenTas = index;
                    hucre.classList.add('secili');
                    durumMetni.textContent = `Taşı nereye hareket ettirmek istiyorsunuz?`;
                }
            } else {
                // Taşı hareket ettirme
                if (oyunDurumu[index] === '') {
                    // Geçerli bir hareket mi kontrol et (sadece bir kare hareket edebilir)
                    if (hareketGecerliMi(secilenTas, index)) {
                        // Eski konumu temizle
                        const eskiHucre = document.querySelector(`.hucre[data-index="${secilenTas}"]`);
                        eskiHucre.textContent = '';
                        eskiHucre.classList.remove(siradakiOyuncu.toLowerCase(), 'secili');
                        oyunDurumu[secilenTas] = '';
                        
                        // Yeni konuma taşı
                        hucre.textContent = siradakiOyuncu;
                        hucre.classList.add(siradakiOyuncu.toLowerCase());
                        oyunDurumu[index] = siradakiOyuncu;
                        
                        secilenTas = null;
                        
                        sonrakiTuraGec();
                    } else {
                        durumMetni.textContent = `Geçersiz hareket! Sadece bir kare hareket edebilirsiniz.`;
                    }
                } else if (oyunDurumu[index] === siradakiOyuncu) {
                    // Başka bir taş seçildi
                    document.querySelector(`.hucre[data-index="${secilenTas}"]`).classList.remove('secili');
                    secilenTas = index;
                    hucre.classList.add('secili');
                } else {
                    // Rakip taşa tıklandı, seçimi iptal et
                    document.querySelector(`.hucre[data-index="${secilenTas}"]`).classList.remove('secili');
                    secilenTas = null;
                    
                    if (bilgisayarOyuncu && bilgisayarOyuncu !== siradakiOyuncu) {
                        durumMetni.textContent = `Siz (${siradakiOyuncu}) bir taşınızı hareket ettirin`;
                    } else {
                        durumMetni.textContent = `Oyuncu ${siradakiOyuncu} bir taşını hareket ettirsin`;
                    }
                }
            }
        }
    }
    

    
    function hareketGecerliMi(eskiIndex, yeniIndex) {
        const hareketler = {
            0: [1, 3],
            1: [0, 2, 4],
            2: [1, 5],
            3: [0, 4, 6],
            4: [1, 3, 5, 7],
            5: [2, 4, 8],
            6: [3, 7],
            7: [4, 6, 8],
            8: [5, 7]
        };
        
        return hareketler[eskiIndex].includes(Number(yeniIndex));
    }
    
    function getOyuncuTaslari(oyuncu, durum) {
        const anlikDurum = durum || oyunDurumu;
        const taslar = [];
        for (let i = 0; i < anlikDurum.length; i++) {
            if (anlikDurum[i] === oyuncu) taslar.push(i);
        }
        return taslar;
    }

    function getGecerliHareketler(tas, durum) {
        const anlikDurum = durum || oyunDurumu;
        // hareketGecerliMi fonksiyonundaki hareketler objesiyle aynı, gelecekte birleştirilebilir.
        const hareketler = {
            0: [1, 3], 1: [0, 2, 4], 2: [1, 5],
            3: [0, 4, 6], 4: [1, 3, 5, 7], 5: [2, 4, 8],
            6: [3, 7], 7: [4, 6, 8], 8: [5, 7]
        };
        if (!hareketler[tas]) return [];
        return hareketler[tas].filter(h => anlikDurum[h] === '');
    }

    function getTumGecerliHamleler(oyuncu, durum) {
        const taslar = getOyuncuTaslari(oyuncu, durum);
        // flatMap, iç içe dizileri tek bir diziye düzleştirir.
        // [{tas: 0, hedef: 1}, {tas: 0, hedef: 3}, ...] gibi bir yapı oluşturur.
        return taslar.flatMap(tas => getGecerliHareketler(tas, durum).map(hedef => ({ tas, hedef })));
    }

    function kazananKontrol() {
        for (let i = 0; i < kazanmaKombinasyonlari.length; i++) {
            const [a, b, c] = kazanmaKombinasyonlari[i];
            
            if (oyunDurumu[a] && oyunDurumu[a] === oyunDurumu[b] && oyunDurumu[a] === oyunDurumu[c]) {
                if (bilgisayarOyuncu) {
                    if (oyunDurumu[a] === bilgisayarOyuncu) {
                        durumMetni.textContent = `Bilgisayar (${oyunDurumu[a]}) kazandı!`;
                    } else {
                        durumMetni.textContent = `Tebrikler! Siz (${oyunDurumu[a]}) kazandınız!`;
                    }
                } else {
                    durumMetni.textContent = `Oyuncu ${oyunDurumu[a]} kazandı!`;
                }
                
                oyunDevam = false;
                return true;
            }
        }
        return false;
    }
    
    function bilgisayarHamlesiYap() {
        // Bilgisayarın sırası değilse veya oyun bittiyse işlem yapma
        if (!oyunDevam || bilgisayarOyuncu !== siradakiOyuncu) return;
        
        // Bilgisayarın düşündüğünü göstermek için durum mesajını güncelle
        durumMetni.textContent = `Bilgisayar (${siradakiOyuncu}) düşünüyor...`;
        
        // Kısa bir gecikme ekle
        setTimeout(() => {
            if (oyunAsamasi === 'yerleştirme') {
                // Yerleştirme aşaması için yapay zeka
                const index = bilgisayarYerlestirmeStratejisi();
                
                // Hamleyi yap
                const hucre = document.querySelector(`.hucre[data-index="${index}"]`);
                oyunDurumu[index] = siradakiOyuncu;
                hucre.textContent = siradakiOyuncu;
                hucre.classList.add(siradakiOyuncu.toLowerCase());
                
                yerleştirilmisTaslar[siradakiOyuncu]++;
                
                sonrakiTuraGec();
            } else {
                // Hareket aşaması için yapay zeka
                const guncelBilgisayarTaslari = getOyuncuTaslari(bilgisayarOyuncu);
                
                // Bilgisayarın taşı yoksa hata var demektir
                if (guncelBilgisayarTaslari.length === 0) {
                    console.error('Hata: Bilgisayarın taşı bulunamadı!', oyunDurumu, bilgisayarOyuncu);
                    return;
                }
                
                const [eskiIndex, yeniIndex] = bilgisayarHareketStratejisi();
                
                // Bilgisayarın kendi taşını hareket ettirdiğinden emin ol
                if (oyunDurumu[eskiIndex] !== bilgisayarOyuncu) {
                    console.error('Hata: Bilgisayar yanlış taşı seçti!', eskiIndex, oyunDurumu[eskiIndex]);
                    // Yeniden deneme
                    setTimeout(bilgisayarHamlesiYap, 100);
                    return;
                }
                
                // Hedefin boş olduğundan emin ol
                if (oyunDurumu[yeniIndex] !== '') {
                    console.error('Hata: Hedef hücre dolu!', yeniIndex, oyunDurumu[yeniIndex]);
                    // Yeniden deneme
                    setTimeout(bilgisayarHamlesiYap, 100);
                    return;
                }
                
                // Görsel olarak taşı seç
                const eskiHucre = document.querySelector(`.hucre[data-index="${eskiIndex}"]`);
                eskiHucre.classList.add('secili');
                
                // Kısa bir gecikme ile hareket ettir
                setTimeout(() => {
                    // Eski konumu temizle
                    eskiHucre.textContent = '';
                    eskiHucre.classList.remove(siradakiOyuncu.toLowerCase(), 'secili');
                    oyunDurumu[eskiIndex] = '';
                    
                    // Yeni konuma taşı
                    const yeniHucre = document.querySelector(`.hucre[data-index="${yeniIndex}"]`);
                    yeniHucre.textContent = siradakiOyuncu;
                    yeniHucre.classList.add(siradakiOyuncu.toLowerCase());
                    oyunDurumu[yeniIndex] = siradakiOyuncu;
                    
                    sonrakiTuraGec();
                }, 500);
            }
        }, 700);
    }
    
    function bilgisayarYerlestirmeStratejisi() {
        const rakip = bilgisayarOyuncu === 'X' ? 'O' : 'X';
        const bosHucreler = oyunDurumu.map((deger, index) => deger === '' ? index : -1).filter(i => i !== -1);
        
        // Kolay seviyede: Tamamen rastgele hamle yap
        if (zorlukSeviyesi === 'kolay') {
            return bosHucreler[Math.floor(Math.random() * bosHucreler.length)];
        }
        
        // Orta seviyede: Stratejik hamle yap ama bazen hata yap
        if (zorlukSeviyesi === 'orta') {
            // %70 ihtimalle akıllı hamle yap, %30 ihtimalle rastgele hamle yap
            if (Math.random() > 0.3) {
                // 1. Orta kare boşsa, oraya yerleştir
                if (oyunDurumu[4] === '') return 4;
                
                // 2. Köşeler boşsa, rastgele bir köşeye yerleştir
                const koseler = [0, 2, 6, 8].filter(i => oyunDurumu[i] === '');
                if (koseler.length > 0) {
                    return koseler[Math.floor(Math.random() * koseler.length)];
                }
            }
            
            // Rastgele bir yere yerleştir
            return bosHucreler[Math.floor(Math.random() * bosHucreler.length)];
        }
        
        // Zor seviyede: Her zaman en iyi hamleyi yap
        
        // 1. İki taşımız yan yanaysa ve üçüncü hücre boşsa, kazanmak için oraya yerleştir
        if (yerleştirilmisTaslar[bilgisayarOyuncu] >= 2) {
            for (const [a, b, c] of kazanmaKombinasyonlari) {
                // İki taşımız var mı ve üçüncü hücre boş mu?
                if (oyunDurumu[a] === bilgisayarOyuncu && oyunDurumu[b] === bilgisayarOyuncu && oyunDurumu[c] === '') {
                    return c;
                }
                if (oyunDurumu[a] === bilgisayarOyuncu && oyunDurumu[c] === bilgisayarOyuncu && oyunDurumu[b] === '') {
                    return b;
                }
                if (oyunDurumu[b] === bilgisayarOyuncu && oyunDurumu[c] === bilgisayarOyuncu && oyunDurumu[a] === '') {
                    return a;
                }
            }
        }
        
        // 2. Rakibin iki taşı yan yanaysa ve üçüncü hücre boşsa, kazanmasını engellemek için oraya yerleştir
        if (yerleştirilmisTaslar[rakip] >= 2) {
            for (const [a, b, c] of kazanmaKombinasyonlari) {
                // Rakibin iki taşı var mı ve üçüncü hücre boş mu?
                if (oyunDurumu[a] === rakip && oyunDurumu[b] === rakip && oyunDurumu[c] === '') {
                    return c;
                }
                if (oyunDurumu[a] === rakip && oyunDurumu[c] === rakip && oyunDurumu[b] === '') {
                    return b;
                }
                if (oyunDurumu[b] === rakip && oyunDurumu[c] === rakip && oyunDurumu[a] === '') {
                    return a;
                }
            }
        }
        
        // 3. Orta kare boşsa, oraya yerleştir (en iyi başlangıç hamlesi)
        if (oyunDurumu[4] === '') return 4;
        
        // 4. Köşeler boşsa ve rakip orta karedeyse, köşeye yerleştir
        if (oyunDurumu[4] === rakip) {
            const koseler = [0, 2, 6, 8].filter(i => oyunDurumu[i] === '');
            if (koseler.length > 0) {
                return koseler[Math.floor(Math.random() * koseler.length)];
            }
        }
        
        // 5. Rakip köşedeyse, karşı köşeye yerleştir
        const koseKarsiliklari = {
            0: 8,
            2: 6,
            6: 2,
            8: 0
        };
        
        for (const [kose, karsiKose] of Object.entries(koseKarsiliklari)) {
            if (oyunDurumu[kose] === rakip && oyunDurumu[karsiKose] === '') {
                return parseInt(karsiKose);
            }
        }
        
        // 6. Köşeler boşsa, rastgele bir köşeye yerleştir
        const koseler = [0, 2, 6, 8].filter(i => oyunDurumu[i] === '');
        if (koseler.length > 0) {
            return koseler[Math.floor(Math.random() * koseler.length)];
        }
        
        // 7. Boş herhangi bir yere yerleştir
        return bosHucreler[Math.floor(Math.random() * bosHucreler.length)];
    }
    
    function bilgisayarHareketStratejisi() {
        if (getOyuncuTaslari(bilgisayarOyuncu).length === 0) {
            console.error('Hata: Bilgisayarın hareket edecek taşı bulunamadı!', oyunDurumu, bilgisayarOyuncu);
            return [0, 0]; // Hata durumunda varsayılan değer
        }
        
        const rakip = bilgisayarOyuncu === 'X' ? 'O' : 'X';
        let hamle = null;
        
        if (zorlukSeviyesi === 'kolay') {
            return rastgeleHareket();
        }

        if (zorlukSeviyesi === 'orta') {
            // %70 ihtimalle akıllı hamle yap
            if (Math.random() > 0.3) {
                // Öncelik sırası: Kazan, Engelle
                hamle = findWinningMove(bilgisayarOyuncu);
                if (hamle) return hamle;

                hamle = findWinningMove(rakip); // Rakibin kazanma hamlesini bul (engellemek için)
                if (hamle) return hamle;
            }
            // Akıllı hamle yapılmadıysa veya bulunamadıysa rastgele oyna
            return rastgeleHareket();
        }

        if (zorlukSeviyesi === 'zor') {
            // Öncelik sırası: Kazan, Engelle, Stratejik oyna
            hamle = findWinningMove(bilgisayarOyuncu);
            if (hamle) return hamle;

            hamle = findWinningMove(rakip); // Rakibin kazanma hamlesini bul (engellemek için)
            if (hamle) return hamle;

            // TODO: enIyiHareketi fonksiyonunu da yeni yapıya göre düzenle
            hamle = enIyiHareketi();
            if (hamle) return hamle;
        }
        
        // Son kontrol: Hamle geçerli mi?
        if (!hamle || hamle.length !== 2 || oyunDurumu[hamle[0]] !== bilgisayarOyuncu) {
            console.warn('Geçersiz hamle, rastgele hamle yapılıyor', hamle);
            hamle = rastgeleHareket();
        }
        
        return hamle;
    }
    
    function rastgeleHareket() {
        const tumHamleler = getTumGecerliHamleler(bilgisayarOyuncu);

        if (tumHamleler.length === 0) {
            console.warn('Hareket edebilen taş bulunamadı!');
            return [0, 0]; // Bu durumda oyun zaten bitmiş olmalı
        }
        
        const rastgeleHamle = tumHamleler[Math.floor(Math.random() * tumHamleler.length)];
        return [rastgeleHamle.tas, rastgeleHamle.hedef];
    }
    
    function findWinningMove(oyuncu, durum) {
        const anlikDurum = durum || oyunDurumu;
        const olasiHamleler = getTumGecerliHamleler(oyuncu, anlikDurum);

        for (const hamle of olasiHamleler) {
            // Geçici olarak hamleyi yap ve durumu kopyala
            const geciciDurum = [...anlikDurum];
            geciciDurum[hamle.tas] = '';
            geciciDurum[hamle.hedef] = oyuncu;

            // Kazanma kontrolü
            for (const [a, b, c] of kazanmaKombinasyonlari) {
                if (geciciDurum[a] === oyuncu && geciciDurum[a] === geciciDurum[b] && geciciDurum[a] === geciciDurum[c]) {
                    return [hamle.tas, hamle.hedef]; // Kazanma hamlesini bulduk!
                }
            }
        }
        return null; // Kazanma hamlesi yok
    }
    
    function enIyiHareketi() {
        const rakip = bilgisayarOyuncu === 'X' ? 'O' : 'X';
        const hareketler = {
            0: [1, 3],
            1: [0, 2, 4],
            2: [1, 5],
            3: [0, 4, 6],
            4: [1, 3, 5, 7],
            5: [2, 4, 8],
            6: [3, 7],
            7: [4, 6, 8],
            8: [5, 7]
        };
        
        // Stratejik hamle puanlama sistemi
        const tumHamleler = getTumGecerliHamleler(bilgisayarOyuncu);
        const hamlePuanlari = tumHamleler.map(hamle => {
            const { tas, hedef } = hamle;
                let puan = 0;
                
                // Orta kare en değerli
                if (hedef === 4) puan += 3;
                
                // Köşeler değerli
                if ([0, 2, 6, 8].includes(hedef)) puan += 2;
                
                // Geçici olarak hamleyi yap
                const geciciDurum = [...oyunDurumu];
                geciciDurum[tas] = '';
                geciciDurum[hedef] = bilgisayarOyuncu;
                
                // Bu hamle, bir sonraki turda bir kazanma fırsatı (çatal) oluşturuyor mu?
                let kazanmaFirsatiSayisi = 0;
                const sonrakiHamleler = getTumGecerliHamleler(bilgisayarOyuncu, geciciDurum);
                for (const sonrakiHamle of sonrakiHamleler) {
                    // Eğer bu geçici durumdan sonra bir kazanma hamlesi varsa, bu bir "fırsat" demektir.
                    if (findWinningMove(bilgisayarOyuncu, geciciDurum)) {
                        kazanmaFirsatiSayisi++;
                    }
                }
                
                // Kazanma fırsatı sayısına göre puan ekle
                puan += kazanmaFirsatiSayisi * 5;
                
                // Rakibin taşlarının yanına giderek onları engelleme
                for (let i = 0; i < oyunDurumu.length; i++) {
                    if (oyunDurumu[i] === rakip && hareketler[i].includes(hedef)) {
                        puan += 1;
                    }
                }
                
            return {
                tas: tas,
                hedef: hedef,
                puan: puan
            };
        });
        
        // En yüksek puanlı hamleyi seç
        if (hamlePuanlari.length > 0) {
            hamlePuanlari.sort((a, b) => b.puan - a.puan);
            return [hamlePuanlari[0].tas, hamlePuanlari[0].hedef];
        }
        
        // Herhangi bir stratejik hamle bulunamadıysa, rastgele hareket et
        return rastgeleHareket();
    }
    
    function oyunuSifirla() {
        oyunDevam = true;
        siradakiOyuncu = 'X';
        oyunDurumu = ['', '', '', '', '', '', '', '', ''];
        oyunAsamasi = 'yerleştirme';
        yerleştirilmisTaslar = { 'X': 0, 'O': 0 };
        secilenTas = null;
        
        // Bilgisayar oyuncu ayarını kontrol et
        const secim = bilgisayarSecimi.value;
        bilgisayarOyuncu = secim === "" ? null : secim;
        
        // Zorluk seviyesini kontrol et
        zorlukSeviyesi = zorlukSecimi.value;

        // 2 oyunculu modda zorluk seçimini devre dışı bırak
        zorlukSecimi.disabled = !bilgisayarOyuncu;
        
        if (bilgisayarOyuncu) {
            const zorlukMetni = zorlukSeviyesi.charAt(0).toUpperCase() + zorlukSeviyesi.slice(1);
            durumMetni.textContent = bilgisayarOyuncu === 'X' ? 
                `Bilgisayar (${zorlukMetni}) başlıyor...` : 
                `Siz (X) başlıyorsunuz, taşınızı yerleştirin`;
        } else {
            durumMetni.textContent = `Oyuncu ${siradakiOyuncu} taşını yerleştirsin (3 taş kaldı)`;
        }
        
        hucreler.forEach(hucre => {
            hucre.textContent = '';
            hucre.classList.remove('x', 'o', 'secili');
        });
        
        // Bilgisayar başlıyorsa ilk hamleyi yap
        if (bilgisayarOyuncu === 'X') {
            setTimeout(bilgisayarHamlesiYap, 700);
        }
    }
    
    // Olay dinleyicileri
    hucreler.forEach((hucre, index) => {
        hucre.addEventListener('click', () => hucreKontrol(hucre, index));
    });
    
    yeniOyunButonu.addEventListener('click', oyunuSifirla);
    bilgisayarSecimi.addEventListener('change', oyunuSifirla);
    zorlukSecimi.addEventListener('change', oyunuSifirla);
    
    // Oyunu başlat
    oyunuSifirla();
});