//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Inventory System constructor
 *
 * @class Open
 * @classdesc The Inventory system handles grabbing/dropping items and manages other inventory actions
 *
 * @param {Game} game - Reference to the currently running game
 */
var Inventory = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

};

Inventory.prototype = {

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Entity} entity - The entity that is being processed by this system
	 */
	pickUpOne: function(entity) {

		//Get the components from the current entity and store them temporarily in a variable
		var positionComponent = entity.getComponent("position");
		var inventoryComponent = entity.getComponent("inventory");

		//If the inventory is full, we can exit as soon as possible
		if(inventoryComponent.isFull()){

			//Add the text log message to the textlog
			this.game.UI.textLog.addMessage('Your inventory is full!');

			return;

		}

		//Get the tile to which the entity is trying to move
		var currentTile = this.game.map.getTileAt(positionComponent.position);

		//Define variables
		var pickups = [];

		//Check if there are more entities on the tile than just the entity that we are processing
		if(currentTile.entities.length > 1) {

			//Loop through each entity and check if they have the 'canPickUp' component
			for(var i = 0; i < currentTile.entities.length; i++){

				if(currentTile.entities[i].hasComponent('canPickUp')){

					pickups.push(currentTile.entities[i]);

				}

			}

		}

		if(pickups.length === 0){

			//Add the text log message to the textlog
			this.game.UI.textLog.addMessage('There is nothing here...');

			return;

		}

		//Get the first item from the list of entities that we can pick up
		var pickup = pickups.shift();

		//Add the entity to the inventory component
		inventoryComponent.add(pickup);

		//Add the text log message to the textlog
		this.game.UI.textLog.addMessage('You picked up a ' + pickup.name);

		//Remove the entity from the list of entities on the map
		this.game.map.entities.removeEntity(pickup);

		//Remove the entity from the tile
		currentTile.removeEntity(pickup);

	},

	pickUpAll: function() {

	}

};

//Export the Browserify module
module.exports = Inventory;

