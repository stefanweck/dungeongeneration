/*
* Key constructor
* 
* @class Roguelike.Key
* @classdesc An object that handles a single key on a keyboard
*
* @property {Roguelike.Game} game - Reference to the current game object
*/
Roguelike.Key = function(game){

    /*
    * @property {Roguelike.Game} game - Reference to the current game object
    */
    this.game = game;

    /*
    * @property {object} keys - Object that holds all keys
    */
    this.keys = {};

};

Roguelike.Key.prototype = {

    /*
    * Function to add a new key to the keyboard
    * @protected
    *
    * @param {int} keycode - The keycode of the key being added
    */
    addKey: function(keycode){

        //Add a brand new key to the keyboards key list
        this.keys[keycode] = new Roguelike.Key(keycode);

    }

};