/**
 * Collision System constructor
 *
 * @class Roguelike.Systems.Collision
 * @classdesc The collision system is responsible for handling collision between entities
 *
 * @param {int} game - Reference to the currently running game
 */
Roguelike.Systems.Collision = function(game) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'collision';

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.Systems.Collision.prototype = {

	/**
	 * Initialize the system, create all objects and variables
	 * @protected
	 */
	initialize: function() {



	},

	/**
	 * Function that gets called when an entity wants to move
	 * @protected
	 */
	checkForCollision: function(direction) {



	}

};
