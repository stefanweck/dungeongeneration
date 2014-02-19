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
    drawMap: function(){

        //Loop through every horizontal row
        for(y = 0; y < this.game.map.tilesY; y++){

            //Loop through every vertical row
            for(x = 0; x < this.game.map.tilesX; x++){

                //Get the type of the current tile
                var tileType = this.game.map.tiles[y][x].type;

                //Get the corrosponding color of this tile from the array of colors
                this.context.fillStyle = this.colors[tileType];

                //Create a rectangle!
                this.context.fillRect(
                    x * this.game.map.tileSize,
                    y * this.game.map.tileSize,
                    this.game.map.tileSize,
                    this.game.map.tileSize
                );

            }

        }

    },

    /*
    * Draw the player onto the canvas
    * @protected
    */
    drawPlayer: function(){

        //Save the context to push a copy of our current drawing state onto our drawing state stack
        this.context.save();

        //The players color
        this.context.fillStyle = "#615248";

        //Create the player ( just a rectangle for now )!
        this.context.fillRect(
            this.game.player.position.x * this.game.map.tileSize,
            this.game.player.position.y * this.game.map.tileSize,
            this.game.map.tileSize,
            this.game.map.tileSize
        );

        //Pop the last saved drawing state off of the drawing state stack
        this.context.restore();

    }

};