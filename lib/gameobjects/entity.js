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
 * @param {String} sprite - The name of the sprite used by this entity
 * @param {Number} speed - The speed of this entity
 */
var Entity = function(game, name, sprite, speed) {

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
	 * @property {String} textureName - The name of the sprite of this entity
	 */
	this.textureName = sprite;

	/**
	 * @property {PIXI.Sprite} sprite - The sprite of this entity
	 */
	this.sprite = PIXI.Sprite.fromFrame(sprite);

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
				this.statusEffects[i].update(this);

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

	},

	/**
	 * Function to return every status effect currently on this entity
	 * @protected
	 *
	 * @return {Array} An array filled with every status effect
	 */
	getStatusEffects: function(){

		return this.statusEffects;

	},

	/**
	 * Function to add a new status effect to this entity
	 * @protected
	 *
	 * @param {Object} statusEffect - The status effect that is being added
	 */
	addStatusEffect: function(statusEffect){

		//We start with the assumption that there isn't a similar status effect
		var index = -1;

		//Loop through each status effect on this entity
		for(var i = 0; i < this.statusEffects.length; i++){

			//If the name of this status effect matches the name of the effect being added
			if(this.statusEffects[i].name === statusEffect.name){

				//We have found our existing and duplicate status effect
				index = i;

				//Stop here because we aren't going to find more
				break;

			}

		}

		//If the status effect haas been found, we try to stack it
		if(index !== -1){

			//If we can stack the status effect
			if(statusEffect.stackable === true){

				//If the status effect should add it's turns left to the existing status effect or
				//if it should reset the status effect back to it's original turns left
				if(statusEffect.addStack === true){

					//Add all new turns left to the existing status effect
					this.statusEffects[index].turnsLeft += statusEffect.turnsLeft;

				}else{

					//Reset the turns left of the existing status effect to the default turns left provided by the new status effect
					this.statusEffects[index].turnsLeft = statusEffect.turnsLeft;

				}

			}

		}else{

			//Add the status effect to the status effects array
			this.statusEffects.push(statusEffect);

		}


	},

	/**
	 * Function to remove a status effect from this entity
	 * @protected
	 *
	 * @param {Object} statusEffect - The status effect that is being removed
	 *
	 * @return {Boolean} Returns true when the status effect is removed, returns false when not
	 */
	removeStatusEffect: function(statusEffect){

		//Try to find the element in the effects array
		var index = this.statusEffects.indexOf(statusEffect);

		//If the status effect isn't found, exit as soon as possible
		if(index === -1) {
			return false;
		}

		//The status effect has been found
		this.statusEffects.splice(index, 1);

		//We've made it all the way down here so the status effect is removed
		return true;

	}

};

//Export the Browserify module
module.exports = Entity;
