//instance variables for stats/traits of sprites
//user data
var gold = 500;
var cost = 300;
var level = 0;
var counter = 0;
var lives = 30;
var score = 0;
var highscores = [];
var rangecost = 600;
var speedcost = 1000;
//sprite data
var enemies = [];
var towers = [];
var range = 16;
var fireInterval = 30;
var towhurs;
//enemy sprite/bullets group;walls;image data; xy coords;
var eSprites,bullets,bottom,exit,img,animated,tImage,eneX,eneY,bull;

/* -------------------- canvas functions  -------------------- */
//images to grab prior to the page loading
function preload() {
 animated = loadAnimation("/images/run/24.png","/images/run/31.png");
 img = loadImage("/images/playarea.png");
 tImage = loadImage("/images/tower.png");
 bull = loadImage("/images/bullet.png");
}
//one time run of the canvas/ functions
//functions defined in p5 or p5.play must be used in setup or draw or in functions only used within the two
function setup() {
  //create the canvas 900x550
  var canv = createCanvas(900,550);
  //link the canvas to the div #canvasholder
  canv.parent('canvasHolder');
  //create a sprite along the bottom and right of the canvas to act as a wall
  bottom = createSprite(500,550,600,0);
  exit = createSprite(900,250,0,300);
  //make it rigid
  bottom.immovable = true;
  exit.immovable = true;
  //enemy sprites group defined here to allow for collider to be used.
  eSprites = new Group();
  //define bulelts group for collisions
  bullets = new Group();
  towhurs = new Group();
	//first time calls to set up the waves
	getScores();
	document.getElementById('next').addEventListener("click",startNextWave);
	initUpgrades();
}

function draw() {
	//add background to the canvas`
	background(img);
	//required to have any sprites appear
  	drawSprites();
  	//live updates the user data
  	document.getElementById('lives').innerText = "Lives: " + lives;
  //	document.getElementById('wave').innerText = "Wave Time: " + waveTime;
  	document.getElementById('level').innerText = "Level: " + level;
  	document.getElementById('gold').innerText = "Gold: " + gold;
  	document.getElementById('description').innerText = "Number of Enemies in next Level: " + (10+(level*level) + "\n Cost of tower: " + cost);
  	document.getElementById('score').innerText = "Score: " + score;
  	document.getElementById('range').innerHTML = "Range <br> " + rangecost + " gold";
  	document.getElementById('speed').innerHTML = "Fire Speed <br> " + speedcost + " gold";
  	//when enemy sprites hit the bottom, bounce!
  	eSprites.bounce(bottom,function(sprite){
  		//bounce does all the position work for me, 
  		//so I was printing "boing!!" into the console to debug this originally
  		//console.log("Boing!!");
  	});

  	//displace function to prevent the overlap of towers
  	towhurs.displace(towhurs);
  	//only allow towers to fire if there is an enemy on screen
  	if(enemies.length > 0){
  	  	eneX = eSprites[0].position.x;
  	  	eneY = eSprites[0].position.y;
  	  }
  	//removes enemies from canvas and enemy group and array and deducts lives.
  	eSprites.collide(exit, function(sprite){
  		sprite.remove();
  		lives--;
  		enemies.shift();

  	})
  	//when a bullet hits an enemy, remove both and give the player 5 gold.
  	eSprites.collide(bullets,function(sprite1,sprite2){
  		sprite1.remove();
  		sprite2.remove();
  		enemies.shift();
  		gold +=5;
  		score += (100);

  	});
  	//has the player lost?
	if (lives <= 0) {
		//stops draw loop
		noLoop();
		//ends the game
		youLose();
	}
	//fire rate of the towers. dont want them to rapid fire now do we?
	if(counter > fireInterval){

		counter = 0;
		towers.forEach(function(tower){
			if(enemies.length > 0)
			fire(tower.x,tower.y);
		})
	}
	counter++;
}

//boolean to prevent placement of towers off screen
function mouseOnCanvas(){
	if (mouseX > 0 && mouseX < 900){
		if (mouseY > 0 && mouseY < 550){
			return true;
		}
	}

	return false;
}

