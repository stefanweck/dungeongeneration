//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var StatusEffect = require('./statuseffect.js');

/**
 * Fire Status Effect constructor
 *
 * @class StatusFire
 * @classdesc Whenever an entity is on fire this status effect is applied to the entity
 * Inherits from Status Effect
 */
var StatusFire = function() {

	/**
	 * Inherit the constructor from the Element class
	 */
	StatusEffect.call(this);

	/**
	 * @property {String} name - The name of this status effect. This field is always required!
	 */
	this.name = 'Fire';

	/**
	 * @property {Number} turnsLeft - The amount of turns this status effect is going to last
	 */
	this.turnsLeft = 5;

	/**
	 * @property {Boolean} stackable - Can this status effect be applied more than once
	 */
	this.stackable = false;

	/**
	 * @property {Boolean} addStack - If this effect is stackable, should the turns left be added or reset to it's default value
	 */
	this.addStack = false;

};

StatusFire.prototype = Object.create(StatusEffect.prototype, {

	/**
	 * Function that gets called whenever the game updates 1 tick
	 * @protected
	 *
	 * @param {Entity} entity - The entity that is currently acting
	 */
	update: {

		value: function(entity) {

			//TODO: Make this the stats component, we don't want individual components for everything
			//Get the correct components
			var healthComponent = entity.getComponent('health');

			//Damage the health component with the fire damage
			healthComponent.takeDamage(5);

			//Perform the base update
			this.baseUpdate(entity);

		}

	}

});

//Export the Browserify module
module.exports = StatusFire;
