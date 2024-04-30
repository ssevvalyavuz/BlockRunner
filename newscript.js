var canvas = document.getElementById("gameCanvas"); 
var context = canvas.getContext("2d"); //Canvas elementini çekiyoruz.

// Sevval Yavuz

var block_size = 40; //Ana bloğumuzun boyutu
var window_Width = 500;
var window_Height = 500;  
canvas.width = window_Width;
canvas.height = window_Height;

let blocks = [];
let score = 0;
let money = 0;
let health = 3;
let player;

class Block {   // Oluşturduğumuz bloklar için bir class oluşturduk
    constructor(xpos, ypos, color, speed) { // Classın constructorü ile blokları oluştururken kullanacağız
        this.xpos = xpos;
        this.ypos = ypos;
        this.color = color;
        this.speed = speed; // Blok hızı
        this.dy = this.speed; // bloğun y eksenindeki değişim hızı
    }

    draw(context){  //bloğu çizdirme fonksiyonu
        context.beginPath();
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, block_size, block_size); // Bloğu çizdiriyoruz
    }

    update(score) { // Bloğun zamanla konumu değiştiği için hem yeni konumu hemde skorla değişen hız fonksiyonu
        this.dy +=(score/100)
        this.ypos += this.dy;
    }
}

class Player {  // Oyuncu Bloğun classını tanımlıyoruz.
    constructor(xpos, ypos, color, control_speed) { // Classın constructorü ile blokları oluştururken kullanacağız
        this.xpos = xpos;
        this.ypos = ypos;
        this.color = color;
        this.control_speed = control_speed;
        this.dy = this.control_speed;
        this.dx = this.control_speed;
        this.size = block_size;
        this.activePowerE = false;
        this.activePowerR = false;
        this.powerCooldown = 0;
    }

    draw(context){  //Oyuncu bloğunu tekrar tekrar cizdirdiğimiz kısım
        context.beginPath();
        context.fillStyle = this.color; // Rengi koyuyoruz.
        context.fillRect(this.xpos, this.ypos, this.size, this.size); // Bloğu çiziyoruz
    }

    update(direction) { // Yön tuşları ile çalışacak fonksiyonumuz.
        // Yön tuşlarına göre ypos ve xpos değerleri güncellenerek oyuncunun konumunu güncelliyoruz.
        if (direction == "up"){
            if(this.ypos <= 0){
                return;
            }
            this.ypos -= this.dy;
        }
        else if(direction == "down"){
            if(this.ypos >= window_Height - block_size){
                return;
            }
            this.ypos += this.dy;
        }
        else if(direction == "right"){
            if(this.xpos >= window_Width - block_size){
                return;
            }
            this.xpos += this.dx;
        }
        else if( direction == "left"){
            if(this.xpos <= 0){
                return;
            }
            this.xpos -= this.dx;
        }
    }

    update_speed(score){ // Skor arttıkca oyuncumuzunda hızı belli oranda artıyor ve oyunun zorluğu değişiyor.
        this.dx += (score);
        this.dy += (score);
    }

    activatePowerE(){   // E tuşuna basınca aktifleşecek fonksiyon
        if (this.activePowerE) return; // Eğer aktifse tekrar aktifleşmemesi için
        if (money >= 4) {   // 4 Paramız varsa çalışacak
            this.activePowerE = true;   
            money -= 4;
            this.dy *= 2;// Hızlarımız 2 katına çıkıyor
            this.dx *= 2;
            setTimeout(() => {  // 4 saniye sonunda aktifleşecek fonksiyon
                this.activePowerE = false;  // Özelliğimiz bittiği için hızlarımız yarıya iniyor.
                this.dy /= 2;
                this.dx /= 2;
            }, 4000);   // Özellik 4 saniye süreceği için 4 saniye sonra bu fonksiyon çalışıyor.
        }
    }

