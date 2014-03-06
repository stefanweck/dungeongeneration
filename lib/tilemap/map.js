/*
* Map constructor
* 
* @class Roguelike.Map
* @classdesc The object that holds all the rooms, corridors and tiles
* 
* @property {Roguelike.Game} game - Reference to the current game object
*/
Roguelike.Map = function(game){

	/*
	* @property {Roguelike.Game} game - Reference to the current game object
	*/
	this.game = game;

	/*
	* @property {int} tilesX - The number of horizontal tiles on this map
	*/
	this.tilesX = game.settings.tilesX;

	/*
	* @property {int} tilesY - The number of vertical tiles on this map
	*/
	this.tilesY = game.settings.tilesY;

	/*
	* @property {int} maxRooms - The maximum number of rooms allowed on this map
	*/
	this.maxRooms = game.settings.maxRooms;

	/*
	* @property {array} rooms - An array that holds all room objects
	*/
	this.rooms = [];

	/*
	* @property {array} corridors - An array that holds all corridor objects
	*/
	this.corridors = [];

	/*
	* @property {array} tiles - An array that holds all tile objects
	*/
	this.tiles = [];

	/*
	* @property {array} objects - An array that holds all objects that are on the map
	*/
	this.objects = [];

	/*
	* @property {int} tileSize - The width and height of a single tile on the map
	*/
	this.tileSize = game.settings.tileSize;

	/*
	* @property {int} minRoomWidth - The minimum width of a room on this map
	*/
	this.minRoomWidth = game.settings.minRoomWidth;

	/*
	* @property {int} maxRoomWidth - The maximum width of a room on this map
	*/
	this.maxRoomWidth = game.settings.maxRoomWidth;

	/*
	* @property {int} minRoomHeight - The minimum heigth of a room on this map
	*/
	this.minRoomHeight = game.settings.minRoomHeight;

	/*
	* @property {int} maxRoomHeight - The maximum heigth of a room on this map
	*/
	this.maxRoomHeight = game.settings.maxRoomHeight;

	/*
	* @property {Roguelike.MapFactory} mapFactory - The room factory is responsible for creating rooms and corridors on this map
	*/
	this.mapFactory = null;

	/*
	* @property {entrance} object - An object that holds the position of the entrance of this map
	*/
	this.entrance = null;

};

Roguelike.Map.prototype = {

	/*
	* Initialize the layout of the map, filling it with empty tiles
	* @protected
	*/
	initialize: function(){

		//Create the map factory
		this.mapFactory = new Roguelike.MapFactory(this.game);

		//Loop through every horizontal row
		for(y = 0; y < this.tilesY; y++){

			//Initialize this row
			this.tiles[y] = [];

			//Loop through every vertical row
			for(x = 0; x < this.tilesX; x++){

				//Initialize this position by setting it to zero, and blocking light
				this.tiles[y][x] = new Roguelike.Tile(0, true);

			}

		}

	},

	/*
	* Check if a single room overlaps a room that is allready on the map
	* @protected
	*
	* @param {Roguelike.Room} room - The room object that has to be checked
	*/
	roomIntersectsWith: function(room){

		//Loop through every room in the list
		for (var i = 0; i < this.rooms.length; i++) {

			//Check if the room intersects with the current room
			if(room.x1 <= this.rooms[i].x2 && room.x2 >= this.rooms[i].x1 && room.y1 <= this.rooms[i].y2 && room.y2 >= this.rooms[i].y1){
				return true;
			}

		}
		//If the room doesn't intersect another room, return false
		return false;

	},

	/*
	* Add all the rooms from the room list to the map, get the tiles from each room's layout
	* @protected
	*
	* @param {Roguelike.Room} room - The room object that has to be checked
	*/
	addRooms: function(){

		//Loop through each room in the list
		for (var i = 0; i < this.rooms.length; i++) {

			//Loop through every horizontal row
			for(y = this.rooms[i].y1; y < this.rooms[i].y2; y++){

				//What is the current Y position in the layout of the current room
				var layoutYPos = this.rooms[i].y2 - y - 1;

				//Loop through every vertical row
				for(x = this.rooms[i].x1; x < this.rooms[i].x2; x++){

					//What is the current X position in the layout of the current room
					var layoutXPos = this.rooms[i].x2 - x - 1;

					//Get the current tile object
					var currentTile = this.rooms[i].layout[layoutYPos][layoutXPos];

					//Place the tile that is on the layout on this position on the map
					this.tiles[y][x] = currentTile;

				}

			}

		}

		//Generate the corridors for these rooms on the current map object
		this.mapFactory.generateCorridors(this);

	}

};