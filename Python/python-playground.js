const PYODIDE_BASE_URL = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";

const examples = {
  "7kuvveti": {
    code: `ust_sinir = int(input("Kaça kadar hesaplayalım? "))

for us in range(1, ust_sinir + 1):
    print(f"7^{us} = {7 ** us}")`,
    input: "5",
  },
  HideNumber: {
    code: `numara = input("Kart numarası: ").replace(" ", "")

if not numara.isdecimal() or len(numara) < 4:
    print("En az dört rakam girin.")
else:
    gizli = "*" * (len(numara) - 4) + numara[-4:]
    print(gizli)`,
    input: "1234 5678 9012 3456",
  },
  armstrong: {
    code: `sayi = int(input("Bir doğal sayı girin: "))
basamaklar = str(sayi)
kuvvet = len(basamaklar)
toplam = sum(int(rakam) ** kuvvet for rakam in basamaklar)

if toplam == sayi:
    print(f"{sayi} Armstrong sayısıdır.")
else:
    print(f"{sayi} Armstrong sayısı değildir.")`,
    input: "153",
  },
  "artıkYıl": {
    code: `yil = int(input("Yıl: "))
artik_yil = yil % 400 == 0 or (yil % 4 == 0 and yil % 100 != 0)

print("Artık yıl" if artik_yil else "Artık yıl değil")`,
    input: "2024",
  },
  asal: {
    code: `sayi = int(input("Bir tam sayı girin: "))
asal_mi = sayi >= 2

for bolen in range(2, int(sayi ** 0.5) + 1):
    if sayi % bolen == 0:
        asal_mi = False
        break

print("Asal sayı" if asal_mi else "Asal sayı değil")`,
    input: "29",
  },
  basamak: {
    code: `sayi = int(input("Bir tam sayı girin: "))
basamak_sayisi = len(str(abs(sayi)))

print(f"Basamak sayısı: {basamak_sayisi}")`,
    input: "-5082",
  },
  binarySearch: {
    code: `sayilar = [3, 8, 12, 17, 23, 31, 42]
aranan = int(input("Aranan sayı: "))
sol, sag = 0, len(sayilar) - 1
bulunan_indeks = -1

while sol <= sag:
    orta = (sol + sag) // 2
    if sayilar[orta] == aranan:
        bulunan_indeks = orta
        break
    if sayilar[orta] < aranan:
        sol = orta + 1
    else:
        sag = orta - 1

print(f"Bulunduğu indeks: {bulunan_indeks}" if bulunan_indeks >= 0 else "Sayı bulunamadı")`,
    input: "23",
  },
  binToDec: {
    code: `ikilik_sayi = input("İkilik tabanda bir sayı girin: ")

if any(rakam not in "01" for rakam in ikilik_sayi):
    print("Yalnızca 0 ve 1 kullanın.")
else:
    print(f"Onluk karşılığı: {int(ikilik_sayi, 2)}")`,
    input: "101101",
  },
  bubbleSort: {
    code: `sayilar = [64, 34, 25, 12, 22, 11, 90]

for tur in range(len(sayilar) - 1):
    degisti = False
    for indeks in range(len(sayilar) - 1 - tur):
        if sayilar[indeks] > sayilar[indeks + 1]:
            sayilar[indeks], sayilar[indeks + 1] = sayilar[indeks + 1], sayilar[indeks]
            degisti = True
    if not degisti:
        break

print("Sıralı liste:", sayilar)`,
    input: "",
  },
  caeserCipher: {
    code: `metin = input("Şifrelenecek metin: ")
kaydirma = int(input("Harf kaydırma miktarı: ")) % 26
alfabe = "abcdefghijklmnopqrstuvwxyz"
buyuk_alfabe = alfabe.upper()

def kaydir(harf, karakterler):
    if harf not in karakterler:
        return harf
    yeni_indeks = (karakterler.index(harf) + kaydirma) % 26
    return karakterler[yeni_indeks]

sifreli = "".join(
    kaydir(harf, buyuk_alfabe if harf.isupper() else alfabe)
    for harf in metin
)
print("Şifreli metin:", sifreli)`,
    input: "Merhaba Dunya!\n3",
  },
  calculate: {
    code: `ilk_sayi = float(input("İlk sayı: "))
islem = input("İşlem (+, -, *, /): ")
ikinci_sayi = float(input("İkinci sayı: "))

if islem == "+":
    sonuc = ilk_sayi + ikinci_sayi
elif islem == "-":
    sonuc = ilk_sayi - ikinci_sayi
elif islem == "*":
    sonuc = ilk_sayi * ikinci_sayi
elif islem == "/" and ikinci_sayi != 0:
    sonuc = ilk_sayi / ikinci_sayi
else:
    sonuc = None

print(f"Sonuç: {sonuc}" if sonuc is not None else "Geçersiz işlem veya sıfıra bölme.")`,
    input: "12\n*\n4",
  },
  capitalIndexes: {
    code: `metin = input("Bir metin girin: ")
indeksler = [indeks for indeks, harf in enumerate(metin) if harf.isupper()]

print("Büyük harflerin indeksleri:", indeksler)`,
    input: "MerHaBa",
  },
  countVowel: {
    code: `metin = input("Bir metin girin: ").casefold()
unluler = "aeıioöuü"
sayilar = {harf: metin.count(harf) for harf in unluler}

print("Ünlü sayısı:", sum(sayilar.values()))
print("Harf dağılımı:", sayilar)`,
    input: "Python ve Türkçe",
  },
  "daireAlanÇevre": {
    code: `import math

yari_cap = float(input("Dairenin yarıçapı: "))
alan = math.pi * yari_cap ** 2
cevre = 2 * math.pi * yari_cap

print(f"Alan: {alan:.2f}")
print(f"Çevre: {cevre:.2f}")`,
    input: "5",
  },
  decToBin: {
    code: `sayi = int(input("Onluk tabanda bir tam sayı girin: "))
print("İkilik karşılığı:", format(sayi, "b"))`,
    input: "45",
  },
  discount: {
    code: `fiyat = float(input("Ürün fiyatı: "))
indirim_yuzdesi = float(input("İndirim yüzdesi: "))
indirimli_fiyat = fiyat * (1 - indirim_yuzdesi / 100)

print(f"İndirimli fiyat: {indirimli_fiyat:.2f} TL")
print(f"Kazancınız: {fiyat - indirimli_fiyat:.2f} TL")`,
    input: "750\n20",
  },
  "dostSayılar": {
    code: `def bolenler_toplami(sayi):
    if sayi <= 1:
        return 0
    toplam = 1
    for bolen in range(2, int(sayi ** 0.5) + 1):
        if sayi % bolen == 0:
            toplam += bolen
            diger_bolen = sayi // bolen
            if diger_bolen != bolen:
                toplam += diger_bolen
    return toplam

ilk_sayi = int(input("İlk sayı: "))
ikinci_sayi = bolenler_toplami(ilk_sayi)
if ikinci_sayi != ilk_sayi and bolenler_toplami(ikinci_sayi) == ilk_sayi:
    print(f"{ilk_sayi} ve {ikinci_sayi} dost sayılardır.")
else:
    print("Bu sayı dost çifti oluşturmuyor.")`,
    input: "220",
  },
  ebob_ekok: {
    code: `import math

ilk_sayi = int(input("İlk sayı: "))
ikinci_sayi = int(input("İkinci sayı: "))
ebob = math.gcd(ilk_sayi, ikinci_sayi)
ekok = abs(ilk_sayi * ikinci_sayi) // ebob if ebob else 0

print(f"EBOB: {ebob}")
print(f"EKOK: {ekok}")`,
    input: "24\n36",
  },
  "faktöriyel": {
    code: `sayi = int(input("Negatif olmayan bir tam sayı girin: "))

if sayi < 0:
    print("Negatif sayıların faktöriyeli tanımlı değildir.")
else:
    sonuc = 1
    for carpilan in range(2, sayi + 1):
        sonuc *= carpilan
    print(f"{sayi}! = {sonuc}")`,
    input: "6",
  },
  fibonacci: {
    code: `terim_sayisi = int(input("Kaç terim gösterilsin? "))
ilk, ikinci = 0, 1
seri = []

for _ in range(max(0, terim_sayisi)):
    seri.append(ilk)
    ilk, ikinci = ikinci, ilk + ikinci

print("Fibonacci serisi:", seri)`,
    input: "10",
  },
  formatNumber: {
    code: `sayi = float(input("Biçimlendirilecek sayı: "))
formatli = f"{sayi:,.2f}"
formatli = formatli.replace(",", "X").replace(".", ",").replace("X", ".")

print("Türkçe sayı biçimi:", formatli)`,
    input: "1234567.8",
  },
  happyNumber: {
    code: `sayi = int(input("Pozitif bir tam sayı girin: "))
gorulen = set()
adim = sayi

while adim != 1 and adim not in gorulen:
    gorulen.add(adim)
    adim = sum(int(rakam) ** 2 for rakam in str(adim))

print("Mutlu sayı" if adim == 1 else "Mutlu sayı değil")`,
    input: "19",
  },
  justNumber: {
    code: `metin = input("Bir metin girin: ")
sadece_rakamlar = "".join(karakter for karakter in metin if karakter.isdecimal())

print("Rakamlar:", sadece_rakamlar)`,
    input: "Sipariş No: AB-2048 / 16",
  },
  middleLetter: {
    code: `metin = input("Bir kelime veya metin girin: ").strip()
orta = len(metin) // 2

if not metin:
    print("Boş metin girdiniz.")
elif len(metin) % 2:
    print("Orta harf:", metin[orta])
else:
    print("Ortadaki harfler:", metin[orta - 1:orta + 1])`,
    input: "Python",
  },
  morsTranslate: {
    code: `mors = {
    "A": ".-", "B": "-...", "C": "-.-.", "D": "-..",
    "E": ".", "F": "..-.", "G": "--.", "H": "....",
    "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
    "M": "--", "N": "-.", "O": "---", "P": ".--.",
    "Q": "--.-", "R": ".-.", "S": "...", "T": "-",
    "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
    "Y": "-.--", "Z": "--..", " ": "/"
}

metin = input("İngilizce harflerle bir metin girin: ").upper()
ceviri = " ".join(mors.get(harf, "?") for harf in metin)
print("Mors karşılığı:", ceviri)`,
    input: "SOS",
  },
  "mükemmelSayı": {
    code: `sayi = int(input("Bir pozitif tam sayı girin: "))
bolenler = [bolen for bolen in range(1, sayi) if sayi % bolen == 0]

print("Tam bölenler:", bolenler)
print("Mükemmel sayı" if sum(bolenler) == sayi else "Mükemmel sayı değil")`,
    input: "28",
  },
  nToplam: {
    code: `n = int(input("Pozitif bir tam sayı girin: "))
toplam = sum(range(1, n + 1)) if n > 0 else 0

print(f"1'den {n}'e kadar sayıların toplamı: {toplam}")`,
    input: "100",
  },
  "negatifPozitif": {
    code: `sayi = float(input("Bir sayı girin: "))

if sayi > 0:
    print("Pozitif")
elif sayi < 0:
    print("Negatif")
else:
    print("Sıfır")`,
    input: "-12.5",
  },
  "orjinalSayı": {
    code: `sayi = input("Bir tam sayı girin: ")
rakamlar = sayi.lstrip("-")

if not rakamlar.isdecimal():
    print("Geçerli bir tam sayı girin.")
else:
    print("Palindrom sayı" if rakamlar == rakamlar[::-1] else "Palindrom değil")`,
    input: "12321",
  },
  python: {
    code: `sayi = int(input("Bir tam sayı girin: "))

if sayi % 2 == 0:
    print(f"{sayi} çift sayıdır.")
else:
    print(f"{sayi} tek sayıdır.")`,
    input: "42",
  },
  radyanToDegree: {
    code: `import math

radyan = float(input("Açı (radyan): "))
derece = math.degrees(radyan)

print(f"{radyan} radyan = {derece:.2f} derece")`,
    input: "3.141592653589793",
  },
  root: {
    code: `import math

sayi = float(input("Karekökü alınacak sayı: "))
if sayi < 0:
    print("Gerçek sayılarda negatif sayıların karekökü alınamaz.")
else:
    print(f"Karekök: {math.sqrt(sayi):.4f}")`,
    input: "81",
  },
  "sayıKuvveti": {
    code: `taban = float(input("Taban: "))
us = int(input("Tam sayı üs: "))

print(f"Sonuç: {taban ** us}")`,
    input: "2\n10",
  },
  "sayıOkunuşları": {
    code: `birler = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"]
onlar = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"]

def oku_999(sayi):
    yuzluk = sayi // 100
    kalan = sayi % 100
    parcalar = []
    if yuzluk:
        parcalar.append("yüz" if yuzluk == 1 else birler[yuzluk] + " yüz")
    if kalan >= 10:
        parcalar.append(onlar[kalan // 10])
        kalan %= 10
    if kalan:
        parcalar.append(birler[kalan])
    return " ".join(parcalar)

def sayiyi_oku(sayi):
    if sayi == 0:
        return "sıfır"
    parcalar = []
    if sayi < 0:
        parcalar.append("eksi")
        sayi = abs(sayi)
    binlik, kalan = divmod(sayi, 1000)
    if binlik:
        parcalar.append("bin" if binlik == 1 else oku_999(binlik) + " bin")
    if kalan:
        parcalar.append(oku_999(kalan))
    return " ".join(parcalar)

sayi = int(input("0 ile 999999 arasında bir sayı girin: "))
if abs(sayi) > 999999:
    print("Bu örnek en fazla altı basamağı destekliyor.")
else:
    print(sayiyi_oku(sayi))`,
    input: "12345",
  },
  "sayıTahminOyunu": {
    code: `hedef = int(input("Gizli sayı (1-100): "))
deneme_hakki = 5

for deneme in range(1, deneme_hakki + 1):
    tahmin = int(input(f"{deneme}. tahmin: "))
    if tahmin == hedef:
        print(f"Tebrikler, {deneme}. denemede buldunuz!")
        break
    if tahmin < hedef:
        print("Daha büyük bir sayı deneyin.")
    else:
        print("Daha küçük bir sayı deneyin.")
else:
    print(f"Deneme hakkınız bitti. Sayı {hedef} idi.")`,
    input: "42\n10\n30\n42",
  },
  tamKare: {
    code: `import math

sayi = int(input("Bir tam sayı girin: "))
kok = math.isqrt(sayi) if sayi >= 0 else -1

if kok >= 0 and kok * kok == sayi:
    print(f"{sayi}, {kok} sayısının karesidir.")
else:
    print("Tam kare değil.")`,
    input: "144",
  },
  vki: {
    code: `boy_cm = float(input("Boyunuz (cm): "))
kilo = float(input("Kilonuz (kg): "))
boy_m = boy_cm / 100

if boy_m <= 0 or kilo <= 0:
    print("Boy ve kilo sıfırdan büyük olmalıdır.")
else:
    vki = kilo / boy_m ** 2
    print(f"Vücut kitle indeksiniz: {vki:.1f}")
    if vki < 18.5:
        print("Genel sınıflandırma: düşük kilo")
    elif vki < 25:
        print("Genel sınıflandırma: normal aralık")
    elif vki < 30:
        print("Genel sınıflandırma: fazla kilo")
    else:
        print("Genel sınıflandırma: obezite aralığı")`,
    input: "175\n70",
  },
  "yüzDilimPasta": {
    code: `import math

yari_cap = float(input("Pastanın yarıçapı (cm): "))
dilim_sayisi = int(input("Eşit dilim sayısı: "))

if yari_cap <= 0 or dilim_sayisi <= 0:
    print("Yarıçap ve dilim sayısı pozitif olmalıdır.")
else:
    dilim_alani = math.pi * yari_cap ** 2 / dilim_sayisi
    merkez_aci = 360 / dilim_sayisi
    print(f"Bir dilimin alanı: {dilim_alani:.2f} cm²")
    print(f"Bir dilimin merkez açısı: {merkez_aci:.1f}°")`,
    input: "15\n8",
  },
  "zenginSayı": {
    code: `sayi = int(input("Bir pozitif tam sayı girin: "))
bolenler = [bolen for bolen in range(1, sayi) if sayi % bolen == 0]
bolen_toplami = sum(bolenler)

print("Kendisi hariç bölenler:", bolenler)
print("Zengin sayı" if bolen_toplami > sayi else "Zengin sayı değil")`,
    input: "12",
  },
  "çiftTekOran": {
    code: `sayilar = [int(deger) for deger in input("Sayıları virgülle ayırarak girin: ").split(",")]
cift_sayisi = sum(sayi % 2 == 0 for sayi in sayilar)
tek_sayisi = len(sayilar) - cift_sayisi

print(f"Çift sayı adedi: {cift_sayisi}")
print(f"Tek sayı adedi: {tek_sayisi}")
print(f"Çift/tek oranı: {cift_sayisi}:{tek_sayisi}")`,
    input: "2, 5, 8, 11, 14",
  },
};

