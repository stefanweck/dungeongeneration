/**
 * Player constructor
 *
 * @class Roguelike.Player
 * @classdesc A player object that creates his own layout!
 *
 * @property {Roguelike.Game} game - Reference to the current game object
 * @param {object} position - The x and y coordinate of this player, in tiles
 */
Roguelike.Player = function(game, position) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {object} position - The x and y coordinate of this player, in tiles
	 */
	this.position = Object.create(position);

	/**
	 * @property {int} speed - The speed of the player, in tiles
	 */
	this.speed = 1;

	//Initialize itself
	this.initialize();

};

Roguelike.Player.prototype = {

	/**
	 * Initialize the player object, set the controls
	 * @protected
	 */
	initialize: function() {

		//Reference to the current player object
		var _this = this;

		//Add up key and tell it to move the player up when it hits
		var upKey = this.game.keyboard.getKey(38);
		var moveUp = function() {
			this.move('up');
		};

		//Add up key and tell it to move the player up when it hits
		var downKey = this.game.keyboard.getKey(40);
		var moveDown = function() {
			this.move('down');
		};

		//Add up key and tell it to move the player up when it hits
		var leftKey = this.game.keyboard.getKey(37);
		var moveLeft = function() {
			this.move('left');
		};

		//Add up key and tell it to move the player up when it hits
		var rightKey = this.game.keyboard.getKey(39);
		var moveRight = function() {
			this.move('right');
		};

		//Add the current functionality to the keys and refer to the player object
		upKey.onDown.on(38, moveUp, _this);
		downKey.onDown.on(40, moveDown, _this);
		leftKey.onDown.on(37, moveLeft, _this);
		rightKey.onDown.on(39, moveRight, _this);

	},

	/**
	 * The function that get's called when the player moves
	 * @protected
	 */
	move: function(direction) {

		//Check which controls are being pressed and update the player accordingly
		if(direction === 'left' && this.game.map.tiles[this.position.y][this.position.x - this.speed].type === 2) {
			this.position.x -= this.speed;
		}else if(direction === 'up' && this.game.map.tiles[this.position.y - this.speed][this.position.x].type === 2) {
			this.position.y -= this.speed;
		}else if(direction === 'right' && this.game.map.tiles[this.position.y][this.position.x + this.speed].type === 2) {
			this.position.x += this.speed;
		}else if(direction === 'down' && this.game.map.tiles[this.position.y + this.speed][this.position.x].type === 2) {
			this.position.y += this.speed;
		}

		//Update the game when the player moves
		this.game.update();

	}

};
