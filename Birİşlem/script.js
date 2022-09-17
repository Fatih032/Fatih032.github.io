let hedef = document.getElementById("hedef");
let süre = document.getElementById("süre");
let sayı = document.getElementById("sayı");
let sayı1 = document.getElementById("sayı1");
let sayı2 = document.getElementById("sayı2");
let sayı3 = document.getElementById("sayı3");
let sayı4 = document.getElementById("sayı4");
let sayı5 = document.getElementById("sayı5");
let sonuç = document.getElementById("sonuç");
let beklet = document.getElementById("beklet");
let boşsayı1 = document.getElementById("boşsayı1")
let boşsayı2 = document.getElementById("boşsayı2")


/* hedef 100 - 1000 arasında rasgele bir sayı */
hedef = Math.floor(Math.random() * 900) + 100;
document.getElementById("hedef").innerHTML = hedef;

function başla() {
    /* süre 60'tan başlayıp 0 da bitecek birer saniye arayla */
    /* başla butonuna basınca fonksiyon çalışsın */
    let süre = 120;
    let zamanlayıcı = setInterval(function () {
        süre--;
        if (süre == 0) {
            clearInterval(zamanlayıcı);
            alert("Süre doldu kaybettiniz. Tekrar denemek için sayfayı yenileyin.");
        }
        else if (hedef == sonuç.value) {
            clearInterval(zamanlayıcı);
            alert("Tebrikler kazandınız. Tekrar denemek için sayfayı yenileyin.");
        }
        document.getElementById("süre").innerHTML = süre;
    }, 1000);
}

sayı = Math.floor(Math.random() * 9) + 1;
sayı1 = Math.floor(Math.random() * 9) + 1;
sayı2 = Math.floor(Math.random() * 9) + 1;
sayı3 = Math.floor(Math.random() * 9) + 1;
sayı4 = Math.floor(Math.random() * 10) + 10;
sayı5 = Math.floor(Math.random() * 50) + 50;

document.getElementById("sayı").innerHTML = sayı;
document.getElementById("sayı1").innerHTML = sayı1;
document.getElementById("sayı2").innerHTML = sayı2;
document.getElementById("sayı3").innerHTML = sayı3;
document.getElementById("sayı4").innerHTML = sayı4;
document.getElementById("sayı5").innerHTML = sayı5;

/* calculator */
function sayıbir() {
    sonuç.value += sayı;
    document.getElementById("sayı").disabled = true;
}

function sayıiki() {
    sonuç.value += sayı1;
    document.getElementById("sayı1").disabled = true;
}

function sayıüç() {
    sonuç.value += sayı2;
    document.getElementById("sayı2").disabled = true;
}

function sayıdört() {
    sonuç.value += sayı3;
    document.getElementById("sayı3").disabled = true;
}

function sayıbeş() {
    sonuç.value += sayı4;
    document.getElementById("sayı4").disabled = true;
}

function sayıaltı() {
    sonuç.value += sayı5;
    document.getElementById("sayı5").disabled = true;
}

function boşsayıbir() {
    sonuç.value += boşsayı1;
    document.getElementById("boşsayı1").disabled = true;
}

function boşsayıiki() {
    sonuç.value += boşsayı2;
    document.getElementById("boşsayı2").disabled = true;
}

function topla() {
    sonuç.value += "+";
}

function çıkar() {
    sonuç.value += "-";
}

function çarp() {
    sonuç.value += "*";
}

function böl() {
    sonuç.value += "/";
}

function eşittir() {
    sonuç.value = eval(sonuç.value);
}

function tsil() {
    sonuç.value = "";
}

function sil() {
    sonuç.value = sonuç.value.substring(0, sonuç.value.length - 1);
}

function bekletfonk() {
    if ( boşsayı1.value == "" || document.getElementById('boşsayı1').disabled == true ) {
        boşsayı1 = sonuç.value;
        sonuç.value = "";
        document.getElementById("boşsayı1").innerHTML = boşsayı1;
        document.getElementById("boşsayı1").disabled = false;
    } else {
        boşsayı2 = sonuç.value;
        sonuç.value = "";
        document.getElementById("boşsayı2").innerHTML = boşsayı2;
        document.getElementById("boşsayı2").disabled = false;
    }
}









