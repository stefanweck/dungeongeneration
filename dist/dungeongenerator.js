/*! Dungeon Generator - v1.2.0 - 2014-02-17
* https://github.com/stefanweck/dungeongeneration
* Copyright (c) 2014 Stefan Weck */
/*
* Roguelike javascript game with HTML5's canvas
*
* v.1.2 - Build on: 12 Feb 2014
*
* Version 1.2! This version only includes generation rooms, 
* making sure they don't overlap eachother and corridor generation!
*
* What's next?
* 
* - Configurable amount of exits/entrances to a room
* - Walls, different tiles etc
* - Tile types
* - Path finding
* - Creating a game with the dungeon generator
* 
*/

/*
* @namespace Roguelike
*/
var Roguelike = Roguelike || {

    VERSION: '1.2'

};
Roguelike.Game = function(userSettings){

    /*
    * @property {bool} isInitialized - Boolean to see if the game is allready initialized
    */
    this.isInitialized = false;

    /*
    * @property {Roguelike.Map} map - Reference to the current map
    */
    this.map = null;

    /*
    * @property {Roguelike.Renderer} map - Reference to the current renderer
    */
    this.renderer = null;

    /*
    * @property {object} settings - The default settings
    */
    this.settings = {
        canvas: null,
        tilesX: 60,
        tilesY: 40,
        tileSize: 20,
        maxRooms: 10,
        minRoomWidth: 6,
        maxRoomWidth: 12,
        minRoomHeight: 6,
        maxRoomHeight: 12,
        debug: false
    };

    //Extend the default settings with those of the user
    this.settings = Roguelike.Utils.extend(this.settings, userSettings);

    //Initialize itself
    this.initialize();

};

Roguelike.Game.prototype = {

    /*
    * Initialize the game, create all objects
    * @protected
    *
    * @param {int} tileX - The number of tiles on the X axis
    * @param {int} tileY - The number of tiles on the Y axis
    * @param {int} maxRooms - The maximum number of rooms in a map
    */
    initialize: function(){

        //Check if the game is allready initialized
        if(this.isInitialized){
            return;
        }

        //Check if the debugged has to be initialized
        if(this.settings.debug === true){
            canvas.addEventListener('mousemove', Roguelike.Utils.debugTiles, false);
        }

        //Initialize the map
        this.map = new Roguelike.Map(this);
        this.map.initialize();

        //Generate rooms for this map
        this.map.roomFactory.generateRooms(this);
        this.map.addRooms();

        //Draw the map on canvas
        this.renderer = new Roguelike.Renderer(this);
        this.renderer.draw(this);

    }

};
Roguelike.Renderer = function(){

    /*
    * @property {array} colors - Contains all the default colors for the tiles
    */
    this.colors = ['#302222','#443939','#6B5B45', '#CCC'];

};

Roguelike.Renderer.prototype = {

    /*
    * Draw the current map onto the canvas
    * @protected
    *
    * @param {Roguelike.Map} map - The map that is going to be drawn onto the canvas
    */
    draw: function(game){

        //Get the canvas 2D context of the current canvas
        var context = game.settings.canvas.getContext("2d");

        //Loop through every horizontal row
        for(y = 0; y < game.map.tilesY; y++){

            //Loop through every vertical row
            for(x = 0; x < game.map.tilesX; x++){

                //Get the type of the current tile
                var tileType = game.map.tiles[y][x].type;

                //Get the corrosponding color of this tile from the array of colors
                context.fillStyle = this.colors[tileType];

                //Create a rectangle!
                context.fillRect(
                    x * game.map.tileSize,
                    y * game.map.tileSize,
                    game.map.tileSize,
                    game.map.tileSize
                );

            }

        }

    }

};
Roguelike.RoomFactory = function(){

    //No properties for RoomFactory, so lonely :(!!

};

