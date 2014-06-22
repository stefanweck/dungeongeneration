//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Event = require('../../input/event.js');

/**
 * CanFight Component constructor
 *
 * @class CanFight
 * @classdesc An component that tells the system that this entity can fight!
 *
 * @property {Game} game - Reference to the current game object
 */
var CanFight = function(game) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'canFight';

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Event} events - Event holder
	 */
	this.events = new Event();

	//Initialize the component
	this.initialize();

};

CanFight.prototype = {

	/**
	 * The 'constructor' for this component
	 * Adds the bump into function to the event list
	 * @protected
	 */
	initialize: function() {

		//Attach the bumpInto function to the bumpInto event
		this.events.on('bumpInto', this.bumpInto, this);

	},

	/**
	 * Function to perform when something collides with this entity
	 * @protected
	 */
	bumpInto: function(entity, collisionEntity) {

		//The combat system will handle the combat!
		this.game.staticSystems.combatSystem.handleSingleEntity(entity, collisionEntity);

	}

};

//Export the Browserify module
module.exports = CanFight;
