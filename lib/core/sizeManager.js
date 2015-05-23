//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules


/**
 * SizeManager constructor
 *
 * @class SizeManager
 * @classdesc The size manager handles the scale and resizing of the canvas object
 *
 * @param {Game} game - Reference to the current game object
 */
var SizeManager = function(game) {

    /**
     * @property {Game} game - Reference to the current game object
     */
    this.game = game;

    /**
     * @property {Number} width - The width of the canvas
     */
    this.width = 0;

    /**
     * @property {Number} height - The height of the canvas
     */
    this.height = 0;

    /**
     * @property {Null|Number} minWidth - The minimum width of the canvas
     */
    this.minWidth = null;

    /**
     * @property {Null|Number} maxWidth - The maximum width of the canvas
     */
    this.maxWidth = null;

    /**
     * @property {Null|Number} minHeight - The minimum height of the canvas
     */
    this.minHeight = null;

    /**
     * @property {Null|Number} maxHeight - The maximum height of the canvas
     */
    this.maxHeight = null;

    //Initialize itself
    this.initialize();

};

SizeManager.prototype = {

    initialize: function() {

        //Setup width and height
        this.setSize();

        //Bind event listeners
        window.addEventListener('resize', this.windowResize.bind(this), false);

    },

    setSize: function() {

        var width = 0;
        var height = 0;

        var innerWidth = window.innerWidth;
        var innerHeight = window.innerHeight;

        //Set the width and height of the game
        if(this.minWidth !== null && this.minWidth >= innerWidth){
            width = this.minWidth;
        }else if(this.maxWidth !== null && this.maxWidth <= innerWidth){
            width = this.maxWidth;
        }else{
            width = innerWidth;
        }

        if(this.minHeight !== null && this.minHeight >= innerHeight){
            height = this.minHeight;
        }else if(this.maxHeight !== null && this.maxHeight <= innerHeight){
            height = this.maxHeight;
        }else{
            height = innerHeight;
        }


        this.width = width;
        this.height = height;

    },

    windowResize: function() {

        //Set the width and height of the game
        this.setSize();

        this.game.renderer.resize(this.width, this.height);

    }

};

//Export the Browserify module
module.exports = SizeManager;
