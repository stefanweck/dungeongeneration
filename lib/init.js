// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return window.requestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
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
		tilesX: 60, //The number of horizontal tiles on this map
		tilesY: 40, //The number of vertical tiles on this map
		tileSize: 16, //The width and height of a single tile
		maxMainRooms: 8, //The maximum number of rooms on this map
		maxExtraRooms: 10, //The maximum number of rooms on this map
		minRoomWidth: 6, //The minimum width of a single room
		maxRoomWidth: 10, //The maximum width of a single room
		minRoomHeight: 6, //The minimum height of a single room
		maxRoomHeight: 10, //The maximum height of a single room
		debug: false //Boolean to enable or disable the debugger
	};

	//Create a new game
	var game = new Roguelike.Game(options);

}
