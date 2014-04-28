/**
 * LightSource Component constructor
 *
 * @class Roguelike.Components.LightSource
 * @classdesc The Lightsource component tells the system that this object emits light
 *
 * @param {Boolean} gradient - Should this lightsource render with a gradient
 * @param {Number} radius - The radius of the light, how far does it shine it's light!
 */
Roguelike.Components.LightSource = function(gradient, radius) {

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
