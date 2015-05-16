/* Global Variables */
// Game state
var gameStarted = false;    // used in engine.js

// All player character (sprite) Strings
var playerSprites = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];

// All gem sprite Strings
var gemSprites = [
    'images/gem-blue.png',
    'images/gem-green.png',
    'images/gem-orange.png'
];

// Global Player info
var playerStartPosition = {x: 200, y: 400};
var playerStep = {x: 100, y: 83};

// Global Enemy info
var enemyStartHeights = [60, 140, 220];
var enemyStartWidth = -100;
var enemyEndWidth = 550;
var enemyVelocities = [100, 150, 200, 250, 300];
var minDist = 60;   // minimum separation distance before collision
var numEnemies = 3;

// Global Gem info
var gemOffset = {x: 101, y: 83};    // used to position gems
var gemValues = [50, 100, 150];

/* Global Functions */
// Return a random number in a specified range (inclusive of min, exclusive of max)
var randomRange = function (min, max) {
    return min + Math.floor((max - min) * Math.random());
};

// Choose a random player sprite character
var randomCharacter = function() {
    return playerSprites[randomRange(0, playerSprites.length)];
};

// Choose a random enemy start position
var randomEnemyStartPosition = function() {
    return {
        x: enemyStartWidth,
        y: enemyStartHeights[randomRange(0, enemyStartHeights.length)]
    };
};

// Choose a random enemy velocity
var randomEnemyVelocity = function() {
    return enemyVelocities[randomRange(0, enemyVelocities.length)];
};

// Choose a random gem sprite
var randomGemSprite = function () {
    return gemSprites[randomRange(0, gemSprites.length)];
};

// Choose a random gem position
var randomGemPosition = function() {
    return {
        x: gemOffset.x * randomRange(0, 5),
        y: gemOffset.y * randomRange(1, 3) + 60 // 60 is offset from top
    };
};

// Choose a random gem value
var randomGemValue = function() {
    return gemValues[randomRange(0, gemValues.length)];
};

/* Enemy Class */
var Enemy = function() {
    var p = randomEnemyStartPosition();
    this.x = p.x;                   // x position
    this.y = p.y;                   // y position
    this.v = randomEnemyVelocity(); // velocity
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position (dt is a time delta between ticks)
Enemy.prototype.update = function(dt) {
    // update horizontal position using velocity and time
    this.x = this.x + (this.v * dt);

    // Check if enemy has exited field of view
    if (this.x > enemyEndWidth) {

        // reset to new position and velocity
        var p = randomEnemyStartPosition();
        this.x = p.x;
        this.y = p.y;
        this.v = randomEnemyVelocity();
    }

    // Collision handling
    // vertical bounding region
    if (player.y > this.y - minDist && player.y < this.y + minDist) {

        // horizontal bounding region
        if (player.x > this.x - minDist && player.x < this.x + minDist) {

            // simulate player death
            player.reset();
        }
    }
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* Player Class */
var Player = function() {
    this.x = playerStartPosition.x;
    this.y = playerStartPosition.y;
    this.lives = 3;
    this.score = 0;
    this.sprite = randomCharacter();
    this.key = null;
};

// perform movement
Player.prototype.update = function() {

    // move Player based on key and current position
    if (this.key === 'left' && this.x > 0) { 
        this.x = this.x - playerStep.x;
    }
    else if (this.key === 'right' && this.x < 400) {
        this.x = this.x + playerStep.x;
    }
    else if (this.key === 'up') {
        this.y = this.y - playerStep.y;
        if (this.y < 0) {
            // entered water
            this.reset();
        }
    }
    else if (this.key === 'down' && this.y < 400) {
        this.y = this.y + playerStep.y;
    }

    // clear pressed key
    this.key = null;
};

// render method
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// update player key property
Player.prototype.handleInput = function(key) {
    this.key = key;
};

// decrement lives and update text
Player.prototype.reset = function() {
    this.x = playerStartPosition.x;
    this.y = playerStartPosition.y;
    this.lives--;
    $("#lives").text('Lives: ' + this.lives);
    if (this.lives < 0) {
        gameOver(this);
    }
};

/* Gem Class */
var Gem = function() {
    this.sprite = randomGemSprite();
    this.value = randomGemValue();
    this.resetPosition();
};

// assign the gem a random position
Gem.prototype.resetPosition = function() {
    var p = randomGemPosition();
    this.x = p.x;
    this.y = p.y;
};

// update method
Gem.prototype.update = function() {

    // Collision handling

    // vertical bounding region
    if (player.y > this.y - minDist && player.y < this.y + minDist) {

        // horizontal bounding region
        if (player.x >= this.x - minDist && player.x <= this.x + minDist) {

            // update score
            player.score += gem.value;

            // update gem value
            this.value = randomGemValue();

            // update score text
            $("#score").text('Score: ' + player.score);

            // reset gem position randomly
            this.resetPosition();
        }
    }
};

// render method
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* Game Management Functions */
// a function to handle the game end sequence
var gameOver = function(player) {
    gameStarted = false;
    $("#data-row").hide();
    $("#game-over").show();
    $("#final-score").text('Score: ' + player.score);
};

var startGame = function() {
    $("#start-button").hide();
    gameStarted = true;
    time();
};

// a countdown timer function
var time = function() {

    var s = 61; // seconds in timer

    function second() {

        // update time
        s--;

        // update text
        var time = $("#time").text('Time: ' + s);

        // set callback or end game
        if (s > 0) {
            setTimeout(second, 1000);
        }
        else {
            gameOver(player);
        }
    }

    // execute second function
    second();
};

/* Object Instantiation */
var allEnemies = [];
for (var i = 0; i < numEnemies; i++) {
    allEnemies.push(new Enemy());
}
var player = new Player();
var gem = new Gem();

/* Input Event Handling */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