Roguelike.RoomFactory.prototype = {

    /*
    * Generate a random amount of rooms and add them to the room list
    * @protected
    *
    * @param {Roguelike.Map} map - The map for which we have to generate rooms
    */
    generateRooms: function(game){

        //Maximum number of tries before stopping the placement of more rooms
        var maxTries = game.map.maxRooms + 10;
        var tries = 0;

        //Create rooms and add them to the list
        while (game.map.rooms.length < game.map.maxRooms) {

            //Check if the limit has been reached, this prevents the while loop from crashing your page
            //We assume there is no space left on the map and break the loop
            if(tries >= maxTries){ break; }

            //Generate random values ( in tiles )
            var w = Roguelike.Utils.randomNumber(
                game.map.minRoomWidth,
                game.map.maxRoomWidth
            );
            var h = Roguelike.Utils.randomNumber(
                game.map.minRoomHeight,
                game.map.maxRoomHeight
            );
            var x = Roguelike.Utils.randomNumber(
                1,
                game.map.tilesX - w - 1
            );
            var y = Roguelike.Utils.randomNumber(
                1,
                game.map.tilesY - h - 1
            );

            //Create a new room with these values
            var oRoom = new Roguelike.Room(x, y, w, h);

            //We tryed to create a room at a certain position
            tries++;

            //Check if this room intersects with the other rooms, if not, add it to the list
            if(!game.map.roomIntersectsWith(oRoom)){

                //The room doesn't intersect, initialize the room layout
                oRoom.initialize();
                oRoom.generateExit();

                //Add the room to the room list
                game.map.rooms.push(oRoom);

                //Reset tries back to zero, giving the next room equal chances of spawning
                tries = 0;

            }

        }

    },

    /*
    * Generate corridors based on the corridors list
    * @protected
    *
    * @param {Roguelike.Map} map - The map for which we have to generate corridors
    */
    generateCorridors: function(map){

        //After all the rooms are placed, go and generate the corridors
        for(var i = 0; i < map.corridors.length; i++){

            //Generate a corridor from this position to the previous room's exit
            this.generateCorridor(map, map.corridors[i]);

        }

    },

    /*
    * Check in which direction the corridor has to be generated
    * @protected
    *
    * @param {Roguelike.Map} map - The map for which we have to generate the current curridor
    * @param {object} corridor - The current corridor that has to be generated
    */
    generateCorridor: function(map, corridor){

        //Horizontal Corridors
        if((corridor.x - corridor.prevx) > 0){

            //Corridor going left
            for(i = corridor.x; i >= corridor.prevx; i--){
                this.generateHorizontalCorridor(map, i, corridor.y);
            }

        }else{
            
            //Corridor going right
            for(i = corridor.x; i <= corridor.prevx; i++){
                this.generateHorizontalCorridor(map, i, corridor.y);
            }
        }

        //Vertical Corridors
        if((corridor.y - corridor.prevy) > 0){
            
            //If the corridor is going up
            for(i = corridor.y; i >= corridor.prevy; i--){
                this.generateVerticalCorridor(map, corridor.prevx, i);
            }

        }else{
            
            //If the corridor is going down
            for(i = corridor.y; i <= corridor.prevy; i++){
                this.generateVerticalCorridor(map, corridor.prevx, i);
            }
        }

    },

    /*
    * Generate a horizontal corridor tile, and also place doors and walls
    * @protected
    *
    * @param {Roguelike.Map} map - The map for which we have to generate the current corridor
    * @param {int} x - The horizontal position of the tile that has to become a corridor
    * @param {int} y - The vertical position of the tile that has to become a corridor
    */
    generateHorizontalCorridor: function(map, x, y){

        //Check if if there is a wall where we place this corridor, and have a random chance to spawn a door
        if(map.tiles[y][x].type === 1 && map.tiles[y + 1][x].type !== 2 && map.tiles[y - 1][x].type !== 2 && Roguelike.Utils.randomNumber(1, 100) > 70){
            map.tiles[y][x].type = 3;
        }else{
            //Place a floor tile
            map.tiles[y][x].type = 2;
        }

        //Generate walls below this hallway
        if(map.tiles[y + 1][x].type === 0 || map.tiles[y + 1][x].type === 3){
            map.tiles[y + 1][x].type = 1;
        }

        //Generate walls above this hallway
        if(map.tiles[y - 1][x].type === 0 || map.tiles[y - 1][x].type === 3){
            map.tiles[y - 1][x].type = 1;
        }

    },

    /*
    * Generate a vertical corridor tile, and also place walls
    * @protected
    *
    * @param {Roguelike.Map} map - The map for which we have to generate the current corridor
    * @param {int} prevx - The horizontal position of the tile that has to become a corridor
    * @param {int} y - The vertical position of the tile that has to become a corridor
    */
    generateVerticalCorridor: function(map, prevx, y){

        //Set the current tile to floor
        map.tiles[y][prevx].type = 2;

        //Generate walls right from this hallway
        if(map.tiles[y][prevx + 1].type === 0){
            map.tiles[y][prevx + 1].type = 1;
        }
        //Generate walls left from this hallway
        if(map.tiles[y][prevx - 1].type === 0){
            map.tiles[y][prevx - 1].type = 1;
        }

    }

};
Roguelike.Tile = function(type, room){

    /*
    * @property {int} The kind of tile, wall, floor, void etc
    */
    this.type = type;

    /*
    * @property {Roguelike.Room} belongsTo - The room that this tile belongs to
    */
    this.belongsTo = room;

};
Roguelike.Map = function(game){

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
    * @property {Roguelike.RoomFactory} roomFactory - The room factory is responsible for creating rooms and corridors on this map
    */
    this.roomFactory = null;

};

