/**
 * Weapon Component constructor
 *
 * @class Roguelike.Components.Weapon
 * @classdesc The weapon of an entity
 * NOTE: this class is due to some heavy changes
 *
 * @param {Number} damage - The damage that this weapon does
 */
Roguelike.Components.Weapon = function(damage) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'weapon';

	/**
	 * @property {Number} damage - The damage that this weapon does
	 */
	this.damage = damage;

};
