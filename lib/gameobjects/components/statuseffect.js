//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Status Effect Component constructor
 *
 * @class StatusEffectComponent
 * @classdesc The Status Effect Component holds all status effects on an entity
 */
var StatusEffectComponent = function() {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'statusEffectComponent';

	/**
	 * @property {Array} statusEffects - An array with every status effect that is on this entity
	 */
	this.statusEffects = [];

};

//Export the Browserify module
module.exports = StatusEffectComponent;
