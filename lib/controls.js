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

            //Left arrow - A
            case 37: case 65:

                //Left key
                this.left = true;
                break;

            //Up arrow - W
            case 38: case 87:

                //Up key
                this.up = true;
                break;

            //Right arrow - D
            case 39: case 68:

                //Right key
                this.right = true;
                break;

            //Down arrow - S
            case 40: case 83:

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

            //Left arrow - A
            case 37: case 65:

                //Left key
                this.left = false;
                break;

            //Up arrow - W
            case 38: case 87:

                //Up key
                this.up = false;
                break;

            //Right arrow - D
            case 39: case 68:

                //Right key
                this.right = false;
                break;

            //Down arrow - S
            case 40: case 83:

                //Down key
                this.down = false;
                break;

        }

    }

};