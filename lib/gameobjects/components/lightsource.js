//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * LightSource Component constructor
 *
 * @class LightSource
 * @classdesc The Lightsource component tells the system that this object emits light
 *
 * @param {Boolean} gradient - Should this lightsource render with a gradient
 * @param {Number} radius - The radius of the light, how far does it shine it's light!
 */
var LightSource = function(gradient, radius) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'lightSource';

	/**
	 * @property {Boolean} gradient - Should the lightmap be drawn with a gradient
	 */
	this.gradient = gradient;

	/**
	 * @property {Number} radius - The radius of the light, how far does it shine it's magical light!
	 */
	this.radius = radius;

};

//Export the Browserify module
module.exports = LightSource;