let pyodidePromise;
let activeOutput;
let activeInputs = [];
let executionQueue = Promise.resolve();

function appendOutput(text) {
  if (activeOutput) {
    activeOutput(text);
  }
}

function loadPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${PYODIDE_BASE_URL}pyodide.js`;
      script.async = true;
      script.onload = async () => {
        try {
          if (typeof window.loadPyodide !== "function") {
            throw new Error("Python çalışma ortamı başlatılamadı.");
          }
          const pyodide = await window.loadPyodide({
            indexURL: PYODIDE_BASE_URL,
            stdout: appendOutput,
            stderr: appendOutput,
            stdin: () => activeInputs.shift() ?? null,
          });
          resolve(pyodide);
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = () => reject(new Error("Python çalışma ortamı indirilemedi."));
      document.head.appendChild(script);
    });

    pyodidePromise.catch(() => {
      pyodidePromise = undefined;
    });
  }

  return pyodidePromise;
}

function createPlayground(container, example) {
  const intro = document.createElement("p");
  intro.className = "python-playground-intro";
  intro.textContent =
    "Kodu düzenleyip çalıştırabilirsiniz. Program girdilerini her satıra bir değer gelecek şekilde yazın.";

  const codeLabel = document.createElement("label");
  codeLabel.className = "python-playground-label";
  codeLabel.textContent = "Python kodu";
  const codeEditor = document.createElement("textarea");
  codeEditor.className = "python-code";
  codeEditor.spellcheck = false;
  codeEditor.autocapitalize = "off";
  codeEditor.autocomplete = "off";
  codeEditor.setAttribute("aria-label", "Düzenlenebilir Python kodu");
  codeLabel.appendChild(codeEditor);

  const inputLabel = document.createElement("label");
  inputLabel.className = "python-playground-label";
  inputLabel.textContent = "Program girdisi";
  const inputEditor = document.createElement("textarea");
  inputEditor.className = "python-input";
  inputEditor.rows = 3;
  inputEditor.setAttribute("aria-label", "Python input fonksiyonu için girdi");
  inputLabel.appendChild(inputEditor);

  const actions = document.createElement("div");
  actions.className = "python-playground-actions";
  const runButton = document.createElement("button");
  runButton.className = "python-run-button";
  runButton.type = "button";
  runButton.textContent = "Çalıştır";
  const resetButton = document.createElement("button");
  resetButton.className = "python-reset-button";
  resetButton.type = "button";
  resetButton.textContent = "Örneği geri yükle";
  actions.append(runButton, resetButton);

  const status = document.createElement("p");
  status.className = "python-playground-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = "Python ortamı ilk çalıştırmada internet üzerinden yüklenir.";

  const outputLabel = document.createElement("p");
  outputLabel.className = "python-playground-label";
  outputLabel.textContent = "Çıktı";
  const output = document.createElement("pre");
  output.className = "python-output";
  output.tabIndex = 0;
  output.setAttribute("aria-label", "Python program çıktısı");

  container.replaceChildren(intro, codeLabel, inputLabel, actions, status, outputLabel, output);
  codeEditor.value = example.code;
  inputEditor.value = example.input;

  runButton.addEventListener("click", () => {
    const run = async () => {
      runButton.disabled = true;
      status.textContent = "Python ortamı hazırlanıyor...";
      output.textContent = "";
      try {
        const pyodide = await loadPyodide();
        activeOutput = (text) => {
          output.textContent += `${text}\n`;
        };
        activeInputs = inputEditor.value === "" ? [] : inputEditor.value.split(/\r?\n/);
        status.textContent = "Kod çalışıyor...";
        await pyodide.runPythonAsync(codeEditor.value);
        status.textContent = "Çalıştırma tamamlandı.";
      } catch (error) {
        output.textContent += `${error.message || error}\n`;
        status.textContent = "Kod çalıştırılırken hata oluştu.";
      } finally {
        activeOutput = undefined;
        activeInputs = [];
        runButton.disabled = false;
      }
    };

    executionQueue = executionQueue.then(run, run);
  });

  resetButton.addEventListener("click", () => {
    codeEditor.value = example.code;
    inputEditor.value = example.input;
    output.textContent = "";
    status.textContent = "Örnek kod ve girdiler geri yüklendi.";
    codeEditor.focus();
  });
}

document.querySelectorAll(".python-playground[data-python-example]").forEach((container) => {
  const example = examples[container.dataset.pythonExample];
  if (!example) {
    container.textContent = "Bu sayfa için Python örneği bulunamadı.";
    return;
  }
  createPlayground(container, example);
});
