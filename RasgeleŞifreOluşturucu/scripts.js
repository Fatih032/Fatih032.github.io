var password = document.getElementById("password");
function genPassword() {
    var chars= "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890+!@#$%^&*()_";
    var passwordlength = 12;
    var password = "";
    for (var i = 0; i < passwordlength; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        password += chars.substring(rnum, rnum + 1);
    }
    document.getElementById("password").value = password;

}
function copyPassword() {
    var copyText = document.getElementById("password")
    copyText.select();
    copyText.setSelectionRange(0, 999);
    document.execCommand("copy");
    alert("Şifre kopyalandı.");
}