function mouseClicked() {
	//can player afford the cost of the tower?
	if (gold >= cost && mouseOnCanvas()){
		//place a tower at the clicked position and take away the gold cost
		var tower = new Tower(mouseX,mouseY);
		gold = gold - cost;
		cost += 15;
	}
}
/* -------------------- self defined functions -------------------- */
//enemey constructor for the waves of enemies
function Enemy(){
	//the actual sprite on screen
	this.sprite = createSprite(10,0,50,50);
	//angle of entry to the canvas
	this.direction = 41;
	//hp stat, how many bullets can it take before removing from canvas
	this.hp = 10;
	//how fast the sprite moves
	this.speed = 4;
	//what the sprite looks like
	this.sprite.addAnimation("running",animated);
}

//tower constructor
function Tower(x, y) {
	//range stat, how many pixels away can it fire?
	this.range = 150;
	//how much dmg the tower will do to the enemy's hp
	this.dmg = 5;
	//how fast it can fire, in ms
	this.fireRate = 500;
	//tower coords
	this.x = x;
	this.y = y;
	//actual sprite on the canvas
	this.sprite = createSprite(x,y,75,75);
	//image for the sprite
	this.sprite.addImage(tImage);
	//add to tower array
	towers.push(this);
	this.sprite.addToGroup(towhurs);
}

function fire(towerPosX, towerPosY, ){
	// 	a tower will fire every 500ms
	// setinterval(fire(),500);
	// fire will create a bullet
	// bullet = createSprite()
	var projectile = createSprite(towerPosX,towerPosY, 10,10);
	// bullet will be sent toward [attractionPoint()] the enemy
	// bullet.attractionPoint(30,eSprites[0].enemyXpos,eSprites[0].enemyYpos);
	projectile.addToGroup(bullets);
	projectile.addImage(bull);
		//remove bullets after the range is hit.
	projectile.life =  range;
	projectile.attractionPoint(30,eneX,eneY);
	// the location of the first enemy will be used.
}

//wave countdown timer
// function timer(){
// 	//every second
// 	for (var i = 0; i <= 15; i++) {
// 		setTimeout(function(){
// 		//deduct the wavetime
// 			waveTime--;
// 		// if the wave is out of time, reset the timer and stop the function
		
// 		},i*1000);
// 	}

// }



//function to place all enemy sprites on canvas
function wave(level){
	//loop 10 times to place sprites
	for (let i = 0; i < 10 +(level * (level/2)); i++) {
		//wait 300ms
		setTimeout(function(){
			//new enemy
			let sp = new Enemy();
			//add that sprite to the enemy sprites group
			sp.sprite.addToGroup(eSprites);
			//shoot the sprite onto the canvas and downwards toward the 'exit'
			sp.sprite.setSpeed(sp.speed,sp.direction);
			//just a backup to delete the sprite if it doenst get removed by colliders
			sp.sprite.life = 385;
			//add the enemy object into the enemies array
			enemies.push(sp);
		},((i/((level+1)/4)))*200);
	} 	
}
var name;
function youLose(){
	//grab the box
	var box = document.querySelector('.over');
	//make the game over screen display
	box.style.display = 'inherit';

	//delete the canvas
	remove();
	setTimeout(function(){
		var user = {
			name: prompt("Enter your name: "),
			points: score
		}
		addScore(user);
		var scoreString = ""
		for (var i = 0; i < 5; i++) {
			scoreString += (i+1) + ". " + highscores[i].name + "\t"+ highscores[i].points + "<br>";
		}
		box.innerHTML += "High Scores: <br>" + scoreString;
	},2000);
}

function getScores(){
	if (!localStorage.highscores) {
		var scores = [];
		scores.push({
				name: "Donatello",
				points: 35000
			},
			{
				name: "Michaelangelo",
				points: 50000
			},
			{
				name: "Raphael",
				points: 40000
			},
			{
				name: "Leonardo",
				points: 45000
			});
		localStorage.highscores = JSON.stringify(scores);

	}
	highscores = JSON.parse(localStorage.highscores);
	sortScores();

}

function sortScores(){
	highscores.sort(function (a, b) {
  		return b.points - a.points;
	});
	console.log(highscores);
}

function addScore(user){
	highscores.push(user);
	sortScores();
	localStorage.highscores = JSON.stringify(highscores);
}

function initUpgrades(){

	document.querySelector('#range').addEventListener("click",function(){
		if (gold >= rangecost){
			gold -= rangecost;
			range *= 2;
			rangecost *=2;
		}
	});
	document.querySelector('#speed').addEventListener("click",function(){
		if (gold >= speedcost){
			gold -= speedcost;
			fireInterval /= 1.5;
			speedcost *= 2;
		}
	});
}

function startNextWave() {
	wave(level++);
}




