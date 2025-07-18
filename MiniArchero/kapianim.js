// Kapı açılmaya başladığında çağır
function startDoorOpenAnim() {
    gameState.doorAnim.opening = true;
}

// Her frame çağır
function updateDoorAnim() {
    if (gameState.doorAnim.opening && gameState.doorAnim.progress < 1) {
        gameState.doorAnim.progress += 0.05;
        if (gameState.doorAnim.progress >= 1) {
            gameState.doorAnim.progress = 1;
            gameState.doorAnim.opening = false;
        }
    }
}

// drawDoor fonksiyonunu animasyonlu hale getir
function drawDoorAnim(ctx, door) {
    ctx.save();
    const prog = gameState.doorAnim.progress;
    // Kapı rengi animasyonu
    const closedColor = "#888";
    const openColor = "#00e676";
    function lerpColor(a, b, t) {
        // a, b: hex renk, t: 0-1
        const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
        const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
        const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
        const rr = Math.round(ar + (br - ar) * t);
        const rg = Math.round(ag + (bg - ag) * t);
        const rb = Math.round(ab + (bb - ab) * t);
        return `rgb(${rr},${rg},${rb})`;
    }
    ctx.fillStyle = lerpColor(closedColor, openColor, prog);
    ctx.fillRect(door.x, door.y + 8 * prog, door.width, door.height - 8 * prog);

    // Kapı üstü yay animasyonu
    ctx.beginPath();
    ctx.strokeStyle = openColor;
    ctx.lineWidth = 4;
    const arcY = door.y + 8 * (1 - prog);
    ctx.arc(door.x + door.width / 2, arcY, door.width / 2, Math.PI, 0, false);
    ctx.stroke();

    // Kapalıysa kilit simgesi göster
    if (prog < 0.99) {
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.moveTo(door.x, door.y);
        ctx.lineTo(door.x + door.width, door.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(door.x + door.width / 2, door.y + door.height / 2 + 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(door.x + door.width / 2, door.y + door.height / 2 - 2, 4, Math.PI, 0, false);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Kapı çerçevesi
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(door.x, door.y, door.width, door.height);

    // Kapı yazısı
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Kapı', door.x + door.width / 2, door.y + door.height + 16);
    ctx.restore();
}
