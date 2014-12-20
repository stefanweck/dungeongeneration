//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Event = require('../../input/event.js');

/**
 * CanPickUp Component constructor
 *
 * @class CanPickUp
 * @classdesc An component that tells the system that this entity can be picked up!
 *
 * @property {Game} game - Reference to the current game object
 * @property {Array} canPickUpTypes - Array of entity types that can pick up this item
 */
var CanPickUp = function (game, canPickUpTypes) {

    /**
     * @property {String} name - The name of this system. This field is always required!
     */
    this.name = 'canPickUp';

    /**
     * @property {Game} game - Reference to the current game object
     */
    this.game = game;

    /**
     * @property {Array} canPickUpTypes - Array of entity types that can pick up this item
     */
    this.canPickUpTypes = canPickUpTypes;

    /**
     * @property {Event} events - Event holder
     */
    this.events = new Event();

    //Initialize the component
    this.initialize();

};

CanPickUp.prototype = {

    /**
     * The 'constructor' for this component
     * Adds the bump into function to the event list
     * @protected
     */
    initialize: function () {

        //Attach the bumpInto function to the bumpInto event
        this.events.on('bumpInto', this.bumpInto, this);

    },

    /**
     * Function to perform when something collides with this entity
     * @protected
     *
     * @param {Entity} entity - The entity being checked
     * @param {Entity} collisionEntity - The entity being checked that is bumping into this entity
     */
    bumpInto: function (entity, collisionEntity) {

        //Check if the entity can pick up the entity that has this component
        if(this.canEntityPickUp(entity) && entity.hasComponent('inventory')){
            console.log('pickup!');
        }

    },

    /**
     * Function to determine if an entity can be attacked by this entity
     * @protected
     *
     * @param {Entity} entity - The entity being checked
     */
    canEntityPickUp: function (entity) {

        //An empty array of attack types means any entity type may be attacked
        if (this.canPickUpTypes.length === 0) {
            return true;
        }

        //Otherwise check for the entity type
        if (this.canPickUpTypes.indexOf(entity.type) >= 0) {
            return true;
        }

        return false;
    }

};

//Export the Browserify module
module.exports = CanPickUp;