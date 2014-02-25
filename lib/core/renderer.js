/*
* Renderer constructor
* 
* @class Roguelike.Renderer
* @classdesc An object that handles the rendering of the map onto the canvas
*
* @property {Roguelike.Game} game - Reference to the current game object
*/
Roguelike.Renderer = function(game){

    /*
    * @property {Roguelike.Game} game - Reference to the current game object
    */
    this.game = game;

    /*
    * @property {object} canvas - Reference to the canvas object everything is drawn on
    */
    this.canvas = game.settings.canvas;

    /*
    * @property {object} canvas - The 2D context of the current canvas object
    */
    this.context = game.settings.canvas.getContext("2d");

    /*
    * @property {array} tileColors - Contains all the default colors for the tiles
    */
    this.tileColors = ['#302222','#443939','#6B5B45'];

    /*
    * @property {array} objectColors - Contains all the default colors for the objects
    */
    this.objectColors = ['#963535', '#CCC'];

};

Roguelike.Renderer.prototype = {

    /*
    * Draw the current map onto the canvas
    * @protected
    */
    drawMap: function(){

        //Save the context to push a copy of our current drawing state onto our drawing state stack
        this.context.save();

        //Loop through every horizontal row
        for(y = 0; y < this.game.map.tilesY; y++){

            //Loop through every vertical row
            for(x = 0; x < this.game.map.tilesX; x++){

                //Get the type of the current tile
                var tileType = this.game.map.tiles[y][x].type;

                //Get the corrosponding color of this tile from the array of colors
                this.context.fillStyle = this.tileColors[tileType];

                //Create a rectangle!
                this.context.fillRect(
                    //Get the current position of the tile, and check where it is in the camera's viewport
                    (x * this.game.map.tileSize) - this.game.camera.position.x,
                    (y * this.game.map.tileSize) - this.game.camera.position.y,
                    this.game.map.tileSize,
                    this.game.map.tileSize
                );

                //Draw the lightmap
                if(this.game.map.tiles[y][x].explored === true && 1 - this.game.map.tiles[y][x].lightLevel > 0.7){

                    this.context.fillStyle = "rgba(0, 0, 0, 0.7)";

                }else{

                    this.context.fillStyle = "rgba(0, 0, 0, "+(1 - this.game.map.tiles[y][x].lightLevel)+")";

                }

                //Create a rectangle!
                this.context.fillRect(
                    //Get the current position of the tile, and check where it is in the camera's viewport
                    (x * this.game.map.tileSize) - this.game.camera.position.x,
                    (y * this.game.map.tileSize) - this.game.camera.position.y,
                    this.game.map.tileSize,
                    this.game.map.tileSize
                );

            }

        }

        //Pop the last saved drawing state off of the drawing state stack
        this.context.restore();

    },

    /*
    * Draw the player onto the canvas
    * @protected
    */
    drawPlayer: function(){

        //Save the context to push a copy of our current drawing state onto our drawing state stack
        this.context.save();

        //The players color
        this.context.fillStyle = "#F5F522";

        //Create the player ( just a rectangle for now )!
        this.context.fillRect(
            (this.game.player.position.x * this.game.map.tileSize) - this.game.camera.position.x,
            (this.game.player.position.y * this.game.map.tileSize) - this.game.camera.position.y,
            this.game.map.tileSize,
            this.game.map.tileSize
        );

        //Pop the last saved drawing state off of the drawing state stack
        this.context.restore();

    },

    /*
    * Draw all objects on the canvas
    * @protected
    */
    drawObjects: function(){

        //Save the context to push a copy of our current drawing state onto our drawing state stack
        this.context.save();

        //Loop through every object
        for(i = 0; i < this.game.map.objects.length; i++){

            var currentObject = this.game.map.objects[i];

            //The objects color
            this.context.fillStyle = this.objectColors[currentObject.type];

            //Create the object ( just a rectangle for now )!
            this.context.fillRect(
                (currentObject.position.x * this.game.map.tileSize) - this.game.camera.position.x,
                (currentObject.position.y * this.game.map.tileSize) - this.game.camera.position.y,
                this.game.map.tileSize,
                this.game.map.tileSize
            );

        }

        //Pop the last saved drawing state off of the drawing state stack
        this.context.restore();

    },

    /*
    * All the functions that need to be executed everytime the game updates
    * @protected
    *
    */
    update: function(){

        //Clear the entire canvas
        this.context.clearRect(0, 0, this.game.settings.canvas.width, this.game.settings.canvas.height);

        //Redraw the map
        this.drawMap();

        //Draw all objects on this map
        this.drawObjects();

        //Redraw the player
        this.drawPlayer();

    }

};