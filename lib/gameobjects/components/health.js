/**
 * Health Component constructor
 *
 * @class Roguelike.Components.Health
 * @classdesc The health component is responsible for managing the health
 *
 * @param {number} maxHealth - The new and maximum health of the entity
 */
Roguelike.Components.Health = function(maxHealth) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'health';

	/**
	 * @property {number} health - The starting, and maximum health of the entity
	 */
	this.health = this.maxHealth = maxHealth;

};

Roguelike.Components.Health.prototype = {

	/**
	 * Check whether the entity is dead
	 * @protected
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
