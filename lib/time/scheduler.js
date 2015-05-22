//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Queue = require('./queue.js');

/**
 * Scheduler constructor
 *
 * @class Scheduler
 * @classdesc Is able to keep track of time and manages scheduling events in a queue
 */
var Scheduler = function() {

	/**
	 * @property {Number} time - Every queue starts at time zero
	 */
	this.queue = null;

	/**
	 * @property {Array} events - The array with all the repeated events
	 */
	this.repeat = [];

	/**
	 * @property {Object} current - The current event
	 */
	this.current = null;

	/**
	 * @property {int} lockCount - Recursive lock variable
	 */
	this.lockCount = 0;

	//Initialize itself
	this.initialize();

};

Scheduler.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @private
	 */
	initialize: function() {

		//Create a new Queue object
		this.queue = new Queue();

	},

	/**
	 * Returns the elapsed time since the beginning of the queue
	 * @public
	 *
	 * @return {Number} The elapsed time
	 */
	getTime: function() {

		//Return the time as an number
		return this.queue.getTime();

	},

	/**
	 * Schedule a new item
	 * @public
	 *
	 * @param {Entity} entity - The entity being added
	 * @param {Boolean} repeat - Is this a recurring thing
	 *
	 * @return {Scheduler} The current Scheduler object
	 */
	add: function(entity, repeat) {

		//Add a new item to the queue based on their speed
		this.queue.add(entity, 1 / entity.getSpeed());

		//If this is a recurring event, we add it to the repeat array
		if(repeat) {

			this.repeat.push(entity);

		}

		//Return the scheduler object
		return this;

	},

	/**
	 * Remove an item from the scheduler
	 * @public
	 *
	 * @param {Entity} entity - The entity being removed
	 *
	 * @return {Boolean} True if successfully removed, false if failed to remove
	 */
	remove: function(entity) {

		//Remove the item from the queue and store the returned bool
		var result = this.queue.remove(entity);

		//Look if the item being removed is a recurring item
		var index = this.repeat.indexOf(entity);

		//If it is, remove it from the repeat array
		if(index !== -1) {

			//Remove the item
			this.repeat.splice(index, 1);

		}

		//If the current item is the item being removed
		//Reset the current item to null
		if(this.current === entity) {

			this.current = null;

		}

		//Return true or false depending on success or not
		return result;

	},

	/**
	 * Clear the scheduler
	 * @public
	 *
	 * @return {Scheduler} The cleared Scheduler object
	 */
	clear: function() {

		//Clear all the variables used in this scheduler
		this.queue.clear();
		this.repeat = [];
		this.current = null;

		//Return the empty scheduler object
		return this;

	},

	/**
	 * Get the next entity from the queue
	 * @public
	 *
	 * @return {Entity} The next Entity from the queue
	 */
	next: function() {

		//If there is a current item and it is a repeating item, add it to the queue again
		if(this.current && this.repeat.indexOf(this.current) !== -1) {

			//Add the current item to the queue
			this.queue.add(this.current, 1 / this.current.getSpeed());

		}

		//Get the next item from the queue and set it to the current action
		this.current = this.queue.get();

		//Return the current action
		return this.current;

	},

	/**
	 * Function that is called when the game continues one tick
	 * @public
	 *
	 * @return {Boolean} True if the entity could act, false if it stopped before that
	 */
	tick: function() {

		//Check if we should continue based on the lock
		if(this.lockCount > 0) {

			return false;

		}

		//Get the next entity
		var entity = this.next();

		//If there isn't a next entity we stop here
		if(entity === null) {

			return false;

		}

		//We can let the entity act
		entity.act();

		//We managed to act, so we return true
		return true;

	},

	/**
	 * Lock the scheduler so it won't continue until it's unlocked
	 *
	 * The lock is recursive, that means it needs to be unlocked as many
	 * times as it has been locked.
	 * @public
	 */
	lock: function() {

		//Add one to the lockCount
		this.lockCount++;

	},

	/**
	 * Unlock the scheduler, but only if it is locked
	 * @public
	 */
	unlock: function() {

		//Check if the lockCount is 0
		if(this.lockCount === 0) {

			return;

		}

		//Subtract one from the lockCount
		this.lockCount--;

	}

};

//Export the Browserify module
module.exports = Scheduler;
