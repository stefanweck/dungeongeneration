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
window.addEventListener("load", initializeCanvas);

//Function that get's executed when the page is fully loaded
function initializeCanvas() {

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
	var game = new Roguelike.Game(options);

}
