window.addEventListener("load", function(){
    /*Aquí estamos guardando una referencia al elemento <canvas> en la variable canvas*/
    const canvas = document.getElementById("canvas-1");
    /*variable ctx para guardar el contexto de gráficos 2D, que es la herramienta que realmente utilizaremos para dibujar.*/
    const ctx =  canvas.getContext("2d");
    /*Medidas del lienzo*/
    canvas.width = 700;
    canvas.height = 500;

    /* Clase principal que convierte las pulsaciones de teclas del usuario en acciones concretas*/
    class InputHandler{
        constructor(game){
            this.game = game;
            window.addEventListener("keydown", e => {
                if((    (e.key === "ArrowUp") || (e.key === "ArrowDown")
                    ) && (this.game.keys.indexOf(e.key)  === -1)){
                    this.game.keys.push(e.key);
                } else if(e.key === ' '){
                    this.game.player.shootTop();
                }else if(e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
                console.log(this.game.keys);
            });

            window.addEventListener("keyup", e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
                console.log(this.game.keys);
            });

        }
    }

    /* Clase que permite crear y modificar la velocidad y dimensiones de los proyectiles*/
    class Projectile{
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10; 
            this.height = 5;
            this.speed = 3;
            this.markedForDeletion = false;
        }

        update(){
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) {
                this.markedForDeletion = true;
            }
        }
        /* Metodo que permite dibujar y colear los misiles*/
        draw(context){
            context.fillStyle = "red";
            context.fillRect(this.x, this.y, this.width, this.height);
        }

        
    }
    /* Clase principal del jugador que incluye el constructor game que permite visualizar 
    y realizar las operaciones que manda el usuario*/
    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.speedY = 0.5;
            this.maxSpeed = 3;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.maxFrame= 37;
        }

        update(){
            this.y += this.speedY;
            if (this.game.keys.includes("ArrowUp")) {
                this.speedY = -1;
            } else if(this.game.keys.includes("ArrowDown")) {
                this.speedY = 1;
            } else {
                this.speedY = 0;
            }

            this.y += this.speedY;
            this.projectiles.forEach(projectile => {
                projectile.update();
            });

            this.projectiles = this.projectiles.filter(projectile =>!projectile.markedForDeletion);
            if(this.frameX< this.maxFrame){
                this.frameX++;
            }else{
                this.frameX = 0;
            }

        }

        draw(context){
            if(this.game.debug)context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image,
                                this.frameX*this.width,
                                this.frameY*this.height,
                                this.width, this.height,
                                this.x, this.y, 
                                this.width, this.height
                                );
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            
        }
        /* Metodo que controla el numero de disparos*/
        shootTop(){
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x+80, this.y+30));
                this.game.ammo--;
            }

        }

    }
    /*Clase principal que permite crear y controlar las caracteristicas de los enemigos*/
    class Enemy{
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random()*-0.5-0.5;
            this.markedForDeletion = false;
            this.lives = 8;
            this.score = this.lives;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }

        update(){
            this.x += this.speedX;
            if(this.x + this.width < 0){
                this.markedForDeletion = true;
            }
            if(this.frameX < this.maxFrame){
                this.frameX++;
            }else{
                this.frameX = 0;
            }
        }

        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, 
                                this.frameX*this.width,
                                this.frameY*this.height,
                                this.width, this.height,
                                this.x, this.y,
                                this.width, this.height
                                );
            context.font = "20px Helvetica";
            context.fillText(this.lives, this.x, this.y);
        }
    }

    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random()*(this.game.height*0.9-this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random()*3);

        }
    }
    /* Clase principal que permite insertar y modificar el escenario de juego, controla y 
    permite visualizar el entorno donde se desplaza el jugador*/ 
    class Layer{
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }

        update(){
            if(this.x <= -this.width)this.x = 0;
            else this.x -= this.game.speed*this.speedModifier;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }
    /* Clase que invoca los diferentes layers(capas), para ambientar el escenario 2d por donde se desplaza el jugador(player)*/
    class BackGround{
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById("layer1");
            this.image2 = document.getElementById("layer2");
            this.image3 = document.getElementById("layer3");
            this.image4 = document.getElementById("layer4");
            
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1.2);
            this.layer4 = new Layer(this.game, this.image4, 1.7);

            this.layers = [this.layer1, this.layer2, this.layer3];
        }

        update(){
            this.layers.forEach(layer=>layer.update());
        }

        draw(context){
            this.layers.forEach(layer=>layer.draw(context));
        }

    }
    /*Clase que permite invocar y modificar los alerts de cada vez que ganas, pierdes, numero de municiones, etc.*/
    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = "Helvetica";
            this.color = "cyan";
        }

        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = "black";
            context.font = this.fontSize + "px " + this.fontFamily;
            context.fillText("Score " + this.game.score, 20, 40);
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5*i,50,3,20);
            }
            const formattedTime = (this.game.gameTime*0.001).toFixed(1);
            context.fillText("Timer: " + formattedTime, 20, 100);
            if (this.game.gameOver) {
                context.textAlign = "center";
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore) {
                    message1 = "Felicidades!";
                    message2 = "Ganaste";
                    
                } else {
                    message1 = "Lo siento";
                    message2 = "Perdiste! :(";
                }
                context.font = "50px " + this.fontFamily;
                context.fillText(   message1, 
                                    this.game.width*0.5, 
                                    this.game.height*0.5-20);
                context.font = "25px " + this.fontFamily;
                context.fillText(   message2,
                                    this.game.width*0.5,
                                    this.game.height*0.5+20);
            }
            
            context.restore();
        }
    }

    /* Clase que permite construir la logica del juego, permite configurar los detalles del juego, tiempo, score, etc.*/ 
    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.backGround = new BackGround(this);
            this.keys = [];
            this.ammo = 30;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.maxAmmo = 50;
            this.enemies = [];
            this.enemiesTimer = 0;
            this.enemiesInterval = 2000;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 50;//Modificamos el score
            this.gameTime = 0;
            this.timeLimit = 25000;//Modificamos el tiempo de duración del juego
            this.speed = 1;
            this.debug = false;
        }

        update(deltaTime){
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.backGround.update();
            this.backGround.layer4.update();
            this.player.update();
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) {
                    this.ammo++;
                    this.ammoTimer = 0;
                }
            } else {
                this.ammoTimer += deltaTime;
            }

            this.enemies.forEach(enemy =>{
                enemy.update();
                if (this.checkCollition(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectile =>{
                    if (this.checkCollition(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0) {
                            enemy.markedForDeletion = true; 
                            if(!this.gameOver)this.score += enemy.score;
                            if (this.score > this.winningScore)  {
                                this.gameOver = true;
                            }
                        }
                    }
                });
            });

            this.enemies = this.enemies.filter(enemy=>!enemy.markedForDeletion);

            if (this.enemiesTimer > this.enemiesInterval && !this.gameOver) {
                this.addEnemy();
                this.enemiesTimer = 0;
            } else {
                this.enemiesTimer += deltaTime;
            }

        }

        draw(context){
            this.backGround.draw(context);
            this.player.draw(context);
            this.ui.draw(context);

            this.enemies.forEach(enemy =>{
                enemy.draw(context);
            });
            this.backGround.layer4.draw(context);
        }

        addEnemy(){
            this.enemies.push(new Angler1(this));
        }

        checkCollition(rect1, rect2){
            return(     rect1.x < rect2.x + rect2.width
                        && rect1.x + rect1.width > rect2.x
                        && rect1.y < rect2.y + rect2.height
                        && rect1.height + rect1.y > rect2.y
                );
        }

    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);
});