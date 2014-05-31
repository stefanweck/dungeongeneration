/**
 * Map constructor
 *
 * @class Roguelike.Map
 * @classdesc The object that holds all the rooms, corridors and tiles
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 */
Roguelike.Map = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Group} entities - Holds all the entities of this game
	 */
	this.entities = null;

	/**
	 * @property {Object} settings - The empty settings object
	 */
	this.settings = {};

	/**
	 * @property {Array} rooms - An array that holds all room objects
	 */
	this.rooms = [];

	/**
	 * @property {Array} tiles - An array that holds all tile objects
	 */
	this.tiles = [];

	/**
	 * @property {Array} objects - An array that holds all objects that are on the map
	 */
	this.objects = [];

	/**
	 * @property {Roguelike.Vector2} entrance - An object that holds the position of the entrance of this map
	 */
	this.entrance = null;

	/**
	 * @property {Roguelike.Vector2} exit - An object that holds the position of the exit of this map
	 */
	this.exit = null;

	/**
	 * @property {Array} allRooms - An array that holds all the rooms on this map
	 */
	this.allRooms = [];

	/**
	 * @property {Array} mediumRooms - An array that holds all the medium rooms on this map
	 */
	this.mediumRooms = [];

	/**
	 * @property {Array} hardRooms - An array that holds all the hard rooms on this map
	 */
	this.hardRooms = [];

	/**
	 * @property {Array} roomsToExit - An array that holds all the rooms that go from the entrance to the exit on this map
	 */
	this.roomsToExit = [];

	//Initialize itself
	this.initialize();

};

Roguelike.Map.prototype = {

	/**
	 * Initialize the layout of the map, filling it with empty tiles
	 * @protected
	 */
	initialize: function() {

		//TODO: Make this dynamic on the depth of the dungeon, this will allow the generator to make more complicated maps the deeper you go
		//Define settings
		this.settings = {
			tilesX: 60, //The number of horizontal tiles on this map
			tilesY: 40, //The number of vertical tiles on this map
			tileSize: 48, //The width and height of a single tile
			maxRooms: 15, //The maximum number of rooms on this map
			minRoomWidth: 5, //The minimum width of a single room
			maxRoomWidth: 8, //The maximum width of a single room
			minRoomHeight: 5, //The minimum height of a single room
			maxRoomHeight: 8, //The maximum height of a single room
			roomSpacing: 1, //The length of a corridor, 0 for no corridors
			maxMainRooms: 10,
			maxMediumRooms: 15,
			maxHardRooms: 5
		};

		//Loop through every horizontal row
		for(var x = 0; x < this.settings.tilesX; x++) {

			//Initialize this row
			this.tiles[x] = [];

			//Loop through every vertical row
			for(var y = 0; y < this.settings.tilesY; y++) {

				//Initialize this position by setting it to zero, and blocking light
				this.tiles[x][y] = new Roguelike.Tile(0, true, 0, 0);

			}

		}

	},

	/**
	 * Function to get a tile at a position
	 * @protected
	 *
	 * @param {Roguelike.Vector2} position - The position that is being requested
	 *
	 * @return {Roguelike.Tile} The tile object that has been found, empty object otherwise
	 */
	getTileAt: function(position) {

		//Try to get the tile object from the map
		var tile = this.tiles[position.x][position.y];

		//Check if the tile object is something, else return an empty tile object
		if(tile) {

			return tile;

		}else{

			return new Roguelike.Tile();

		}

	},

	/**
	 * Function to check if one position is inside the maps boundary
	 * @protected
	 *
	 * @param {Roguelike.Vector2} position - The position that is being requested
	 *
	 * @return {Boolean} Returns true if the position is within this map, returns false if it isn't
	 */
	insideBounds: function(position) {

		return(
			position.x > 0 &&
				position.x < this.settings.tilesX &&
				position.y > 0 &&
				position.y < this.settings.tilesY
			);

	},

	/**
	 * Function that returns an array with only the tiletypes of every position
	 * Used for EasyStar Pathfinding
	 * @protected
	 *
	 * @return {Array} Array with only the tiletypes of every position on the map
	 */
	typeList: function() {

		//Define variables
		var mapTypeList = [];

		//Loop through every horizontal row
		for(var y = 0; y < this.settings.tilesY; y++) {

			//Initialize this row
			mapTypeList.push([]);

			//Loop through every vertical row
			for(var x = 0; x < this.settings.tilesX; x++) {

				//Initialize this position by setting it to zero, and blocking light
				mapTypeList[y][x] = (this.tiles[x][y].type);

			}

		}

		//Return the array with Y X coordinates of every tiletype
		return mapTypeList;

	},

	/**
	 * Check if a single room overlaps a room that is already on the map and if it's inside the maps boundaries
	 * @protected
	 *
	 * @param {Roguelike.Room} room - The room object that has to be checked
	 *
	 * @return {Boolean} True when the room intersects with an existing room, false when it's not intersecting
	 */
	roomFits: function(room) {

		//Check if the room fits inside the boundaries of this map. If not we can't place it.
		if(room.x1 < 1 || room.x2 > this.settings.tilesX - 1 || room.y1 < 1 || room.y2 > this.settings.tilesY - 1) {

			return false;

		}

		//Loop through every room in the list
		for(var i = 0; i < this.allRooms.length; i++) {

			//Check if the room intersects with the current room
			if(room.x1 <= this.allRooms[i].x2 && room.x2 >= this.allRooms[i].x1 && room.y1 <= this.allRooms[i].y2 && room.y2 >= this.allRooms[i].y1) {

				return false;

			}

		}
		//If the room doesn't intersect another room, return true
		return true;

	}

};
