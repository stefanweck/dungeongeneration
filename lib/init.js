// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

window.onload = function() {

	initializeCanvas();

};

function initializeCanvas() {

	//Initialize the canvas
	var canvas = document.getElementById("canvas");
	canvas.width = 960;
	canvas.height = 640;

	var options = {
		canvas: canvas, //The canvas object on which our dungeon is placed on
		debug: false //Boolean to enable or disable the debugger
	};

	//Create a new game
	var game = new Roguelike.Game(options);

}
