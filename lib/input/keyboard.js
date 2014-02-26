/*
* Keyboard constructor
* 
* @class Roguelike.Keyboard
* @classdesc An object that handles a single key on a keyboard
*
* @property {Roguelike.Game} game - Reference to the current game object
*/
Roguelike.Keyboard = function(game){

    /*
    * @property {Roguelike.Game} game - Reference to the current game object
    */
    this.game = game;

    /*
    * @property {object} keys - Object that holds all keys
    */
    this.keys = {};

};

Roguelike.Keyboard.prototype = {

    /*
    * Function to initialize the keyboard and therefore user input
    * @protected
    */
    initialize: function(){

        //Set the scope of this to _this
        var _this = this;

        //The onKeyDown event of the document is the following function:
        this._onKeyDown = function (event) {
            return _this.processKeyDown(event);
        };

        window.addEventListener('keydown', this._onKeyDown, false);

    },

    /*
    * Function to add a new key to the keyboard
    * @protected
    *
    * @param {int} keycode - The keycode of the key being added
    */
    addKey: function(keycode){

        //Add a brand new key to the keyboards key list
        this.keys[keycode] = new Roguelike.Key(keycode);

    },

    /*
    * Function that handles keydown events
    * @protected
    *
    * @param {Event Object} event - The event object
    */
    processKeyDown: function(event){

        //Only continue if the key being pressed is assigned to the keyboard
        if(this.keys[event.keyCode] !== undefined){

            //Prevent the default action of the key
            event.preventDefault();

            //Call the callback's defined on this key
            this.keys[event.keyCode].processKeyDown(event);

        }

    }

};