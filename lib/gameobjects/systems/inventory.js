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
	 * @public
	 *
	 * @param {Entity} entity - The entity that is being processed by this system
	 * @param {Boolean} multiple - True if you want to pickup multiple items at once
	 */
	pickUp: function(entity, multiple) {

		//Get the components from the current entity and store them temporarily in a variable
		var positionComponent = entity.getComponent("position");
		var inventoryComponent = entity.getComponent("inventory");

		//If the inventory is full, we can exit as soon as possible
		if(inventoryComponent.isFull()) {

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
			for(var i = 0; i < currentTile.entities.length; i++) {

				if(currentTile.entities[i].hasComponent('canPickUp')) {

					pickups.push(currentTile.entities[i]);

				}

			}

		}

		if(pickups.length === 0) {

			//Add the text log message to the textlog
			this.game.UI.textLog.addMessage('There is nothing here...');

			return;

		}

		//Pick up a single item
		this.pickUpOne(inventoryComponent, pickups.shift(), currentTile);

		//If we need to pickup all items on the current tile, loop through them and pick them all up
		if(multiple) {

			for(var p = 0; p <= pickups.length; p++) {

				this.pickUpOne(inventoryComponent, pickups.shift(), currentTile);

			}

		}

	},

	/**
	 * Pickup a single entity, remove it from the map and add it to the inventory component
	 * @private
	 *
	 * @param {Object} inventoryComponent - The inventory that picks up the provided item
	 * @param {Entity} pickup - The entity that is being picked up
	 * @param {Tile} currentTile - The tile which holds the entity being picked up
	 */
	pickUpOne: function(inventoryComponent, pickup, currentTile) {

		//Add the entity to the inventory component
		inventoryComponent.add(pickup);

		//Add the text log message to the textlog
		this.game.UI.textLog.addMessage('You picked up a ' + pickup.name);

		//Remove the entity from the list of entities on the map
		this.game.map.entities.remove(pickup);

		//Remove the entity from the tile
		currentTile.remove(pickup);

	}

};

//Export the Browserify module
module.exports = Inventory;

