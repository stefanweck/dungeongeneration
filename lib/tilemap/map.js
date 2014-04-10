/**
 * Map constructor
 *
 * @class Roguelike.Map
 * @classdesc The object that holds all the rooms, corridors and tiles
 *
 * @property {Roguelike.Game} game - Reference to the current game object
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
	 * @property {number} tilesX - The number of horizontal tiles on this map
	 */
	this.tilesX = game.settings.tilesX;

	/**
	 * @property {number} tilesY - The number of vertical tiles on this map
	 */
	this.tilesY = game.settings.tilesY;

	/**
	 * @property {number} maxRooms - The maximum number of rooms allowed on this map
	 */
	this.maxRooms = game.settings.maxRooms;

	/**
	 * @property {array} rooms - An array that holds all room objects
	 */
	this.rooms = [];

	/**
	 * @property {array} tiles - An array that holds all tile objects
	 */
	this.tiles = [];

	/**
	 * @property {array} objects - An array that holds all objects that are on the map
	 */
	this.objects = [];

	/**
	 * @property {number} tileSize - The width and height of a single tile on the map
	 */
	this.tileSize = game.settings.tileSize;

	/**
	 * @property {number} minRoomWidth - The minimum width of a room on this map
	 */
	this.minRoomWidth = game.settings.minRoomWidth;

	/**
	 * @property {number} maxRoomWidth - The maximum width of a room on this map
	 */
	this.maxRoomWidth = game.settings.maxRoomWidth;

	/**
	 * @property {number} minRoomHeight - The minimum heigth of a room on this map
	 */
	this.minRoomHeight = game.settings.minRoomHeight;

	/**
	 * @property {number} maxRoomHeight - The maximum heigth of a room on this map
	 */
	this.maxRoomHeight = game.settings.maxRoomHeight;

	/**
	 * @property {entrance} object - An object that holds the position of the entrance of this map
	 */
	this.entrance = null;

	/**
	 * @property {exit} object - An object that holds the position of the exit of this map
	 */
	this.exit = null;

};

Roguelike.Map.prototype = {

	/**
	 * Initialize the layout of the map, filling it with empty tiles
	 * @protected
	 */
	initialize: function() {

		//Loop through every horizontal row
		for(var x = 0; x < this.tilesX; x++) {

			//Initialize this row
			this.tiles[x] = [];

			//Loop through every vertical row
			for(var y = 0; y < this.tilesY; y++) {

				//Initialize this position by setting it to zero, and blocking light
				this.tiles[x][y] = new Roguelike.Tile(0, true, 0, 0);

			}

		}

	},

	/**
	 * Add all the rooms from the room list to the map, get the tiles from each room's layout
	 * @protected
	 */
	addRooms: function() {

		//Loop through each room in the list
		for(var i = 0; i < this.rooms.length; i++) {

			//Loop through every horizontal row
			for(var x = this.rooms[i].x1; x < this.rooms[i].x2; x++) {

				//What is the current Y position in the layout of the current room
				var layoutXPos = this.rooms[i].x2 - x - 1;

				//Loop through every vertical row
				for(var y = this.rooms[i].y1; y < this.rooms[i].y2; y++) {

					//What is the current X position in the layout of the current room
					var layoutYPos = this.rooms[i].y2 - y - 1;

					//Get the current tile object
					var currentTile = this.rooms[i].layout[layoutXPos][layoutYPos];

					//Place the tile that is on the layout on this position on the map
					this.tiles[x][y] = currentTile;

				}

			}

		}

	}

};
