//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Inventory Component constructor
 *
 * @class Inventory
 * @classdesc The Inventory component is responsible for keeping track of what an entity carries along with him
 */
var Inventory = function() {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'inventory';

	/**
	 * @property {Number} maxSlots - The maximum amount of slots in this inventory
	 */
	this.maxSlots = 0;

	/**
	 * @property {Array} slots - An array that holds all items in this inventory
	 */
	this.slots = [];

};

Inventory.prototype = {

	/**
	 * Add a new item to the inventory
	 * @protected
     *
     * @param {Object} item - The new item that is added to this inventory
	 */
	add: function(item){

		this.slots.push(item);

	},

	/**
	 * Function to clear the entire inventory
	 * @protected
	 */
	clear: function(){

		this.slots = [];

	}

};

//Export the Browserify module
module.exports = Inventory;
