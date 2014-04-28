/**
 * KeyboardControl Component constructor
 *
 * @class Roguelike.Components.KeyboardControl
 * @classdesc An component that tells the system that this entity can be controlled with the keyboard
 *
 * @property {Roguelike.Game} game - Reference to the current game object
 * @property {object} controls - Associative array with every control that this entity uses
 */
Roguelike.Components.KeyboardControl = function(game, controls) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'keyboardControl';

	/**
	 * @property {array} controls - Associative array with every control that this entity uses
	 */
	this.controls = controls;

	/**
	 * @property {Roguelike.Keyboard} keyboard - Reference to the keyboard object
	 */
	this.keyboard = game.keyboard;

	/**
	 * @property {Roguelike.Scheduler} scheduler - Reference to the scheduler object
	 */
	this.scheduler = game.scheduler;

	//Initialize the component
	this.initialize();

};

Roguelike.Components.KeyboardControl.prototype = {

	/**
	 * The 'constructor' for this component
	 * Adds the event listener for keyboards events on this entity
	 * @protected
	 */
	initialize: function() {

		//Make sure the function inside the event listener can reach the scheduler
		var _this = this;

		//Loop through each control keycode of this entity
		for(var key in _this.controls){

			switch(key){

				case("left"):

					//Add up key and tell it to move the entities up when it hits
					var leftKey = this.keyboard.getKey(_this.controls[key]);

					//Function to perform
					var moveLeft = function() {
						_this.newPosition("left");
					};

					//Attach the function to the keydown event
					leftKey.onDown.on(_this.controls[key], moveLeft, _this);

					break;

				case("right"):

					//Add up key and tell it to move the entities up when it hits
					var rightKey = this.keyboard.getKey(_this.controls[key]);

					//Function to perform
					var moveRight = function() {
						_this.newPosition("right");
					};

					//Attach the function to the keydown event
					rightKey.onDown.on(_this.controls[key], moveRight, _this);

					break;

				case("up"):

					//Add up key and tell it to move the entities up when it hits
					var upKey = this.keyboard.getKey(_this.controls[key]);

					//Function to perform
					var moveUp = function() {
						_this.newPosition("up");
					};

					//Attach the function to the keydown event
					upKey.onDown.on(_this.controls[key], moveUp, _this);

					break;

				case("down"):

					//Add up key and tell it to move the entities up when it hits
					var downKey = this.keyboard.getKey(_this.controls[key]);

					//Function to perform
					var moveDown = function() {
						_this.newPosition("down");
					};

					//Attach the function to the keydown event
					downKey.onDown.on(_this.controls[key], moveDown, _this);

					break;

			}

		}

	},

	/**
	 * The function that gets called when a player moves
	 * @protected
	 *
	 * @param {string} direction - The direction the entities are being moved
	 */
	newPosition: function(direction) {

		//Define variables
		var newPosition;

		//Check which controls are being pressed and update the player accordingly
		switch(direction) {

			case ("left"):

				newPosition = new Roguelike.Vector2(-1, 0);

				break;

			case ("up"):

				newPosition = new Roguelike.Vector2(0, -1);

				break;

			case ("right"):

				newPosition = new Roguelike.Vector2(1, 0);

				break;

			case ("down"):

				newPosition = new Roguelike.Vector2(0, 1);

				break;

		}

		//Tell some system that you want to move here


		//TODO: unlock scheduler somewhere
		//Unlock the scheduler because the player has moved
		this.scheduler.unlock();

	}

};
