//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Weapon Component constructor
 *
 * @class Weapon
 * @classdesc The weapon of an entity
 * NOTE: this class is due to some heavy changes
 *
 * @param {Number} damage - The damage that this weapon does
 */
var Weapon = function(damage) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'weapon';

	/**
	 * @property {Number} damage - The damage that this weapon does
	 */
	this.damage = damage;

};

//Export the Browserify module
module.exports = Weapon;
