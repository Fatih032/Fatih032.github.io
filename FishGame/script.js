window.addEventListener('load', function(){
    // Canvas setup 
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 600;

// Player
const playerLeft = new Image();
playerLeft.src = "morSol.png"; // Sol tarafa bakan balık görseli

const playerRight = new Image();
playerRight.src = "morRight.png"; // Sağ tarafa bakan balık görseli

class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = 50;
        this.angle = 0; 
        this.moveSpeed = 20; // Fareyi takip etme hızı (düşük sayı = daha hızlı)
        this.scale = 4; // Balığın çizim ölçeği
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
    }
    update() {
        const dx = this.x - game.mouse.x;
        const dy = this.y - game.mouse.y;
        this.angle = Math.atan2(dy, dx);
        if (game.mouse.x != this.x) {
            this.x -= dx/this.moveSpeed;
        }
        if (game.mouse.y != this.y) {
            this.y -= dy/this.moveSpeed;
        }
        // Sprite animation - NOT: Bu bölümün çalışması için playerLeft ve playerRight
        // görsellerinizin animasyon kareleri içeren bir sprite sheet olması gerekir.
        // Mevcut görseller tek kare olduğu için bu kod geçici olarak devre dışı bırakıldı.
        // if (game.gameFrame % 10 == 0) { 
        //     this.frame++;
        //     if (this.frame >= 12) this.frame = 0;
        //     if (this.frame == 3 || this.frame == 7 || this.frame == 11) {
        //         this.frameX = 0;
        //     } else {
        //         this.frameX++;
        //     }
        //     if (this.frame < 3) this.frameY = 0;
        //     else if (this.frame < 7) this.frameY = 1;
        //     else if (this.frame < 11) this.frameY = 2;
        //     else this.frameY = 0;
        // }
    }

    draw(context) {
        if(game.mouse.click) {
            context.lineWidth = 0.2;
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(game.mouse.x, game.mouse.y);
            context.stroke();

        }

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);

        if (this.x >= game.mouse.x) {
            context.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - (this.spriteWidth/this.scale/2), 0 - (this.spriteHeight/this.scale/2) , this.spriteWidth/this.scale, this.spriteHeight/this.scale);
        } else {
            context.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth , this.spriteHeight, 0 - (this.spriteWidth/this.scale/2), 0 - (this.spriteHeight/this.scale/2) , this.spriteWidth/this.scale, this.spriteHeight/this.scale);
        }

        context.restore();
    }
}

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
        this.counted = false;
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
    }
    update() {
        this.y -= this.speed;
    }
    draw(context) {
        context.drawImage(bubbleImage, this.x - 60 , this.y - 60, this.radius * 2.5, this.radius * 2.5);
    }
}

const bubblePop1 = document.createElement('audio');
bubblePop1.src = './Plop.ogg';
const bubblePop2 = document.createElement('audio');
bubblePop2.src = './bubbles-single.wav';

// Repating backgrounds
const background = new Image();
background.src = "background1.png";
class Background {
    constructor(){
        this.x1 = 0;
        this.x2 = canvas.width;
        this.y = 0;
        this.width = canvas.width;
        this.height = canvas.height;
    }
    update(){
        this.x1 -= game.gameSpeed;
        if (this.x1 < -this.width) this.x1 = this.width;
        this.x2 -= game.gameSpeed;
        if (this.x2 < -this.width) this.x2 = this.width;
    }
    draw(context){
        context.drawImage(background, this.x1, this.y, this.width, this.height);
        context.drawImage(background, this.x2, this.y, this.width, this.height);
    }
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
    update() {
        this.x -= this.speed;
        if (this.x < 0 - this.radius * 2) {
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 150 ) + 90;
            this.speed = Math.random() * 2 + 2;
        }
        if (game.gameFrame % 5 == 0) {
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
    }
    draw(context) {
        context.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - this.radius, this.y - this.radius, this.spriteWidth/4, this.spriteHeight/4);
    }
}

class Game {
    constructor(){
        this.bubblesArray = [];
        this.enemiesArray = [];
        this.score = 0;
        this.gameFrame = 0;
        this.gameSpeed = 2;
        this.gameOver = false;
        this.player = new Player();
        this.background = new Background();
        this.canvasPosition = canvas.getBoundingClientRect();
        this.mouse = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            click : false
        }

        canvas.addEventListener("mousedown", (event) => {
            this.mouse.click = true;
            this.mouse.x = event.x - this.canvasPosition.left;
            this.mouse.y = event.y - this.canvasPosition.top;
        });
        canvas.addEventListener("mouseup", (event) => {
            this.mouse.click = false;
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'r' && this.gameOver) {
                this.restart();
            }
        });
    }
    handleBubbles() {
        if (this.gameFrame % 50 == 0) { 
            this.bubblesArray.push(new Bubble());
        }
        // Diziyi tersten döngüye alarak 'splice' kullanımını güvenli hale getiriyoruz.
        for (let i = this.bubblesArray.length - 1; i >= 0; i--) {
            const bubble = this.bubblesArray[i];
            bubble.update();
            bubble.draw(ctx);
            if(bubble.y < 0 - bubble.radius * 2){
                this.bubblesArray.splice(i, 1);
                continue; // Eleman silindi, döngünün bir sonraki adımına geç.
            }
            const dx = bubble.x - this.player.x;
            const dy = bubble.y - this.player.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < bubble.radius + this.player.radius && !bubble.counted) {
                if (bubble.sound === 'sound1') bubblePop1.play();
                else bubblePop2.play();
                this.score++;
                bubble.counted = true;
                this.bubblesArray.splice(i, 1);
            }
        }
    }
    handleEnemies() {
        if (this.gameFrame % 100 == 0) { // Düşmanları daha seyrek ekleyelim
            this.enemiesArray.push(new Enemy());
        }
        // Diziyi tersten döngüye alarak 'splice' kullanımını güvenli hale getiriyoruz.
        for (let i = this.enemiesArray.length - 1; i >= 0; i--) {
            const enemy = this.enemiesArray[i];
            enemy.update();
            enemy.draw(ctx);
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < enemy.radius + this.player.radius) {
                this.handleGameOver();
            }
        }
    }
    handleGameOver() {
        ctx.fillStyle = "white";
        ctx.fillText('Oyun bitti, Skorun: ' + this.score, 130, 250);
        ctx.fillText("Yeniden başlamak için r tuşuna basınız...", 30, 300);
        this.gameOver = true;
    }
    restart() {
        this.score = 0;
        this.gameFrame = 0;
        this.gameOver = false;
        this.player = new Player();
        this.bubblesArray = [];
        this.enemiesArray = [];
        animate();
    }
    update() {
        this.background.update();
        this.player.update();
        this.handleBubbles();
        this.handleEnemies();
        this.gameFrame++;
    }
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.background.draw(ctx);
        this.player.draw(ctx);
        this.bubblesArray.forEach(bubble => bubble.draw(ctx));
        this.enemiesArray.forEach(enemy => enemy.draw(ctx));
        ctx.fillStyle = "black";
        ctx.fillText('score: ' + this.score, 10, 50);
    }
}

const game = new Game();

function animate() {
    game.update();
    game.draw();
    if (!game.gameOver) requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', function() { // Canvas pozisyonunu yeniden boyutlandırmada güncelle
    game.canvasPosition = canvas.getBoundingClientRect();
});

});