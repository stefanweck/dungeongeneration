//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Fire Status Effect constructor
 *
 * @class StatusFire
 * @classdesc An component that tells the system that this entity can be opened by another entity
 */
var StatusFire = function() {

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

StatusFire.prototype = {

	/**
	 * Function that gets called when the entity acts in his turn
	 * @protected
	 *
	 * @param {Entity} entity - The entity that is currently acting
	 */
	act: function(entity) {

		//TODO: Make this the stats component, we don't want individual components for everything
		//Get the correct components
		var healthComponent = entity.getComponent('health');

		//Damage the health component with the fire damage
		healthComponent.takeDamage(5);

		//We have performed another turn
		this.turnsLeft--;

		//If there are zero turns left, remove this status effect
		if(this.turnsLeft === 0){

			//Remove the status effect
			entity.removeStatusEffect(this);

		}

	}

};

//Export the Browserify module
module.exports = StatusFire;
