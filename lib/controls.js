/*
* Controls constructor
* 
* @class Roguelike.Controls
* @classdesc The object that handles user input
*
*/
Roguelike.Controls = function(){

    /*
    * @property {bool} left - The left key on the keyboard, pressed or not
    */
    this.left = false;

    /*
    * @property {bool} right - The right key on the keyboard, pressed or not
    */
    this.right = false;

    /*
    * @property {bool} up - The up key on the keyboard, pressed or not
    */
    this.up = false;

    /*
    * @property {bool} down - The down key on the keyboard, pressed or not
    */
    this.down = false;

};

Roguelike.Controls.prototype = {

    /*
    * Function that handles keydown events
    * @protected
    *
    * @param {Event Object} e - The event object from the keypress
    */
    keyDown: function(e){

        switch(e.keyCode){

            case 37:

                //Left key
                this.left = true;
                break;

            case 38:

                //Up key
                this.up = true;
                break;

            case 39:

                //Right key
                this.right = true;
                break;

            case 40:

                //Down key
                this.down = true;
                break;

        }

    },

    /*
    * Function that handles keyup events
    * @protected
    *
    * @param {Event Object} e - The event object from the keypress
    */
    keyUp: function(e){

        switch(e.keyCode){

            case 37:

                //Left key
                this.left = false;
                break;

            case 38:

                //Up key
                this.up = false;
                break;

            case 39:

                //Right key
                this.right = false;
                break;

            case 40:

                //Down key
                this.down = false;
                break;

        }

    }

};