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

				//If this is the first room, add an entrance to the dungeon
				if(map.rooms.length === 0) {
					room.generateDungeonEntrance(map);
				}

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
	 * @param {int} x - The horizontal position of the tile that has to become a corridor
	 * @param {int} y - The vertical position of the tile that has to become a corridor
	 */
	generateHorizontalCorridor: function(x, y) {

		//Define the map variable
		var map = this.game.map;

		//Get the current tile
		var currentTile = map.tiles[y][x];

		//Check the tiles type from the tiles above and below the current tile
		var aboveTile = map.tiles[y + 1][x];
		var belowTile = map.tiles[y - 1][x];

		//If the current tile type is a wall, and the tiles above and below here are also walls
		//this may be a possible door location
		if(currentTile.type === 1 && aboveTile.type === 1 && belowTile.type === 1){

			//Push the coordinates into the array for later use
			this.possibleDoorLocations.push({x: x, y: y});

		}

		//Set the current tile type to floor
		currentTile.type = 2;
		currentTile.blockLight = false;

		//Generate walls below this hallway
		if(aboveTile.type === 0) {

			aboveTile.type = 1;

		}

		//Generate walls above this hallway
		if(belowTile.type === 0) {

			belowTile.type = 1;

		}

	},

	/**
	 * Generate a vertical corridor tile, and also place walls
	 * @protected
	 *
	 * @param {int} x - The horizontal position of the tile that has to become a corridor
	 * @param {int} y - The vertical position of the tile that has to become a corridor
	 */
	generateVerticalCorridor: function(x, y) {

		//Define the map variable
		var map = this.game.map;

		//Get the current tile
		var currentTile = map.tiles[y][x];

		//Check the tiles type from the tiles above and below the current tile
		var rightTile = map.tiles[y][x + 1];
		var leftTile = map.tiles[y][x - 1];

		//If the current tile type is a wall, and the tiles left and right here are also walls
		//this may be a possible door location
		if(currentTile.type === 1 && rightTile.type === 1 && leftTile.type === 1){

			//Push the coordinates into the array for later use
			this.possibleDoorLocations.push({x: x, y: y});

		}

		//Set the current tile to floor
		currentTile.type = 2;
		currentTile.blockLight = false;

		//Generate walls right from this hallway
		if(rightTile.type === 0) {

			rightTile.type = 1;

		}

		//Generate walls left from this hallway
		if(leftTile.type === 0) {

			leftTile.type = 1;

		}

	},

	/**
	 * Generate some doors and spread them out over the map!
	 * @protected
	 */
	generateDoors: function() {

		//Loop through all possible door locations
		for(var i = 0; i < this.possibleDoorLocations.length; i++){

			//Store the current location in a local variable
			var doorLocation = this.possibleDoorLocations[i];

			//Get the tile at the location of the possible door location
			var tileLeft = this.game.map.tiles[doorLocation.y][doorLocation.x - 1];
			var tileRight = this.game.map.tiles[doorLocation.y][doorLocation.x + 1];
			var tileUp = this.game.map.tiles[doorLocation.y + 1][doorLocation.x];
			var tileDown = this.game.map.tiles[doorLocation.y - 1][doorLocation.x];

			//If the tiles left and right are walls and the tiles above and below are floors
			if(tileLeft.type === 1 && tileRight.type === 1 && tileUp.type === 2 && tileDown.type === 2){

				//Place a door at this location
				this.placeDoor(doorLocation);

			//If the tiles left and right are floors and the tiles above and below are walls
			}else if(tileLeft.type === 2 && tileRight.type === 2 && tileUp.type === 1 && tileDown.type === 1){

				//Place a door at this location
				this.placeDoor(doorLocation);

			}

		}

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeDoor: function(position){

		//Get the tile at the door's position
		var tileAtPosition = this.game.map.tiles[position.y][position.x];

		//Create the door entity
		var doorEntity = new Roguelike.Entity();

		//Add components to the door entity
		doorEntity.addComponent(new Roguelike.Components.Position(position.x, position.y));
		doorEntity.addComponent(new Roguelike.Components.Sprite("#FFD900"));

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

		//Get the position of the dungeon entrance
		var entrancePosition = this.game.map.entrance;

		//Create the entrance entity
		var entranceEntity = new Roguelike.Entity();

		//Add components to the entrance entity
		entranceEntity.addComponent(new Roguelike.Components.Position(entrancePosition.x, entrancePosition.y));
		entranceEntity.addComponent(new Roguelike.Components.Sprite("#BD2D2D"));

		//Add this entity to the map
		this.game.map.entities.addEntity(entranceEntity);

		//TODO: Make exit object

	}

};
