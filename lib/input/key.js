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
    * @property {int} lastDown - Timestamp of the last key press
    */
    this.lastDown = 0;

    /*
    * @property {int} lastUp - Timestamp of the last key release
    */
    this.lastUp = 0;

    /*
    * @property {int} delay - Delay between two events on keydown
    */
    this.delay = 150;

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


        //If the key is allready down, the user is holding it
        if(this.isDown){

            //Check if the onDown event should be triggered again
            if(event.timeStamp > this.lastDown + this.delay){
                this.onDown.trigger(this.keyCode);
                this.lastDown = event.timeStamp;
            }

        }else{

            //Update this keys properties
            this.isDown = true;
            this.isUp = false;
            this.lastDown = event.timeStamp;

            //Trigger the event with this keycode
            this.onDown.trigger(this.keyCode);

        }

    },

    /*
    * Function that handles keyup events
    * @protected
    *
    * @param {Event Object} event - The event object
    */
    processKeyUp: function(event){

        //Update this keys properties
        this.isDown = false;
        this.isUp = true;
        this.lastUp = event.timeStamp;

        //Trigger the event with this keycode
        this.onUp.trigger(this.keyCode);

    }

};