Roguelike.Map.prototype = {

    /*
    * Initialize the layout of the map, filling it with empty tiles
    * @protected
    */
    initialize: function(){

        //Create the map factory
        this.roomFactory = new Roguelike.RoomFactory();

        //Loop through every horizontal row
        for(y = 0; y < this.tilesY; y++){

            //Initialize this row
            this.tiles[y] = [];

            //Loop through every vertical row
            for(x = 0; x < this.tilesX; x++){

                //Initialize this position by setting it to zero
                this.tiles[y][x] = new Roguelike.Tile(0);

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

        //Define variables
        var previousExit = [];
        var currentExit = [];

        //Loop through each room in the list
        for (var i = 0; i < this.rooms.length; i++) {

            //Set the last exit to the previous exits variable
            //TODO: Find out why cloning doesn't work
            previousExit['x'] = currentExit['x'];
            previousExit['y'] = currentExit['y'];

            //Loop through every horizontal row
            for(y = this.rooms[i].y1; y < this.rooms[i].y2; y++){

                //What is the current Y position in the layout of the current room
                var layoutYPos = this.rooms[i].y2 - y - 1;

                //Loop through every vertical row
                for(x = this.rooms[i].x1; x < this.rooms[i].x2; x++){

                //What is the current X position in the layout of the current room
                var layoutXPos = this.rooms[i].x2 - x - 1;
                var currentTile = this.rooms[i].layout[layoutYPos][layoutXPos];

                    //Place the tile that is on the layout on this position on the map
                    this.tiles[y][x] = currentTile;

                    //If the current tile is an exit, set the variables for this position
                    if(currentTile.type === 3){
                        currentExit['x'] = x;
                        currentExit['y'] = y;
                    }

                }

            }

            //Add corridor when this is not the first room
            if(i !== 0){
                var corridor = {'x' : currentExit['x'], 'y' : currentExit['y'], 'prevx' : previousExit['x'], 'prevy' : previousExit['y']};
                this.corridors.push(corridor);
            }

        }

        //Generate the corridors for these rooms on the current map object
        this.roomFactory.generateCorridors(this);

    }

};
Roguelike.Room = function(x, y, w, h){

    /*
    * @property {int} x1 - The X position of the top left corner of this room
    */
    this.x1 = x;

    /*
    * @property {int} x2 - The X position of the top right corner of this room
    */
    this.x2 = w + x;

    /*
    * @property {int} y1 - The Y position of top left corner of this room
    */
    this.y1 = y;

    /*
    * @property {int} y2 - The Y position of bottom left corner of this room
    */
    this.y2 = y + h;

    /*
    * @property {int} w - The width of this room, defined in tiles
    */
    this.w = w;

    /*
    * @property {int} h - The heigth of this room, defined in tiles
    */
    this.h = h;

    /*
    * @property {array} layout - The array that contains the layout of this room
    */
    this.layout = [];

};

Roguelike.Room.prototype = {

    /*
    * Initialize the layout of the room, filling it with default tiles
    * @protected
    */
    initialize: function(){

        //Loop through every horizontal row
        for(y = 0; y < this.h; y++){

            //Initialize this row
            this.layout[y] = [];

            //Loop through every vertical row
            for(x = 0; x < this.w; x++){

                //Check if the position filled has to be a wall or floor
                if(y === 0 || y === this.h - 1 || x === 0 || x === this.w - 1){
                    this.layout[y][x] = new Roguelike.Tile(1, this);
                }else{
                    this.layout[y][x] = new Roguelike.Tile(2, this);
                }

            }

        }

    },

    /*
    * Generate an exit on a random side of this room
    * @protected
    */
    generateExit: function(){

        //Add an exit on one of the sides of the wall
        //But one tile further into the room, so we don't get weird openings
        //when the generation of a corridor goes the other direction
        switch(Roguelike.Utils.randomNumber(1,4)){

            case(1): //Top
                this.layout[this.h - 2][Roguelike.Utils.randomNumber(1, this.w - 2)].type = 3;
            break;

            case(2): //Bottom
                this.layout[1][Roguelike.Utils.randomNumber(1, this.w - 2)].type = 3;
            break;

            case(3): //Left
                this.layout[Roguelike.Utils.randomNumber(1, this.h - 2)][this.w - 2].type = 3;
            break;

            case(4): //Right
                this.layout[Roguelike.Utils.randomNumber(1, this.h - 2)][1].type = 3;
            break;

        }

    }

};
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
window.onload = function(){

    initializeCanvas();

};

function initializeCanvas(){

    //Initialize the canvas
    canvas = document.getElementById("canvas");
    canvas.width = 900;
    canvas.height = 600;

    var options = {
        canvas: canvas, //The canvas object on which our dungeon is placed on
        tilesX: 60, //The number of horizontal tiles on this map
        tilesY: 40, //The number of vertical tiles on this map
        tileSize: 15, //The width and height of a single tile
        maxRooms: 10, //The maximum number of rooms on this map
        minRoomWidth: 6, //The minimum width of a single room
        maxRoomWidth: 12, //The maximum width of a single room
        minRoomHeight: 6, //The minimum height of a single room
        maxRoomHeight: 12, //The maximum height of a single room
        debug: false //Boolean to enable or disable the debugger
    };

    //Set click event to the canvas
    canvas.addEventListener('click', function(){
        game = new Roguelike.Game(options);
    }, false);

    //Create a new game
    game = new Roguelike.Game(options);

    //TODO: Don't make this so ugly
    document.addEventListener("click", function(){

        game.map = new Roguelike.Map(game);
        game.map.initialize();

        //Generate rooms for this map
        game.map.roomFactory.generateRooms(game);
        game.map.addRooms();

        //Draw the map on canvas
        game.renderer.draw(game);

    }, false);

}