    activatePowerR() {  // R tuşuna basınca çalışacak özellik 
        if (this.activePowerR) return;
        if (money >= 3) {   // 3 para ile çalışıyor
            this.activePowerR = true;
            money -= 3;
            this.size /=2;  // Boyutu yarıya indiriyoruz.
            setTimeout(() => {
                this.activePowerR = false;
                this.size *=2;
            }, 3500);   // 3.5 saniye sonra boyut 2 katına çıkıyor.
        }
    }
}
function startGame(color){  // Oyunu başlatmamıza 
    player = new Player(window_Width / 2, window_Height / 2, color, 5); // Player nesnemizi oluşturuyoruz.
    canvas.style.background = "#fff"    // Canvasın background rengini ayarlıyoruz.
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "inline"; // Başlangıç ekranını gizleyip oyun ekranını getiriyoruz.
    setInterval(createNewBlock, 1000); // Her 1 saniyede 1 yeni blok üreticek fonksiyon
    setInterval(updateGame, 20);    // Her 20ms de bir ekranı yenileyen ve değişimleri gerçekleştiren update fonksiyonu
}


function getRandomColor() { // Oluşturulan bloklar için random renkler seçiliyor
    const colors = ["purple", "aqua", "pink", "black", "purple", "aqua", "pink",];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createNewBlock() { // Yeni blokları oluşturacak fonksiyonumuz.
    let random_x = Math.random() * (window_Width - block_size); // Random bir x kordinati oluşturuyoruz.
    let new_block = new Block(random_x, 0, getRandomColor(), 2); // Yeni blokları class elemanı olarak oluşturuyoruz.
    blocks.push(new_block); // Blok dizimize ürettiğimiz bloğu ekliyoruz.
}

function updateBlocks() {   
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        // Bloğun konumunu güncelliyoruz ve ekrana çiziyoruz.
        block.update(score);
        block.draw(context);
        if (block.ypos > window_Height) {   // Eğer blok ekranın dışına çıktıysa, listeden kaldırıyoruz.
            blocks.splice(i, 1);
            i--;
        }

        // Blok oyuncu ile temas etti mi kontrolünü yapıyoruz.
        if (block.ypos + block_size >= player.ypos && block.ypos <= player.ypos + player.size && block.xpos + block_size >= player.xpos && block.xpos <= player.xpos + player.size) {
            if (block.color === player.color) {
                // Eğer blok ve oyuncunun rengi aynıysa skoru ve parayı artır
                score++;
                money++;
                player.update_speed(score);
            } else if (block.color !== "black") {
                // Eğer blokun rengi siyah değilse, oyuncunun sağlığını 1 birim azalt.
                health--;
                // Eğer sağlık sıfıra düştüyse oyunu sonlandırıyoruz.
                if (health == 0) {
                    endGame();
                }
            } else {
                // Eğer bloğun rengi siyahsa, oyunu sonlandırıyoruz.
                endGame();
                return;
            }
            blocks.splice(i, 1);    // Çarpışma sonucu bloğu listeden kaldır
            i--;
        }
    }
}

function updateGame() { // Canvas çizimlerimizi güncelleyen fonksiyon.
    context.clearRect(0, 0, window_Width, window_Height);
    player.draw(context);   // Oyuncuyu tekrar çizen komut
    updateBlocks(); // Blokların çizimi
    displayScore(); // Skor tablosunun çizimi
}

function displayScore() {   // Skor Para ve Sağlık gibi değerlerin ekrana yazılması.
    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText("Skor: " + score, 10, 30);
    context.fillText("Para: " + money, 10, 60);
    context.fillText("Can: " + health, 10 ,90);
}

function endGame() {    // Oyun bitince alert ile uyarılıyoruz ve sayfaya refresh atıyoruz
    alert("Oyun bitti! Skor: " + score);
    window.location.reload();
}

document.addEventListener("keydown", function(event) {  // Event listenerlar ile klavye aktivitelerini inceleyip gerekli tuşlardaki aksiyonları belirliyoruz.
    switch(event.key) {
        case "ArrowUp":
            player.update("up");
            break;
        case "ArrowDown":
            player.update("down");
            break;
        case "ArrowLeft":
            player.update("left");
            break;
        case "ArrowRight":
            player.update("right");
            break;
        case "w":
            player.update("up");
            break;
        case "s":
            player.update("down");
            break;
        case "a":
            player.update("left");
            break;
        case "d":
            player.update("right");
            break;
        case "r":
            player.activatePowerR();
            break;
        case "e":
            player.activatePowerE();
            break;
    }
    
});

// Sevval Yavuz
