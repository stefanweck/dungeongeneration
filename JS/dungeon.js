function Dungeon(tileX, TilexY, maxRooms){

    //Dungeon properties
    

    //Objects that belong to a dungeon
    this.map = new Map(tileX, TilexY, maxRooms);
    this.renderer = new Renderer();

    //Initialize this dungeon
    this.initialize();

}

Dungeon.prototype.initialize = function initialize(){

    //Initialize the dungeon
    this.map.initialize();

    //Generate rooms for this map
    this.map.roomFactory.generateRooms(this.map);
    this.map.addRooms();

    //Draw the map on canvas
    this.renderer.draw(this.map);

};