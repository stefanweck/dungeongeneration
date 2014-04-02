/**
 * Boundary constructor
 *
 * @class Roguelike.Boundary
 * @classdesc A rectangle that represents the whole map or the viewport of the camera
 *
 * @param {number} left - The left position of this boundary, in pixels
 * @param {number} top - The top position of this boundary, in pixels
 * @param {number} width - The width of this boundary, in pixels
 * @param {number} height - The height of this boundary, in pixels
 */
Roguelike.Boundary = function(left, top, width, height) {

	/**
	 * @property {number} left - The left position of this boundary, in pixels
	 */
	this.left = left || 0;

	/**
	 * @property {number} top - The top position of this boundary, in pixels
	 */
	this.top = top || 0;

	/**
	 * @property {number} width - The width of this boundary, in pixels
	 */
	this.width = width || 0;

	/**
	 * @property {number} height - The height of this boundary, in pixels
	 */
	this.height = height || 0;

	/**
	 * @property {number} right - The right position of this boundary, in pixels
	 */
	this.right = (this.left + this.width);

	/**
	 * @property {number} bottom - The bottom position of this boundary, in pixels
	 */
	this.bottom = (this.top + this.height);

};

Roguelike.Boundary.prototype = {

	/**
	 * Function that allows the user to set new values for the boundary
	 * @protected
	 *
	 * @param {number} left - The left position of this boundary, in pixels
	 * @param {number} top - The top position of this boundary, in pixels
	 * @param {number} width - Optional: The width of this boundary, in pixels
	 * @param {number} height - Optional: The height of this boundary, in pixels
	 */
	set: function(left, top, width, height) {

		this.left = left;
		this.top = top;
		this.width = width || this.width;
		this.height = height || this.height;
		this.right = (this.left + this.width);
		this.bottom = (this.top + this.height);

	},

	/**
	 * Function to check if one boundary is still inside another boundary
	 * @protected
	 *
	 * @param {Roguelike.Boundary} boundary - The boundary to check against
	 */
	isWithin: function(boundary) {

		return(
			boundary.left <= this.left &&
				boundary.right >= this.right &&
				boundary.top <= this.top &&
				boundary.bottom >= this.bottom
			);

	},

	/**
	 * Function to check if one boundary overlaps another boundary
	 * @protected
	 *
	 * @param {Roguelike.Boundary} boundary - The boundary to check against
	 */
	isOverlapping: function(boundary) {

		return(
			this.left < boundary.right &&
				boundary.left < this.right &&
				this.top < boundary.bottom &&
				boundary.top < this.bottom
			);

	}

};
