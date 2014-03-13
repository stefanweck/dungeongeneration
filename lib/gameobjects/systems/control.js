/**
 * Control System constructor
 *
 * @class Roguelike.Systems.Control
 * @classdesc The control system is responsible for handling user input
 *
 * @param {int} game - Reference to the currently running game
 */
Roguelike.Systems.Control = function(game) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'control';

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Keyboard} keyboard - Reference to the keyboard object
	 */
	this.keyboard = null;

	/**
	 * @property {Roguelike.Key} upKey - Reference to up key on the keyboard
	 */
	this.upKey = null;

	/**
	 * @property {Roguelike.Key} downKey - Reference to down key on the keyboard
	 */
	this.downKey = null;

	/**
	 * @property {Roguelike.Key} leftKey - Reference to left key on the keyboard
	 */
	this.leftKey = null;

	/**
	 * @property {Roguelike.Key} rightKey - Reference to right key on the keyboard
	 */
	this.rightKey = null;

	//Initialize itself
	this.initialize();

};

Roguelike.Systems.Control.prototype = {

	/**
	 * Initialize the system, create all objects and variables
	 * @protected
	 */
	initialize: function() {

		//Create a new keyboard
		this.keyboard = new Roguelike.Keyboard(this);
		this.keyboard.initialize();

		//Reference to the current system
		var _this = this;

		//Add up key and tell it to move the entities up when it hits
		this.upKey = this.keyboard.getKey(38);

		//Function to perform
		var moveUp = function() {
			_this.moveEntities('up');
		};

		//Attach the function to the keydown event
		this.upKey.onDown.on(38, moveUp, _this);

		//Add down key and tell it to move the entities down when it hits
		this.downKey = this.keyboard.getKey(40);

		//Function to perform
		var moveDown = function() {
			_this.moveEntities('down');
		};

		//Attach the function to the keydown event
		this.downKey.onDown.on(40, moveDown, _this);

		//Add left key and tell it to move the entities left when it hits
		this.leftKey = this.keyboard.getKey(37);

		//Function to perform
		var moveLeft = function() {
			_this.moveEntities('left');
		};

		//Attach the function to the keydown event
		this.leftKey.onDown.on(37, moveLeft, _this);

		//Add right key and tell it to move the entities right when it hits
		this.rightKey = this.keyboard.getKey(39);

		//Function to perform
		var moveRight = function() {
			_this.moveEntities('right');
		};

		//Attach the function to the keydown event
		this.rightKey.onDown.on(39, moveRight, _this);

	},

	/**
	 * Function that gets called when the user pressed one of the arrow keys
	 * @protected
	 *
	 * @param {string} direction - The direction the entities are being moved
	 */
	moveEntities: function(direction) {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("keyboardControl", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++){

			//Move the current entity
			this.moveEntity(direction, entities[i]);

		}

		//All the entities are moved, it's time to update the other game mechanics
		this.game.update();

	},

	/**
	 * The function that gets called when the player moves
	 * @protected
	 *
	 * @param {string} direction - The direction the entities are being moved
	 * @param {Roguelike.Entity} entity - The entity that is being controlled
	 */
	moveEntity: function(direction, entity) {

		//Get the current entities position component
		var entityPosition = entity.getComponent("position");

		//Declare the new position variable
		var newPosition = {};

		//Check which controls are being pressed and update the player accordingly
		switch(direction){

			case ('left'):

				newPosition = {x: entityPosition.x - 1, y: entityPosition.y};

				if(this.game.collisionSystem.canMove(entity, newPosition)){

					entityPosition.x -= 1;

				}

			break;

			case ('up'):

				newPosition = {x: entityPosition.x, y: entityPosition.y - 1};

				if(this.game.collisionSystem.canMove(entity, newPosition)){

					entityPosition.y -= 1;

				}

			break;

			case ('right'):

				newPosition = {x: entityPosition.x + 1, y: entityPosition.y};

				if(this.game.collisionSystem.canMove(entity, newPosition)){

					entityPosition.x += 1;

				}

			break;

			case ('down'):

				newPosition = {x: entityPosition.x, y: entityPosition.y + 1};

				if(this.game.collisionSystem.canMove(entity, newPosition)){

					entityPosition.y += 1;

				}

			break;

		}

	}

};
