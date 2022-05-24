function sayi1() {
    var sayi1 = document.getElementById("bir").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi1;
}

function sayi2() {
    var sayi2 = document.getElementById("iki").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi2;
}

function sayi3() {
    var sayi3 = document.getElementById("uc").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi3;
}

function sayi4() {
    var sayi4 = document.getElementById("dort").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi4;
}

function sayi5() {
    var sayi5 = document.getElementById("bes").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi5;
}

function sayi6() {
    var sayi6 = document.getElementById("alti").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi6;
}

function sayi7() {
    var sayi7 = document.getElementById("yedi").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi7;
}

function sayi8() {
    var sayi8 = document.getElementById("sekiz").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi8;
}

function sayi9() {
    var sayi9 = document.getElementById("dokuz").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi9;
}

function sayi0() {
    var sayi0 = document.getElementById("sifir").value;
    var ekran = document.getElementById("ekran");
    ekran.value += sayi0;
}

function e() {
    var ekran = document.getElementById("ekran");
    ekran.value += "2.718281";
}

function nokta() {
    var ekran = document.getElementById("ekran");
    ekran.value += ".";
}

function mod() {
    var ekran = document.getElementById("ekran");
    ekran.value += "%";
}

function topla() {
    var ekran = document.getElementById("ekran");
    ekran.value += "+";
}

function cikar() {
    var ekran = document.getElementById("ekran");
    ekran.value += "-";
}

function carp() {
    var ekran = document.getElementById("ekran");
    ekran.value += "x";
}

function bol() {
    var ekran = document.getElementById("ekran");
    ekran.value += "/";
} 

function sil() {
    var ekran = document.getElementById("ekran");
    ekran.value = "";
}

function ttsil() {
    var ekran = document.getElementById("ekran");
    ekran.value = ekran.value.substring(0, ekran.value.length - 1);
}

function esittir() {
    var ekran = document.getElementById("ekran");
    if (ekran.value.includes("sin")) {
        parantez1 = ekran.value.indexOf("(");
        parantez2 = ekran.value.indexOf(")");
        value = ekran.value.substring(parantez1+1,parantez2) * Math.PI / 180;
        ekran.value = Math.sin(value).toFixed(6);    
    } else if (ekran.value.includes("cos")) {
        parantez1 = ekran.value.indexOf("(");
        parantez2 = ekran.value.indexOf(")");
        value = ekran.value.substring(parantez1+1,parantez2) * Math.PI / 180;
        ekran.value = Math.cos(value).toFixed(6);
    } else if (ekran.value.includes("tan")) {
        parantez1 = ekran.value.indexOf("(");
        parantez2 = ekran.value.indexOf(")");
        value = ekran.value.substring(parantez1+1,parantez2) * Math.PI / 180;
        ekran.value = Math.tan(value).toFixed(6);
    } else if (ekran.value.includes("cot")) {
        parantez1 = ekran.value.indexOf("(");
        parantez2 = ekran.value.indexOf(")");
        value = ekran.value.substring(parantez1+1,parantez2) * Math.PI / 180;
        ekran.value = (1/Math.tan(value)).toFixed(6);
        } else if (ekran.value.includes("ln")) {
        parantez1 = ekran.value.indexOf("(");
        parantez2 = ekran.value.indexOf(")");
        value = ekran.value.substring(parantez1+1,parantez2);
        ekran.value = Math.log(value).toFixed(6);
    } else if (ekran.value.includes("log")) {
        parantez1 = ekran.value.indexOf("(");
        parantez2 = ekran.value.indexOf(")");
        value = ekran.value.substring(parantez1+1,parantez2);
        ekran.value = Math.log10(value).toFixed(6);
    } else if (ekran.value.includes("√")) {
        kök = ekran.value.indexOf("√");
        value = ekran.value.substring(kök+1,ekran.value.length);
        ekran.value = Math.sqrt(value).toFixed(6);
    } else if (ekran.value.includes("^")) {
        üssü = ekran.value.indexOf("^");

        value1 = ekran.value.substring(0,üssü);
        value2 = ekran.value.substring(üssü+1,ekran.value.length);
        ekran.value = Math.pow(value1, value2).toFixed(2);
    } else if (ekran.value.includes("!")) {
        value = ekran.value.substring(0,ekran.value.length-1);
        ekran.value = fact(value);
    } else if (ekran.value.includes("x")){
        ekran.value = eval(ekran.value.replace("x", "*"));
    } else {
        ekran.value = eval(ekran.value);
    }
}

function fact(value) {
    if (value == 0) {
        return 1;
    } else {
        return value * fact(value-1);
    }
}

function faktoriyel() {
    var ekran = document.getElementById("ekran");
    ekran.value += "!";

}

function ln() {
    var ekran = document.getElementById("ekran");
    ekran.value += "ln(";
}

function log() {
    var ekran = document.getElementById("ekran");
    ekran.value += "log(";
}

function kok() {
    var ekran = document.getElementById("ekran");
    ekran.value += document.getElementById("kok").value;
}

function üssü() {
    var ekran = document.getElementById("ekran");
    ekran.value += "^";
}

function sin() {
    var ekran = document.getElementById("ekran");
    ekran.value += "sin(";
}

function cos() {
    var ekran = document.getElementById("ekran");
    ekran.value += "cos(";
}

function tan() {
    var ekran = document.getElementById("ekran");
    ekran.value += "tan(";
}

function cot() {
    var ekran = document.getElementById("ekran");
    ekran.value += "cot(";
}

function log() {
    var ekran = document.getElementById("ekran");
    ekran.value += "log(";
}

function parantezsol() {
    var ekran = document.getElementById("ekran");
    ekran.value += "(";
}

function parantezsag() {
    var ekran = document.getElementById("ekran");
    ekran.value += ")";
}

function kare() {
    var ekran = document.getElementById("ekran");
    ekran.value += "^2";
}

function kup() {
    var ekran = document.getElementById("ekran");
    ekran.value += "^3";
}

function üst() {
    var ekran = document.getElementById("ekran");
    ekran.value += "^";
}

function pi() {
    var ekran = document.getElementById("ekran");
    ekran.value += (Math.PI).toFixed(6);
}

