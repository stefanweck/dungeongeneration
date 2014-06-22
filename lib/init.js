//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Game = require('./core/game.js');

//The initialize Module
var Intialize = function initializeCanvas() {

	//Initialize the canvas
	var canvas = document.getElementById("canvas");

	//Make the canvas go fullscreen
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var options = {
		canvas: canvas, //The canvas object on which our dungeon is placed on
		cameraBounds: false,
		debug: false //Boolean to enable or disable the debugger
	};

	//Create a new game
	var game = new Game(options);

};

// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

//Initialize when fully loaded
window.addEventListener("load", Intialize);

//Export the Browserify module
module.exports = Intialize;
