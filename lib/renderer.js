/*
* Renderer constructor
* 
* @class Roguelike.Renderer
* @classdesc An object that handles the rendering of the map onto the canvas
* 
*/
Roguelike.Renderer = function(game){

    /*
    * @property {PIXI.Stage} stage - Instance of the Pixi stage
    */
   this.stage = null;

   /*
    * @property {PIXI.autoDetectRenderer} renderer - Instance of the Pixi renderer
    */
   this.renderobject = null;

    /*
    * @property {array} colors - Contains all the default colors for the tiles
    */
    this.colors = ['0x302222','0x443939','0x6B5B45', '0xCCCCCC'];

    //Initialize the renderer object
    this.initialize(game);

};

Roguelike.Renderer.prototype = {

    /*
    * Initialize the renderer
    * @protected
    */
    initialize: function(game){

        // create an new instance of a pixi stage
        this.stage = new PIXI.Stage(
            0x000000
        );

        // create a renderer instance
        this.renderobject = PIXI.autoDetectRenderer(
            game.settings.canvasW, 
            game.settings.canvasH
        );

        // add the renderer view element to the DOM
        document.body.appendChild(this.renderobject.view);

    },

    /*
    * Draw the current map onto the canvas
    * @protected
    *
    * @param {Roguelike.Map} map - The map that is going to be drawn onto the canvas
    */
    draw: function(game){

        //Create a new PIXI graphics instance
        var graphics = new PIXI.Graphics();

        //Loop through every horizontal row
        for(y = 0; y < game.map.tilesY; y++){

            //Loop through every vertical row
            for(x = 0; x < game.map.tilesX; x++){

                //Get the type of the current tile
                var tileType = game.map.tiles[y][x].type;

                //Draw the current tile as a rectangle
                graphics.beginFill(this.colors[tileType], 1);
                graphics.drawRect(
                    x * game.map.tileSize, 
                    y * game.map.tileSize, 
                    game.map.tileSize, 
                    game.map.tileSize
                );
                graphics.endFill();

            }

        }

        //Add the graphics to the renderers stage
        game.renderer.stage.addChild(graphics);

        //Run the render loop
        requestAnimFrame(animate);

        function animate() {

            //Render the stage
            game.renderer.renderobject.render(game.renderer.stage);

            //Star the render loop again
            requestAnimFrame(animate);
        }

    }

};