function RoomFactory(){

    //Room Factory properties
    

}

RoomFactory.prototype.generateRooms = function generateRooms(map){

    //Maximum number of tries before stopping the placement of more rooms
    var maxTries = map.maxRooms + 10;
    var tries = 0;

    //Create rooms and add them to the list
    while (map.rooms.length < map.maxRooms) {

        //Check if the limit has been reached, this prevents the while loop from crashing your page
        //We assume there is no space left on the map and break the loop
        if(tries >= maxTries){ break; }

        //Generate random values ( in tiles )
        var w = randomNumber(map.minRoomWidth, map.maxRoomWidth);
        var h = randomNumber(map.minRoomHeight, map.maxRoomHeight);
        var x = randomNumber(1, map.tilesX - w - 1);
        var y = randomNumber(1, map.tilesY - h - 1);

        //Create a new room with these values
        var oRoom = new Room(x, y, w, h);

        //We tryed to create a room at a certain position
        tries++;

        //Check if this room intersects with the other rooms, if not, add it to the list
        if(!map.roomIntersectsWith(oRoom)){

            //The room doesn't intersect, initialize the room layout
            oRoom.initialize();
            oRoom.generateExit();

            //Add the room to the room list
            map.rooms.push(oRoom);

            //Reset tries back to zero, giving the next room equal chances of spawning
            tries = 0;

        }

    }

};

RoomFactory.prototype.genereteCorridors = function genereteCorridors(map){

    //After all the rooms are placed, go and generate the corridors
    for(var i = 0; i < map.corridors.length; i++){

        //Generate a corridor from this position to the previous room's exit
        this.generateCorridor(map, map.corridors[i].x, map.corridors[i].y, map.corridors[i].prevx, map.corridors[i].prevy);

    }

};

RoomFactory.prototype.generateCorridor = function generateCorridor(map, x, y, prevx, prevy){

    //Horizontal Corridors
    if((x - prevx) > 0){

        //Corridor going left
        for(i = x; i >= prevx; i--){
            this.generateHorizontalCorridor(map, i, y);
        }

    }else{
        
        //Corridor going right
        for(i = x; i <= prevx; i++){
            this.generateHorizontalCorridor(map, i, y);
        }
    }

    //Vertical Corridors
    if((y - prevy) > 0){
        
        //If the corridor is going up
        for(i = y; i >= prevy; i--){
            this.generateVerticalCorridor(map, i, prevx);
        }

    }else{
        
        //If the corridor is going down
        for(i = y; i <= prevy; i++){
            this.generateVerticalCorridor(map, i, prevx);
        }
    }

};

RoomFactory.prototype.generateHorizontalCorridor = function generateHorizontalCorridor(map, i, y){

    //Set the current tile to floor
    map.tiles[y][i] = 2;

    //Generate walls around this hallway
    if(map.tiles[y + 1][i] === 0){
        map.tiles[y + 1][i] = 1;
    }
    if(map.tiles[y - 1][i] === 0){
        map.tiles[y - 1][i] = 1;
    }

};

RoomFactory.prototype.generateVerticalCorridor = function generateVerticalCorridor(map, i, prevx){

    //Set the current tile to floor
    map.tiles[i][prevx] = 2;

    //Generate walls around this hallway
    if(map.tiles[i][prevx + 1] === 0){
        map.tiles[i][prevx + 1] = 1;
    }
    if(map.tiles[i][prevx - 1] === 0){
        map.tiles[i][prevx - 1] = 1;
    }

};