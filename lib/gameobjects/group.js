/**
 * Control constructor
 *
 * @class Roguelike.Group
 * @classdesc The object that holds multiple entities and is able to search them
 */
Roguelike.Group = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {array} entities - Collection of all the entities in this group
	 */
	this.entities = [];

};

Roguelike.Group.prototype = {

	/**
	 * Function to add a new entity to this group
	 * @protected
	 */
	addEntity: function(entity) {

		//Check if the entity is the correct object
		if(typeof entity !== "Roguelike.Entity") {
			return;
		}

		//Add the current entity to the list
		this.entities.push(entity);

	},

	/**
	 * Function to remove an entity from this group
	 * @protected
	 */
	removeEntity: function(entity) {

		//Check if the entity exists
		if(this.entities) {
			return;
		}

		//Add the current entity to the list
		this.entities.push(entity);

	}

};
