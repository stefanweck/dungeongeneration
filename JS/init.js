//TODO
//Add default settings, just like jquery's extend options

//Initialize variables
var oCanvas;
var oContext;

window.onload = function(){

    initializeCanvas();

};

function initializeCanvas(){

    //Initialize the canvas
    oCanvas = document.getElementById("canvas");
    oContext = oCanvas.getContext("2d");

    //Set the width and height of the canvas
    oCanvas.width = 900;
    oCanvas.height = 600;

    //Create a new game
    var game = new Roguelike.Game();

    //Initialize the game
    game.initialize(
        //Tiles X
        60,
        //Tiles Y
        40,
        //Maximum number of rooms
        10
    );

    //Debug functionality
    canvas.addEventListener('mousemove', function(e) {
        var mousePos = Roguelike.Utils.getMousePos(canvas, e);
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

    }, false);

}