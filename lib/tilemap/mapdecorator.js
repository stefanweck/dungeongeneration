/**
 * MapDecorator constructor
 *
 * @class Roguelike.MapDecorator
 * @classdesc The object that is responsible for decorating the dungeon, place
 * doors, grass, loot, monsters etc.
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 */
Roguelike.MapFactory = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.MapFactory.prototype = {

	/**
	 * Generate some doors and spread them out over the map!
	 * @protected
	 *
	 * @param {array} possibleLocations - An array filled with all possible coordinates of door locations
	 */
	generateDoors: function(possibleLocations) {

		//Loop through all possible door locations
		for(var i = 0; i < possibleLocations.length; i++) {

			//Store the current location in a local variable
			var doorLocation = possibleLocations[i];

			//Get the tile at the location of the possible door location
			var tileLeft = this.game.map.tiles[doorLocation.y][doorLocation.x - 1];
			var tileRight = this.game.map.tiles[doorLocation.y][doorLocation.x + 1];
			var tileUp = this.game.map.tiles[doorLocation.y + 1][doorLocation.x];
			var tileDown = this.game.map.tiles[doorLocation.y - 1][doorLocation.x];

			var randomNumber = Roguelike.Utils.randomNumber(0, 100);

			//If the tiles left and right are walls and the tiles above and below are floors
			if(tileLeft.type === 1 && tileRight.type === 1 && tileUp.entities.length === 0 && tileDown.entities.length === 0 && tileUp.type === 2 && tileDown.type === 2 && randomNumber > 80) {

				//Place a door at this location
				this.placeDoor(doorLocation);

				//If the tiles left and right are floors and the tiles above and below are walls
			}else if(tileLeft.type === 2 && tileRight.type === 2 && tileLeft.entities.length === 0 && tileRight.entities.length === 0 && tileUp.type === 1 && tileDown.type === 1 && randomNumber > 60) {

				//Place a door at this location
				this.placeDoor(doorLocation);

			}

		}

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeDoor: function(position) {

		//Get the tile at the door's position
		var tileAtPosition = this.game.map.tiles[position.y][position.x];

		//Create the door entity
		var doorEntity = Roguelike.PropFactory.newDoor({x: position.x, y: position.y});

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

		//Let the rooms return a random tile
		var entrancePosition = entranceRoom.getRandomPosition();
		var exitPosition = exitRoom.getRandomPosition();

		//Store the entrance and exit positions in the map for later use
		//For example, player spawning
		this.game.map.entrance = entrancePosition;
		this.game.map.exit = exitPosition;

		//Create the entrance entity
		var entranceEntity = new Roguelike.Entity();

		//Add components to the entrance entity
		entranceEntity.addComponent(new Roguelike.Components.Position(entrancePosition.x, entrancePosition.y));
		entranceEntity.addComponent(new Roguelike.Components.Sprite("#BD2D2D"));

		//Create the entrance entity
		var exitEntity = new Roguelike.Entity();

		//Add components to the exit entity
		exitEntity.addComponent(new Roguelike.Components.Position(exitPosition.x, exitPosition.y));
		exitEntity.addComponent(new Roguelike.Components.Sprite("#BD2D2D"));

		//Add this entity to the map
		this.game.map.entities.addEntity(entranceEntity);
		this.game.map.entities.addEntity(exitEntity);


	},

	decorateDungeon: function(){

		var map = this.game.map;

		//Loop through every horizontal row
		for(var y = 0; y < map.tilesY; y++) {

			//Loop through every vertical row
			for(var x = 0; x < map.tilesX; x++) {

				if(map.tiles[y][x].type === 2){

					//Have a random chance to spawn grass on this tile
					if(Roguelike.Utils.randomNumber(0, 100) >= 80){

						grassEntity = new Roguelike.DecorationFactory.newGrass({x: x, y: y});

						map.tiles[y][x].entities.push(grassEntity);

						//Add the entity to the map
						map.entities.addEntity(grassEntity);

					}

				}

			}

		}

	}

};
