//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Status Effect constructor
 *
 * @class StatusEffect
 * @classdesc The base class for status effects
 */
var StatusEffect = function() {

	/**
	 * @property {String} name - The name of this status effect. This field is always required!
	 */
	this.name = 'Base Effect';

	/**
	 * @property {Number} turnsLeft - The amount of turns this status effect is going to last
	 */
	this.turnsLeft = 0;

	/**
	 * @property {Boolean} stackable - Can this status effect be applied more than once
	 */
	this.stackable = false;

	/**
	 * @property {Boolean} addStack - If this effect is stackable, should the turns left be added or reset to it's default value
	 */
	this.addStack = false;

};

StatusEffect.prototype = {

	/**
	 * Function that gets called whenever the game updates 1 tick
	 * This function should be overwritten by status effects
	 * @protected
	 *
	 * @param {Entity} entity - The entity that is currently acting
	 */
	update: function(entity) {

		//Perform the base update
		this.baseUpdate(entity);

	},

	/**
	 * Function that checks if this status effect should be removed already
	 * @protected
	 *
	 * @param {Entity} entity - The entity that is currently acting
	 */
	baseUpdate: function(entity) {

		//We have performed another turn
		this.turnsLeft--;

		//If there are zero turns left, remove this status effect
		if(this.turnsLeft <= 0){

			//Remove the status effect
			entity.removeStatusEffect(this);

		}

	}

};

//Export the Browserify module
module.exports = StatusEffect;
