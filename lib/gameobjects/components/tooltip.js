//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Tooltip Component constructor
 *
 * @class Tooltip
 * @classdesc A tooltip that will show up when the player hovers his mouse over the entity
 *
 * /**
 * @param {String} title - The title of the tooltip
 * @param {String} type - The type of entity
 * @param {String} description - The description of this entity
 */
var Tooltip = function(title, type, description) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'tooltip';

	/**
	 * @property {Array} title - The title of the tooltip
	 */
	this.title = title;

	/**
	 * @property {Array} type - The type of entity
	 */
	this.type = type;

	/**
	 * @property {Array} description - The description of this entity
	 */
	this.description = description;

};

//Export the Browserify module
module.exports = Tooltip;
