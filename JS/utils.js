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
	},

	/*
	* Function to return the mouse position on a canvas object
	* @param {object} canvas - The canvas object to track
	* @param {object} event - Mouse event
	*/
	getMousePos: function(e) {
		var rect = canvas.getBoundingClientRect();
		return{
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	},

	/*
	* Draw a red square on the current tile or room, console log the tile information
	* @param {object} canvas - The canvas object to track
	* @param {object} event - Mouse event
	*/
	debugTiles: function(e) {

		var mousePos = Roguelike.Utils.getMousePos(e);
		var x = Math.floor(mousePos.x / 15 );
		var y = Math.floor(mousePos.y / 15 );

		console.clear();
		game.renderer.draw(game.map);
		tileType = game.map.tiles[y][x].type;

		console.log(game.map.tiles[y][x]);

		oContext.fillStyle = "rgba(255, 0, 0, 0.2)";

		if(game.map.tiles[y][x].belongsTo){
			var room = game.map.tiles[y][x].belongsTo;
			oContext.fillRect(room.x1 * game.map.tileSize, room.y1 * game.map.tileSize , room.w * game.map.tileSize, room.h * game.map.tileSize);
		}else{
			oContext.fillRect(x * game.map.tileSize, y * game.map.tileSize , game.map.tileSize, game.map.tileSize);
		}

	}

};