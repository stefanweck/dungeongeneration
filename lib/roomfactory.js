/*
* RoomFactory constructor
* 
* @class Roguelike.RoomFactory
* @classdesc The object that is responsible for generating rooms and corridors
* 
*/
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
            var room = new Roguelike.Room(x, y, w, h);

            //We tryed to create a room at a certain position
            tries++;

            //Check if this room intersects with the other rooms, if not, add it to the list
            if(!game.map.roomIntersectsWith(room)){

                //The room doesn't intersect, initialize the room layout
                room.initialize();
                room.generateExit();

                //If this is the first room, add an entrance to the dungeon
                if(game.map.rooms.length === 0){
                    room.generateDungeonEntrance();
                }

                //Add the room to the room list
                game.map.rooms.push(room);

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