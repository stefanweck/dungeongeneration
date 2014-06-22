//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Queue constructor
 *
 * @class Queue
 * @classdesc Stores events and is able to retrieve them based on their time
 */
var Queue = function() {

	/**
	 * @property {Number} time - Every queue starts at time zero
	 */
	this.time = 0;

	/**
	 * @property {Array} events - The array with all the events
	 */
	this.events = [];

	/**
	 * @property {Array} eventTimes - The array with all the times of the events
	 */
	this.eventTimes = [];

};

Queue.prototype = {

	/**
	 * Returns the elapsed time since the beginning of this queue
	 * @protected
	 *
	 * @return {Number} The elapsed time
	 */
	getTime: function() {

		//Return the time as an number
		return this.time;

	},

	/**
	 * Clear all events that are queued
	 * @protected
	 */
	clear: function() {

		this.events = [];
		this.eventTimes = [];

	},

	/**
	 * Function to call when you want to follow a specific entity
	 * @protected
	 *
	 * @param {Entity} event - The event that is being added to the queue
	 * @param {Number} time - The time on which this event should be executed
	 */
	add: function(event, time) {

		//Set the index variable to the total amount of all current events
		var index = this.events.length;

		//Loop through all the current event times
		for(var i = 0; i < this.eventTimes.length; i++) {

			//If the current events time is bigger than the supplied time
			//we have to insert the new event here
			if(this.eventTimes[i] > time) {

				//Set the index variable to this number
				index = i;

				//Stop looping because we have found the insert place
				break;

			}

		}

		//Insert the supplied event in the array
		this.events.splice(index, 0, event);

		//Insert the supplied time in the array
		this.eventTimes.splice(index, 0, time);

	},

	/**
	 * Returns the next entity after removing it from the queue
	 * @protected
	 *
	 * @return {Entity} The next entity from the queue
	 */
	get: function() {

		//If there aren't any events, return null
		if(this.events.length === 0) {

			return null;

		}

		//Get the first eventTime from the array and remove it from the array
		var time = this.eventTimes.splice(0, 1)[0];

		//If the time is greater than zero, advance the time
		if(time > 0) {

			//Advance the time by the time the current event takes
			this.time += time;

			//Loop through all remaining events and decrease their time
			for(var i = 0; i < this.eventTimes.length; i++) {

				//Decrease the future times with the time the current event takes
				this.eventTimes[i] -= time;

			}

		}

		//Return the first event and remove it from the queue
		return this.events.splice(0, 1)[0];

	},

	/**
	 * Remove a specific event from the queue
	 * @protected
	 *
	 * @param {Entity} event - The event that is being added to the queue
	 *
	 * @return {Boolean} True if successfully removed, false if failed
	 */
	remove: function(event) {

		//Get the position of the event supplied
		var index = this.events.indexOf(event);

		//If the supplied event isn't in the queue, return false
		if(index === -1) {

			return false;

		}

		//Remove the event from the queue and the time array
		this.events.splice(index, 1);
		this.eventTimes.splice(index, 1);

		//We successfully removed the event
		return true;

	}

};

//Export the Browserify module
module.exports = Queue;

