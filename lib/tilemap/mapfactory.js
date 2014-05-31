/**
 * MapFactory constructor
 *
 * @class Roguelike.MapFactory
 * @classdesc The object that is responsible for generating rooms and corridors
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 */
Roguelike.MapFactory = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Map} map - Reference to the current map
	 */
	this.map = game.map;

	/**
	 * @property {Array} possibleDoorLocations - Stores all the positions of possible door locations
	 */
	this.possibleDoorLocations = [];

};

Roguelike.MapFactory.prototype = {

	/**
	 * This function calls all the functions in the right order to generate the map
	 * @protected
	 */
	generateRooms: function() {

		//Generate the first room of the map
		this.generateFirstRoom();

		//Generate the path to the exit room
		this.generatePath("path", this.map.roomsToExit, this.map.settings.maxMainRooms);

		//Extend the original path with medium rooms
		this.generatePath("random", this.map.mediumRooms, this.map.settings.maxMediumRooms);

		//Extend the original path with hard rooms
		this.generatePath("randomMedium", this.map.hardRooms, this.map.settings.maxHardRooms);

	},

	/**
	 * Generate the first room of the map
	 * @protected
	 */
	generateFirstRoom: function() {

		//Create a new room that will serve as the entrance room
		var newRoom = this.newRoom();
		newRoom.initialize();

		//Place the room on the map
		this.placeRoom(newRoom);

		//Define the just generated map as the entrance room of the map
		//It is the first room in the path to the exit
		this.map.roomsToExit.push(newRoom);

	},

	/**
	 * Creates a series of rooms towards the final exit room or that extend the normal route
	 * @protected
	 */
	generatePath: function(type, roomList, maxRooms) {

		//Maximum number of tries before stopping the placement of more rooms
		//These tries are increase whenever the generator has to go back one
		//room because it couldn't generate a room in any direction
		var maxTries = 20;
		var tries = 0;

		//Create rooms while we haven't reached the maximum amount of rooms
		while(roomList.length < maxRooms) {

			//If we are already at the maximum amount of tries, break the loop
			if(tries >= maxTries) {
				break;
			}

			//Set all the available directions once
			var directions = ["left", "right", "up", "down"];

			//Get the previous room
			switch(type) {

				//Generate a path of rooms, this means we have to generate a room from the previous room
				case("path"):

					var prevRoom = this.map.roomsToExit[this.map.roomsToExit.length - 1];

					break;

				//Extend the already existing path with new rooms
				case("random"):

					var index = Roguelike.Utils.randomNumber(0, this.map.allRooms.length - 1);
					var prevRoom = this.map.allRooms[index];

					break;

				//Extend the already existing path of medium rooms with rooms
				case("randomMedium"):

					//Get another random room
					var index = Roguelike.Utils.randomNumber(0, this.map.mediumRooms.length - 1);
					var prevRoom = this.map.mediumRooms[index];

					break;

			}

			//Continue until we break the loop ourselves
			while(true) {

				//If there aren't any directions left to try, we fill the directions
				//array again, but we also go back one room and search again from that room
				if(directions.length === 0) {

					//We tried to generate a room in every possible direction
					//This failed and we are now going back one room
					//This process is only allowed "maxTries" times
					tries++;

					//If we are already at the maximum amount of tries, break the loop
					if(tries >= maxTries) {
						break;
					}

					//Set all the available directions once
					directions = ["left", "right", "up", "down"];

					//Get the previous room
					switch(type) {

						//Generate a normal path of rooms, this means we have to generate a room from the previous room
						case("path"):

							//Remove the room that failed to expand in every direction as a room that leads towards the exit
							var mediumRoom = this.map.roomsToExit.splice(this.map.roomsToExit.length - 1, 1)[0];

							//The current room failed to expand in any direction, this is why we promote it to a
							//medium room. This means the room isn't part of the main route and is 'optional'
							this.map.mediumRooms.push(mediumRoom);

							//Set the previous room to the room before the previous room on the list
							prevRoom = this.map.roomsToExit[this.map.roomsToExit.length - 1];

							break;

						//Extend the already existing path with rooms
						case("random"):

							//Get another random room
							index = Roguelike.Utils.randomNumber(0, this.map.allRooms.length - 1);
							prevRoom = this.map.allRooms[index];

							break;

						//Extend the already existing path of medium rooms with rooms
						case("randomMedium"):

							//Get another random room
							index = Roguelike.Utils.randomNumber(0, this.map.mediumRooms.length - 1);
							prevRoom = this.map.mediumRooms[index];

							break;

					}

				}

				//Pick a random side of the previous room
				var side = Roguelike.Utils.randomNumber(0, directions.length - 1);
				var direction = directions[side];

				//Maximum number of tries before stopping the placement of more rooms
				var maxDirectionTries = 5;
				var directionTries = 0;

				//Create a room next to the previous room
				var newRoom = this.generateRoomNextTo(prevRoom, direction);

				//We try to place a new room for a certain amount of times in the current direction
				while(!this.map.roomFits(newRoom)) {

					//Check if the limit has been reached, this prevents the while loop from crashing your page
					//We assume there is no space left on the map and break the loop
					if(directionTries >= maxDirectionTries) {

						//Remove the direction because we tried the maximum amount of times to place a room there
						directions.splice(side, 1);

						//If we are already at the maximum amount of tries, break the loop
						break;

					}

					//Create a room next to the previous room
					newRoom = this.generateRoomNextTo(prevRoom, direction);

					//We tried to fit the new room but it failed
					directionTries++;

				}

				//We see if the room does fit, if it doesn't then well, that's a shame!
				//Because we aren't putting any more effort into that room.
				if(this.map.roomFits(newRoom)) {

					//The room doesn't intersect and is inside the map boundaries, initialize the room layout
					newRoom.initialize();

					//Place the room on the map
					this.placeRoom(newRoom);

					//Add the room to the room list
					roomList.push(newRoom);

					//Generate an exit on the previous and new room
					prevRoom.generateExit();
					newRoom.generateExit();

					//Generate a corridor between these two exit points
					this.generateCorridor(prevRoom, newRoom);

					//Reset the possible directions
					directions = ["left", "right", "up", "down"];

					//Break the while(true) loop because we have succeeded to place a room on the map
					break;

				}

			}

		}

	},

	/**
	 * Create a new Roguelike.Room object next to the supplied previous room
	 * @protected
	 *
	 * @param {Roguelike.Room} prevRoom - The previous room
	 * @param {String} direction - The direction of expanding the dungeon as seen from a room
	 *
	 * @return {Roguelike.Room} A new Roguelike.Room object
	 */
	generateRoomNextTo: function(prevRoom, direction) {

		//First declare the variables and then give them all the same value
		//This is to prevent variables from going global
		var heigth, width, xPos, yPos;
		heigth = width = xPos = yPos = undefined;

		//Create a new room based on the direction
		switch(direction) {

			case ("up"):

				//Calculate a random height, we need this value here to determine the vertical position of the room
				heigth = Roguelike.Utils.randomNumber(
					this.map.settings.minRoomHeight,
					this.map.settings.maxRoomHeight
				);

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x1 + Roguelike.Utils.randomNumber(-2, 3);
				yPos = prevRoom.y1 - heigth - this.map.settings.roomSpacing;

				break;

			case ("down"):

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x1 + Roguelike.Utils.randomNumber(-2, 3);
				yPos = prevRoom.y2 + this.map.settings.roomSpacing;

				break;

			case ("left"):

				//Calculate a random width, we need this value here to determine the horizontal position of the room
				width = Roguelike.Utils.randomNumber(
					this.map.settings.minRoomWidth,
					this.map.settings.maxRoomWidth
				);

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x1 - width - this.map.settings.roomSpacing;
				yPos = prevRoom.y1 + Roguelike.Utils.randomNumber(-2, 3);

				break;

			case ("right"):

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x2 + this.map.settings.roomSpacing;
				yPos = prevRoom.y1 + Roguelike.Utils.randomNumber(-2, 3);

				break;

		}

		//Return the newly generated room
		return this.newRoom(width, heigth, xPos, yPos);

	},

	/**
	 * Create a new Roguelike.Room object
	 * @protected
	 *
	 * @param {int} width - Optional width of the new room
	 * @param {int} height - Optional height of the new room
	 * @param {int} xPos - Optional horizontal position of the new room
	 * @param {int} yPos - Optional vertical position of the new room
	 *
	 * @return {Roguelike.Room} A new Roguelike.Room object
	 */
	newRoom: function(width, height, xPos, yPos) {

		//We are using shorthand method instead of || because the optional values might
		//be passed but evaluate as false

		//Generate random values ( in tiles )
		//Start with generating a random width
		var w = (typeof width === "undefined") ? Roguelike.Utils.randomNumber(
			this.game.map.settings.minRoomWidth,
			this.game.map.settings.maxRoomWidth
		) : width;

		//Generate a random height for the room
		var h = (typeof height === "undefined") ? Roguelike.Utils.randomNumber(
			this.game.map.settings.minRoomHeight,
			this.game.map.settings.maxRoomHeight
		) : height;

		//Generate a random horizontal position for this room
		var x = (typeof xPos === "undefined") ? Roguelike.Utils.randomNumber(
			1,
			this.game.map.settings.tilesX - w - 1
		) : xPos;

		//Generate a random vertical position for the room
		var y = (typeof yPos === "undefined") ? Roguelike.Utils.randomNumber(
			1,
			this.game.map.settings.tilesY - h - 1
		) : yPos;

		//Create a new room with these values and return it
		return new Roguelike.Room(x, y, w, h);

	},

	/**
	 * Places a room on the map
	 * @protected
	 *
	 * @param {Object} room - The room to place on the map
	 */
	placeRoom: function(room) {

		this.game.map.allRooms.push(room);

		//Loop through every horizontal row
		for(var x = room.x1; x < room.x2; x++) {

			//What is the current Y position in the layout of the current room
			var layoutXPos = room.x2 - x - 1;

			//Loop through every vertical row
			for(var y = room.y1; y < room.y2; y++) {

				//What is the current X position in the layout of the current room
				var layoutYPos = room.y2 - y - 1;

				//Don't place wall's over existing floor tiles. This solves the problem that some corridors may get shut of
				if(this.game.map.tiles[x][y].type !== 2) {

					//Place the tile that is on the layout on this position on the map
					this.game.map.tiles[x][y] = room.layout[layoutXPos][layoutYPos];

				}

			}

		}

	},

	/**
	 * Check in which direction the corridor has to be generated
	 * @protected
	 *
	 * @param {Object} firstRoom - The room from which we are going to generate a path to the second room
	 * @param {Object} secondRoom - This room is going to be the endpoint of this corridor
	 */
	generateCorridor: function(firstRoom, secondRoom) {

		//Exit positions are stored in layout, so upper left is 0,0.
		//We need the map's position, so we'll add the top left coordinates of the room
		var firstExit = {
			x: firstRoom.x1 + firstRoom.exit.x,
			y: firstRoom.y1 + firstRoom.exit.y
		};

		var secondExit = {
			x: secondRoom.x1 + secondRoom.exit.x,
			y: secondRoom.y1 + secondRoom.exit.y
		};

		//Check if we even need to generate a horizontal corridor, or if we are on the same coordinate
		if(secondExit.x !== firstExit.x) {

			//Horizontal Corridors
			if((secondExit.x - firstExit.x) > 0) {

				//Corridor going left
				for(var i = secondExit.x; i >= firstExit.x; i--) {
					this.generateHorizontalCorridor(i, secondExit.y);
				}

			}else{

				//Corridor going right
				for(var i = secondExit.x; i <= firstExit.x; i++) {
					this.generateHorizontalCorridor(i, secondExit.y);
				}

			}

		}

		//Check if we even need to generate a vertical corridor, or if we are on the same coordinate
		if(secondExit.y !== firstExit.y) {

			//Vertical Corridors
			if((secondExit.y - firstExit.y) > 0) {

				//If the corridor is going up
				for(var i = secondExit.y; i >= firstExit.y; i--) {
					this.generateVerticalCorridor(firstExit.x, i);
				}

			}else{

				//If the corridor is going down
				for(var i = secondExit.y; i <= firstExit.y; i++) {
					this.generateVerticalCorridor(firstExit.x, i);
				}

			}

		}

	},

	/**
	 * Generate a horizontal corridor tile, and also place doors and walls
	 * @protected
	 *
	 * @param {Number} x - The horizontal position of the tile that has to become a corridor
	 * @param {Number} y - The vertical position of the tile that has to become a corridor
	 */
	generateHorizontalCorridor: function(x, y) {

		//Define the map variable
		var map = this.game.map;

		//Get the current tile
		var currentTile = map.tiles[x][y];

		//Check the tiles type from the tiles above and below the current tile
		var aboveTile = map.tiles[x][y + 1];
		var belowTile = map.tiles[x][y - 1];

		//If the current tile type is a wall, and the tiles above and below here are also walls
		//this may be a possible door location
		if(currentTile.type === 1 && aboveTile.type === 1 && belowTile.type === 1) {

			//Push the coordinates into the array for later use
			this.possibleDoorLocations.push({x: x, y: y});

		}

		//Set the current tile to floor
		this.changeTileToFloor(currentTile);

		//Generate walls below this hallway
		if(aboveTile.type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(aboveTile);

		}

		//Generate walls above this hallway
		if(belowTile.type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(belowTile);

		}

	},

	/**
	 * Generate a vertical corridor tile, and also place walls
	 * @protected
	 *
	 * @param {Number} x - The horizontal position of the tile that has to become a corridor
	 * @param {Number} y - The vertical position of the tile that has to become a corridor
	 */
	generateVerticalCorridor: function(x, y) {

		//Define the map variable
		var map = this.game.map;

		//Get the current tile
		var currentTile = map.tiles[x][y];

		//Check the tiles type from the tiles above and below the current tile
		var rightTile = map.tiles[x + 1][y];
		var leftTile = map.tiles[x - 1][y];

		//If the current tile type is a wall, and the tiles left and right here are also walls
		//this may be a possible door location
		if(currentTile.type === 1 && rightTile.type === 1 && leftTile.type === 1) {

			//Push the coordinates into the array for later use
			this.possibleDoorLocations.push(new Roguelike.Vector2(x, y));

		}

		//Set the current tile to floor
		this.changeTileToFloor(currentTile);

		//The following checks prevent corners ending without being attached to another wall
		//Because we don't know which direction the vertical corridor is being placed, we check
		//upperleft, upperright, bottomleft and bottomright
		//TODO: Find a better solution for these checks

		//Also check for the upperright tile to maybe place a wall
		if(map.tiles[x + 1][y + 1].type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(map.tiles[x + 1][y + 1]);

		}

		//Also check for the upperleft tile to maybe place a wall
		if(map.tiles[x - 1][y - 1].type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(map.tiles[x - 1][y - 1]);

		}

		//Also check for the bottomright tile to maybe place a wall
		if(map.tiles[x + 1][y - 1].type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(map.tiles[x + 1][y - 1]);

		}

		//Also check for the bottomleft tile to maybe place a wall
		if(map.tiles[x - 1][y + 1].type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(map.tiles[x - 1][y + 1]);

		}

	},

	/**
	 * Changes a tile to a floor
	 * @protected
	 *
	 * @param {Roguelike.Tile} tile - The tile that is being changed
	 */
	changeTileToFloor: function(tile) {

		tile.type = 2;
		tile.tileRow = 3;
		tile.tileNumber = Roguelike.Utils.randomNumber(2, 5);
		tile.blockLight = false;

	},

	/**
	 * Changes a tile to a wall
	 * @protected
	 *
	 * @param {Roguelike.Tile} tile - The tile that is being changed
	 */
	changeTileToWall: function(tile) {

		tile.type = 1;
		tile.tileRow = 0;
		tile.tileNumber = Roguelike.Utils.randomNumber(1, 2);
		tile.blockLight = true;

	}

};
