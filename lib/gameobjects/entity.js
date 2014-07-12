//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Entity constructor
 *
 * @class Entity
 * @classdesc A single entity in the game world
 *
 * @param {Game} game - Reference to the currently running game
 * @param {String} name - The name of this entity
 * @param {Number} speed - The speed of this entity
 */
var Entity = function(game, name, speed) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {String} name - The name of this entity
	 */
	this.name = name;

	/**
	 * @property {Number} speed - The speed of this entity
	 */
	this.speed = speed || 1000;

	/**
	 * @property {Object} components - An object filled with all the components this entity has
	 */
	this.components = {};

	/**
	 * @property {Array} statusEffects - An array with every status effect that is on this entity
	 */
	this.statusEffects = [];

};

Entity.prototype = {

	/**
	 * Function that gets called when this entity is in a scheduler and it
	 * is his turn
	 * @protected
	 */
	act: function() {

		//Check if there should be status effects applied
		if(this.statusEffects.length > 0){

			//Loop through all status effects
			for(var i = 0; i < this.statusEffects.length; i++){

				//Apply the current status effect to this entity
				this.statusEffects[i].act(this);

			}

		}

		//If this is a player, lock the scheduler
		if(this.hasComponent("keyboardControl")) {

			this.game.scheduler.lock();

		}else{

			//Get the components
			var movementComponent = this.getComponent("movement");

			//Execute movement component behaviour
			movementComponent.execute();

		}

	},

	/**
	 * A function that returns the speed of this entity
	 * @protected
	 *
	 * @return {Number} The speed of this entity
	 */
	getSpeed: function() {

		return this.speed;

	},

	/**
	 * Check whether this entity has a certain component
	 * @protected
	 *
	 * @param {String} name - The name of the component
	 *
	 * @return {Boolean} True when the entity has the component, false when it doesn't have the component
	 */
	hasComponent: function(name) {

		return (this.components[name] !== undefined);

	},

	/**
	 * Get a certain component on this entity
	 * @protected
	 *
	 * @param {String} name - The name of the component
	 *
	 * @return {Object} The component that this entity has
	 */
	getComponent: function(name) {

		return this.components[name];

	},

	/**
	 * Add an existing component to this entity
	 * @protected
	 *
	 * @param {Object} component - The component that is getting added to this entity
	 */
	addComponent: function(component) {

		//Add the component
		this.components[component.name] = component;

	},

	/**
	 * Remove a component from this entity
	 * @protected
	 *
	 * @param {Object} component - The component that is getting removed from this entity
	 */
	removeComponent: function(component) {

		//Add the component
		this.components[component.name] = undefined;

	}

};

//Export the Browserify module
module.exports = Entity;
