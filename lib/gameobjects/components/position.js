//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Position Component constructor
 *
 * @class Position
 * @classdesc The position component holds x and y position of the entity
 *
 * @param {Vector2} position - The position object of this entity
 */
var Position = function(position) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'position';

	/**
	 * @property {Vector2} position - The position object of this entity
	 */
	this.position = position;

};

//Export the Browserify module
module.exports = Position;
