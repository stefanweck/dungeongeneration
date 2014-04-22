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
	 * @property {array} possibleDoorLocations - Stores all the positions of possible door locations
	 */
	this.possibleDoorLocations = [];

};

Roguelike.MapFactory.prototype = {

	/**
	 * Generate a random amount of rooms and add them to the room list
	 * @protected
	 */
	generateRooms: function() {

		//Define the map variable
		var map = this.game.map;

		//Maximum number of tries before stopping the placement of more rooms
		var maxTries = this.game.map.maxRooms + 10;
		var tries = 0;

		//Create rooms and add them to the list
		while(map.rooms.length < map.maxRooms) {

			//Check if the limit has been reached, this prevents the while loop from crashing your page
			//We assume there is no space left on the map and break the loop
			if(tries >= maxTries) {
				break;
			}

			//Generate random values ( in tiles )
			//Start with generating a random width
			var w = Roguelike.Utils.randomNumber(
				map.minRoomWidth,
				map.maxRoomWidth
			);

			//Generate a random height for the room
			var h = Roguelike.Utils.randomNumber(
				map.minRoomHeight,
				map.maxRoomHeight
			);

			//Generate a random width horizontal position for the room
			var x = Roguelike.Utils.randomNumber(
				1,
				map.tilesX - w - 1
			);

			//Generate a random vertical position for the room
			var y = Roguelike.Utils.randomNumber(
				1,
				map.tilesY - h - 1
			);

			//Create a new room with these values
			var room = new Roguelike.Room(x, y, w, h);

			//We tried to create a room at a certain position
			tries++;

			//Check if this room intersects with the other rooms, if not, add it to the list
			if(!map.roomIntersectsWith(room)) {

				//The room doesn't intersect, initialize the room layout
				room.initialize();
				room.generateExit();

				//Add the room to the room list
				map.rooms.push(room);

				//Reset tries back to zero, giving the next room equal chances of spawning
				tries = 0;

			}

		}

	},

	/**
	 * Generate corridors based on the room's exits
	 * @protected
	 */
	generateCorridors: function() {

		//Define the map variable
		var map = this.game.map;

		//After all the rooms are placed, go and generate the corridors
		//We start at the second room, so we can connect to the first room
		for(var i = 1; i < map.rooms.length; i++) {

			//Generate a corridor from this position to the previous room's exit
			this.generateCorridor(map.rooms[i], map.rooms[i - 1]);

		}

	},

	/**
	 * Check in which direction the corridor has to be generated
	 * @protected
	 *
	 * @param {object} firstRoom - The room from which we are going to generate a path to the second room
	 * @param {object} secondRoom - This room is going to be the endpoint of this corridor
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

	},

	/**
	 * Generate a horizontal corridor tile, and also place doors and walls
	 * @protected
	 *
	 * @param {number} x - The horizontal position of the tile that has to become a corridor
	 * @param {number} y - The vertical position of the tile that has to become a corridor
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
	 * @param {number} x - The horizontal position of the tile that has to become a corridor
	 * @param {number} y - The vertical position of the tile that has to become a corridor
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
	 * Generate some doors and spread them out over the map!
	 * @protected
	 */
	generateDoors: function() {

		//Loop through all possible door locations
		for(var i = 0; i < this.possibleDoorLocations.length; i++) {

			//Store the current location in a local variable
			var doorLocation = this.possibleDoorLocations[i];

			//Get the tile at the location of the possible door location
			var tileLeft = this.game.map.tiles[doorLocation.x - 1][doorLocation.y];
			var tileRight = this.game.map.tiles[doorLocation.x + 1][doorLocation.y];
			var tileUp = this.game.map.tiles[doorLocation.x][doorLocation.y - 1];
			var tileDown = this.game.map.tiles[doorLocation.x][doorLocation.y + 1];

			var randomNumber = Roguelike.Utils.randomNumber(0, 100);

			//If the tiles left and right are walls and the tiles above and below are floors
			if(tileLeft.type === 1 && tileRight.type === 1 && tileUp.entities.length === 0 && tileDown.entities.length === 0 && tileUp.type === 2 && tileDown.type === 2 && randomNumber > 80) {

				//Place a door at this location
				this.placeDoor(doorLocation, false);

				//If the tiles left and right are floors and the tiles above and below are walls
			}else if(tileLeft.type === 2 && tileRight.type === 2 && tileLeft.entities.length === 0 && tileRight.entities.length === 0 && tileUp.type === 1 && tileDown.type === 1 && randomNumber > 60) {

				//Place a door at this location
				this.placeDoor(doorLocation, true);

			}

		}

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeDoor: function(position, orientation) {

		//Get the tile at the door's position
		var tileAtPosition = this.game.map.tiles[position.x][position.y];

		//Create the door entity
		var doorEntity = Roguelike.PropFactory.newDoor(position);

		if(orientation === true) {
			doorEntity.components.sprite.number = 0;
			doorEntity.components.sprite.row = 2;
		}

		//Add the entity to the map
		this.game.map.entities.addEntity(doorEntity);

		//Add the door entity to the entities list on the current tile
		tileAtPosition.entities.push(doorEntity);

		//A door blocks light!
		tileAtPosition.blockLight = true;

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeEntranceExitObjects: function() {

		//Generate a random number between 0 and the number of rooms - 2
		//Minus two because then we can select the last room in the list as an exit room
		var entranceRoomIndex = Roguelike.Utils.randomNumber(0, this.game.map.rooms.length - 2);
		var exitRoomIndex = this.game.map.rooms.length - 1;

		//Get the rooms from the room list
		var entranceRoom = this.game.map.rooms[entranceRoomIndex];
		var exitRoom = this.game.map.rooms[exitRoomIndex];

		//Let the rooms return a random position
		var entrancePosition = entranceRoom.getRandomPosition();
		var exitPosition = exitRoom.getRandomPosition();

		//Store the entrance and exit positions in the map for later use
		//For example, player spawning
		this.game.map.entrance = entrancePosition;
		this.game.map.exit = exitPosition;

		//TODO: Place these entities in a factory

		//Create the entrance entity
		var entranceEntity = new Roguelike.Entity();

		//Add components to the entrance entity
		entranceEntity.addComponent(new Roguelike.Components.Position(entrancePosition));
		entranceEntity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 1));

		//Create the entrance entity
		var exitEntity = new Roguelike.Entity();

		//Add components to the exit entity
		exitEntity.addComponent(new Roguelike.Components.Position(exitPosition));
		exitEntity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 0));

		//Add this entity to the map
		this.game.map.entities.addEntity(entranceEntity);
		this.game.map.entities.addEntity(exitEntity);


	},

	/**
	 * Changes a tile to a floor
	 * @protected
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
	 */
	changeTileToWall: function(tile) {

		tile.type = 1;
		tile.tileRow = 0;
		tile.tileNumber = Roguelike.Utils.randomNumber(1, 2)
		tile.blockLight = true;

	},

	//TODO: Create a MapDecorator that handles all of this
	decorateDungeon: function() {

		var map = this.game.map;

		//Loop through every horizontal row
		for(var x = 0; x < map.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.tilesY; y++) {

				if(map.tiles[x][y].type === 1) {

					//Get the tile at the location of the possible door location
					//TODO: Write a function somewhere that returns the surrounding tiles
					var tileLeft = this.game.map.tiles[x - 1][y];
					var tileRight = this.game.map.tiles[x + 1][y];
					var tileDown = this.game.map.tiles[x][y + 1];
					var tileUp = this.game.map.tiles[x][y - 1];

					//TODO: Maybe use a more elegant autotiling solution for this
					//Check left type void, right type floor || Check left type void, right type wall, up type void
					if(tileLeft.type === 0 && tileRight.type === 2 || tileLeft.type === 0 && tileRight.type === 1 && tileUp.type === 0) {

						map.tiles[x][y].tileNumber = 3;

						//Check right type void, left type floor || Check right type void, left type wall, up type void
					}else if(tileRight.type === 0 && tileLeft.type === 2 || tileRight.type === 0 && tileLeft.type === 1 && tileUp.type === 0) {

						map.tiles[x][y].tileNumber = 4;

						//Check above for a wall, left for a wall and right for void
					}else if(tileUp.type === 1 && tileLeft.type === 1 && tileRight.type === 0) {

						map.tiles[x][y].tileNumber = 6;

						//Check above for a wall, right for a wall and left for void
					}else if(tileUp.type === 1 && tileRight.type === 1 && tileLeft.type === 0) {

						map.tiles[x][y].tileNumber = 5;

						//Check up for floor, down for wall, left for floor, right for wall
					}else if(tileUp.type === 2 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 1) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 3;

						//Check up for floor, down for wall, left for wall, right for floor
					}else if(tileUp.type === 2 && tileDown.type === 1 && tileLeft.type === 1 && tileRight.type === 2) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 2;

						//Check if above is floor, right and left are floor and beneath is a wall
					}else if(tileUp.type === 2 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 2) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 5;

						//Check if the tiles left and right are floors, and up and down are walls
					}else if(tileUp.type === 1 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 2 || tileUp.type === 1 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 1) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 4;

					}

				}

				//If the current tile is a floor tile
				if(map.tiles[x][y].type === 2) {

					//Have a random chance to spawn grass on this tile
					if(Roguelike.Utils.randomNumber(0, 100) >= 80) {

						//Create a new grass entity
						grassEntity = new Roguelike.DecorationFactory.newGrass(
							new Roguelike.Vector2(x, y)
						);

						//Add the entity to the tile on the map
						map.tiles[x][y].entities.push(grassEntity);

						//Add the entity to the map
						map.entities.addEntity(grassEntity);

					}

					//Have a random chance to spawn an enemy on this tile
					if(Roguelike.Utils.randomNumber(0, 100) >= 100) {

						//Create a new skeleton
						enemyEntity = new Roguelike.EnemyFactory.newSkeleton(
							new Roguelike.Vector2(x, y)
						);

						//Add the entity to the tile on the map
						map.tiles[x][y].entities.push(enemyEntity);

						//Add the entity to the map
						map.entities.addEntity(enemyEntity);

					}


				}

			}

		}

	}

};
