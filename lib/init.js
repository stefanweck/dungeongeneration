window.onload = function(){

    initializeGame();

};

function initializeGame(){

    var options = {
        canvasW: 900, //The width of the canvas
        canvasH: 600, //The height of the canvas
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

    //Create a new game
    game = new Roguelike.Game(options);

}