/*
* Key constructor
* 
* @class Roguelike.Key
* @classdesc An object that handles a single key on a keyboard
*
* @param {int} keycode - The keycode of this specific key
*/
Roguelike.Key = function(keycode){

    /*
    * @property {int} keyCode - The keycode of this specific key
    */
    this.keyCode = keycode;

    /*
    * @property {bool} isDown - Boolean to see if the key is down
    */
    this.isDown = false;

    /*
    * @property {bool} isUp - Boolean to see if the key is up
    */
    this.isUp = false;

    /*
    * @property {int} lastUp - Timestamp of the last key release
    */
    this.lastUp = 0;

    /*
    * @property {Roguelike.Event} onDown - Event that handles onDown event
    */
    this.onDown = new Roguelike.Event();

    /*
    * @property {Roguelike.Event} onUp - Event that handles onUp event
    */
    this.onUp = new Roguelike.Event();

};

Roguelike.Key.prototype = {

    /*
    * Function that handles keydown events
    * @protected
    *
    * @param {Event Object} event - The event object
    */
    processKeyDown: function(event){

        

    }

};