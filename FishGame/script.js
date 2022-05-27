// Canvas setup 
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;
let score = 0;
let gameFrame = 0;
ctx.font = "50px Georgia";
let gameSpeed = 2;
let gameOver = false;

// Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    click : false
}

canvas.addEventListener("mousedown", function(event) {
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener("mouseup", function(event) {
    mouse.click = false;
});
// Player
const playerLeft = new Image();
playerLeft.src = "morRight.png";

const playerRight = new Image();
playerRight.src = "morSol.png";

class Player {
    constructor() {
        this.x = canvas.width;
        this.y = canvas.height / 2;
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
    }
    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        this.angle = Math.atan2(dy, dx);
        if (mouse.x != this.x) {
            this.x -= dx/30;
        }
        if (mouse.y != this.y) {
            this.y -= dy/30;
        }
    }

    draw() {
        if(mouse.click) {
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

        }
        //ctx.fillStyle = "red";
/*         ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.fillRect(this.x , this.y, this.radius, 10); */

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (this.x >= mouse.x) {
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth * 0.83, this.spriteHeight * 1.2, 0-40, 0 - 45 , this.spriteWidth/4, this.spriteHeight/4);
        } else {
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth , this.spriteHeight * 1.2 , 0- 40, 0 - 25 , this.spriteWidth/4, this.spriteHeight/4);
        }

        ctx.restore();


        
    }
}
const player = new Player();
// Bubbles 
const bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = "bubble.png";

class Bubble {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y =  canvas.height + 100;
        this.radius = 50;
        this.speed = Math.random() * 5 + 1;
        this.distance;
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'soound2';
    }
    update() {
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx * dx + dy * dy);
    }
    draw() {
/*         ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
        ctx.stroke(); */
        ctx.fillText('score: ' + score, 10, 50);
        ctx.drawImage(bubbleImage, this.x - 60 , this.y - 60, this.radius * 2.5, this.radius * 2.5);
    }
}
const bubblePop1 = document.createElement('audio');
bubblePop1.src = './Plop.ogg';
const bubblePop2 = document.createElement('audio');
bubblePop2.src = './bubbles-single.wav';

function handleBubbles() {
    if (gameFrame % 50 == 0) { 
        bubblesArray.push(new Bubble());
    }
    for (let i = 0; i < bubblesArray.length; i++) {
        bubblesArray[i].update();
        bubblesArray[i].draw();
    }
    for (let i = 0; i < bubblesArray.length; i++ ){
        if(bubblesArray[i].y < 0 - bubblesArray[i].radius * 2){
            bubblesArray.splice(i, 1);

        }
        if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {
            if (bubblesArray[i].sound === 'sound1') {
                bubblePop1.play();
            } else {
                bubblePop2.play();
            }
            score++;
            bubblesArray.splice(i, 1);
            i--;
        }
    }

}

function restart() {
    score = 0;
    gameOver = false;
    gameFrame = 0;
    player.x = canvas.width;
    player.y = canvas.height / 2;
    bubblesArray.length = 0;
    animate();

}

// Repating backgrounds
const background = new Image();
background.src = "background1.png";

const BG  = {
    x1: 0,
    x2: canvas.width,
    y: 0,
    width: canvas.width,
    height: canvas.height

}

function handleBacground() {
    BG.x1 -= gameSpeed;
    if (BG.x1 < -BG.width) {
        BG.x1 = BG.width;
    }
    BG.x2 -= gameSpeed;
    if (BG.x2 < -BG.width) {
        BG.x2 = BG.width;
    }
    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
    ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

// enemy 
const enemyImage = new Image();
enemyImage.src = "enemy.png";

class Enemy{
    constructor() {
        this.x = canvas.width + 200;
        this.y = Math.random() * (canvas.height - 150 ) + 90;
        this.radius = 60;
        this.speed = Math.random() * 2 + 2;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 418;
        this.spriteHeight = 397;
    }
    draw() {
/*         ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill(); */
        ctx.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - this.radius, this.y - this.radius, this.spriteWidth/4, this.spriteHeight/4);
    }
    update() {
        this.x -= this.speed;
        if (this.x < 0 - this.radius * 2) {
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 150 ) + 90;
            this.speed = Math.random() * 2 + 2;
        }
        if (gameFrame % 5 == 0) {
            this.frame++;
            if (this.frame >= 12) {
                this.frame = 0;
            }
            if (this.frame == 3 || this.frame == 7 || this.frame == 11) {
                this.frameX = 0;
            } else {
                this.frameX ++;
            }
            if (this.frame < 3) {
                this.frameY = 0;
            } else if (this.frame < 7) {
                this.frameY = 1;
            }
            else if (this.frame < 11) {
                this.frameY = 2;
            }
            else {
                this.frameY = 0;
            }
        }
        // collision detection
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.radius + player.radius) {
            handleGameOver();
        }
    }
}

function handleGameOver() {
    ctx.fillStyle = "white";
    ctx.fillText('Oyun bitti, Skorun: ' + score, 130, 250);
    ctx.fillText("Yeniden başlamak için r'ye basınız...", 130, 300);
    gameOver = true;
}



document.addEventListener('keydown', (event) => {
    var name = event.key;
    if (name === 'r' && gameOver) {
        console.log('restart');
        restart();
    }
});

const enemy1 = new Enemy();
function handleEnemy() {
    enemy1.draw();
    enemy1.update();
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBacground();
    handleBubbles();
    player.update();
    player.draw();
    handleEnemy();
    gameFrame++;
    if (!gameOver) {
    requestAnimationFrame(animate);
    }
}
animate();

window.addEventListener('resize', function() {
    canvasPosition = canvas.getBoundingClientRect();
});