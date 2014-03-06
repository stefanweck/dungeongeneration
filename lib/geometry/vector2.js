/*
* Vector2 constructor
* 
* @class Roguelike.Vector2
* @classdesc An Vector2 Object, used by the lightsource class
*
* @param {int} x - The x coordinate of this vector2 object
* @param {int} y - The y coordinate of this vector2 object
*/
Roguelike.Vector2 = function(x, y){

	/*
	* @property {int} x - The x coordinate of this vector2 object
	*/
	this.x = x;

	/*
	* @property {int} x - The y coordinate of this vector2 object
	*/
	this.y = y;

};

Roguelike.Vector2.prototype = {

	/*
	* Add another vector2 object
	* @protected
	*
	* @param {Roguelike.Vector2} other - The y other vector2 object
	*/
	add: function(other){

		var dx = pos.x - this.x;
		var dy = pos.y - this.y;
		
		return Math.abs(Math.sqrt((dx * dx) + (dy * dy)));

	},

	/*
	* Distance to another Vector2 Object
	* @protected
	*
	* @param {object} pos - The position of the other object
	*/
	distance: function(pos) {
		var dx = pos.x - this.x;
		var dy = pos.y - this.y;
		
		return Math.abs(Math.sqrt((dx * dx) + (dy * dy)));
	},
	
	/*
	* Manhattan distance to another object
	* @protected
	*
	* @param {object} pos - The position of the other object
	*/
	manhattan: function(pos) {
		return(Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y));
	},
	
	/*
	* Clone the current Vector2 Object
	* @protected
	*/
	clone: function() {
		return(new Vector2(this.x, this.y));
	},
	
	/*
	* Create a string from this Vector2 Object
	* @protected
	*/
	toString: function() {
		return("(" + this.x + ", " + this.y + ")");
	}

};