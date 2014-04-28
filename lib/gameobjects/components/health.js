/**
 * Health Component constructor
 *
 * @class Roguelike.Components.Health
 * @classdesc The health component is responsible for managing the health
 *
 * @param {Number} maxHealth - The new and maximum health of the entity
 */
Roguelike.Components.Health = function(maxHealth) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'health';

	/**
	 * @property {Number} health - The starting, and maximum health of the entity
	 */
	this.health = this.maxHealth = maxHealth;

};

Roguelike.Components.Health.prototype = {

	/**
	 * Check whether the entity is dead
	 * @protected
	 *
	 * @return {Boolean} True when dead, false when alive
	 */
	isDead: function() {

		//Return true or false based on the entities health
		return this.health <= 0;

	},

	/**
	 * Function to take damage
	 * @protected
	 */
	takeDamage: function(damage) {

		//Subtract the damage from the health of this entity
		this.health -= damage;

	}

};
