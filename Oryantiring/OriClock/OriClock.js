var hour = document.getElementById("hour");
var minute = document.getElementById("minute");
var seconds = document.getElementById("seconds");

// Sayfa yüklenince çalışacak kod
window.onload = function() {
    // Renk seçicinin başlangıç değerini al
    secilenrenk = document.getElementById("renk").value;
    // Arka plan rengini uygula
    uygulaArkaplanRengi();
};

// Arka plan rengi için global değişken
var secilenrenk = "#000000";

var clock = setInterval(
    function time() {
        var date_now = new Date();
        var hr = date_now.getHours();
        var min = date_now.getMinutes();
        var sec = date_now.getSeconds();

        if (hr < 10) {
            hr = "0" + hr;
        }
        if (min < 10) {
            min = "0" + min;
        }
        if (sec < 10) {
            sec = "0" + sec;
        }
        if (sec >= 55) {
            document.getElementById("sonbes").play();
        }
        if (sec == 0) {
            document.getElementById("cikis").play();
        }
        hour.textContent = hr;
        minute.textContent = min;
        seconds.textContent = sec;
    }, 1000
);

// Arka plan rengini uygulayan fonksiyon
function uygulaArkaplanRengi() {
    document.body.style.backgroundColor = secilenrenk;
    document.getElementById("root").style.backgroundColor = secilenrenk;
    document.querySelector("#hour").style.backgroundColor = secilenrenk;
    document.querySelector("#minute").style.backgroundColor = secilenrenk;
    document.querySelector("#seconds").style.backgroundColor = secilenrenk;
}

function arkaplan(){
    secilenrenk = document.getElementById("renk").value;
    uygulaArkaplanRengi();
}

function saatRenk(){
    let saatRenk = document.getElementById("saatRenk").value;
    document.querySelector("#hour").style.color = saatRenk;
    document.querySelector("#minute").style.color = saatRenk;
    document.querySelector("#seconds").style.color = saatRenk;
    document.querySelector("#span1").style.color = saatRenk;
    document.querySelector("#span2").style.color = saatRenk;
}

var full = false;
function btnClicked(){
    let fullscreen = document.getElementById("root");
    if(full == false){
        // Tam ekrana geçmeden önce arka plan rengini kaydet
        console.log("Tam ekrana geçerken seçilen renk: " + secilenrenk);
        
        fullscreen.requestFullscreen()
            .then(() => {
                full = true;
                // Tam ekrana geçtikten sonra arka plan rengini uygula
                setTimeout(function() {
                    uygulaArkaplanRengi();
                    console.log("Tam ekranda arka plan rengi uygulandı: " + secilenrenk);
                }, 200);
            })
            .catch(err => {
                console.log("Tam ekran hatası: ", err);
            });
    }
    else{
        try {
            document.exitFullscreen();
            full = false;
        } catch(err) {
            console.log("Tam ekrandan çıkış hatası: ", err);
            full = false;
        }
    }
}

// Tam ekran değişikliği olayını dinle
document.addEventListener("fullscreenchange", function() {
    // Tam ekran durumunu kontrol et
    full = !!document.fullscreenElement;
    // Tam ekran değişikliğinde arka plan rengini yeniden uygula
    setTimeout(function() {
        uygulaArkaplanRengi();
        console.log("Arka plan rengi uygulandı: " + secilenrenk);
    }, 200);
});


