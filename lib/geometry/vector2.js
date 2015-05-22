//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Vector2 constructor
 *
 * @class Vector2
 * @classdesc An Vector2 Object, used by the lightsource class
 *
 * @param {Number} x - The x coordinate of this vector2 object
 * @param {Number} y - The y coordinate of this vector2 object
 */
var Vector2 = function(x, y) {

	/**
	 * @property {Number} x - The x coordinate of this vector2 object
	 */
	this.x = x;

	/**
	 * @property {Number} x - The y coordinate of this vector2 object
	 */
	this.y = y;

};

Vector2.prototype = {

	/**
	 * Add another Vector2 object to this Vector2 object
	 * @public
	 *
	 * @param {Vector2} other - The other Vector2 object
	 *
	 * @return {Vector2} The combined Vector2 object
	 */
	combine: function(other) {

		//Return the Vector2 object
		return new Vector2(this.x + other.x, this.y + other.y);

	},

	/**
	 * Add another Vector2 object
	 * @public
	 *
	 * @param {Vector2} other - The other Vector2 object
	 *
	 * @return {Number} The value of both added Vector2 objects
	 */
	add: function(other) {

		var dx = other.x - this.x;
		var dy = other.y - this.y;

		return Math.abs(Math.sqrt((dx * dx) + (dy * dy)));

	},

	/**
	 * Distance to another Vector2 object
	 * @public
	 *
	 * @param {Object} pos - The position of the other Vector2 object
	 *
	 * @return {Number} The distance to the other Vector2 object
	 */
	distance: function(pos) {

		var dx = pos.x - this.x;
		var dy = pos.y - this.y;

		return Math.abs(Math.sqrt((dx * dx) + (dy * dy)));

	},

	/**
	 * Manhattan distance to another object
	 * @public
	 *
	 * @param {Object} pos - The position of the other Vector2 object
	 *
	 * @return {Number} The manhattan distance to the other Vector2 object
	 */
	manhattan: function(pos) {

		return(Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y));

	},

	/**
	 * Clone the current Vector2 object
	 * @public
	 *
	 * @return {Vector2} The cloned Vector2 object
	 */
	clone: function() {

		return(new Vector2(this.x, this.y));

	},

	/**
	 * Create a string from this Vector2 object
	 * @public
	 *
	 * @return {String} The Vector2 object as a string
	 */
	toString: function() {

		return("(" + this.x + ", " + this.y + ")");

	}

};

//Export the Browserify module
module.exports = Vector2;
