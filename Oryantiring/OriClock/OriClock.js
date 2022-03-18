var hour = document.getElementById("hour");
var minute = document.getElementById("minute");
var seconds = document.getElementById("seconds");




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
            document.getElementById("sonbes").play()
        }
        if (sec == 0) {
            document.getElementById("cikis").play()
        }
        hour.textContent = hr;
        minute.textContent = min;
        seconds.textContent = sec;
    }, 1000
);
// $('#arkaplan').click(function () {
//     var secilenrenk = $("#renk").val();
//     $(".body").css("background", secilenrenk);
//     });
function colorChange(){
    let secilenrenk = document.getElementById("renk").value;
    document.body.style.backgroundColor = secilenrenk;
    document.querySelector("#hour").style.backgroundColor = secilenrenk;
    document.querySelector("#minute").style.backgroundColor = secilenrenk;
    document.querySelector("#seconds").style.backgroundColor = secilenrenk;
}
function saatRenk(){
    let saatRenk = document.getElementById("saatRenk").value;
    document.querySelector("#hour").style.color = saatRenk;
    document.querySelector("#minute").style.color = saatRenk;
    document.querySelector("#seconds").style.color = saatRenk;
    document.querySelector("#span1").style.color = saatRenk;
    document.querySelector("#span2").style.color = saatRenk;
}
