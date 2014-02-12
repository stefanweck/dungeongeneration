/**
* @class Roguelike.Utils
* @classdesc In this class are the functions stored that are being
* used in other functions
*/
Roguelike.Utils = {

	/*
	* Function to generate a random number between two values
	* @param {int} from - The minimum number
	* @param {int} to - The maximum number
	*/
	randomNumber: function(from,to){

		return Math.floor(Math.random()*(to-from+1)+from);

	},

	/*
	* Function to return the mouse position on a canvas object
	* @param {object} canvas - The canvas object to track
	* @param {object} event - Mouse event
	*/
	getMousePos: function(canvas, e) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}

};