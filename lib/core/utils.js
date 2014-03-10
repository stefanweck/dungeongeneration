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
	* Function to extend the default options with the users options
	* @param {object} a - The original object to extend
	* @param {object} b - The new settings that override the original object
	*/
	extend: function(a, b){
		for(var key in b)
			if(b.hasOwnProperty(key))
				a[key] = b[key];
		return a;
	}

};
