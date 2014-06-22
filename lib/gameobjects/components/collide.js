//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Collide Component constructor
 *
 * @class Collide
 * @classdesc A component that tells if the entity is passable or not
 */
var Collide = function(collide) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'collide';

	/**
	 * @property {Boolean} collide - True or false depending on if it should collide with other entities
	 */
	this.collide = collide;

};

//Export the Browserify module
module.exports = Collide;
