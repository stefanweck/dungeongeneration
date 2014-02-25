/*
* Event constructor
* 
* @class Roguelike.Event
* @classdesc An object that can announce and listen for events
*
*/
Roguelike.Event = function(){

    /*
    * @property {object} events - An object with all the current events
    */
    this.events = {};

};

Roguelike.Event.prototype = {

    /*
    * Function that handles keydown events
    * @protected
    *
    * @param {Event Object} event - The event object
    * @param {Event Object} callback - The function that has to be performed as a callback
    */
    on: function(event, callback){

        //If this.events doesn't have the event property, create an empty array
        if(!this.events.hasOwnProperty(event)){
            this.events[event] = [];
        }

        //Insert the callback into the current event
        this.events[event].push(callback);

    },

    /*
    * Function that is called when an event is triggered
    * @protected
    *
    * @param {Event Object} event - The event object
    */
    trigger: function(event){

        //Get all the callbacks for the current event
        var callbacks = this.events[event];

        //Loop through the callbacks and run each callback
        for(var i = 0; i < callbacks.length; i++){
            //Run the current callback
            callbacks[i]();
        }

    }

};