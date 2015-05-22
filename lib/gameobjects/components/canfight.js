//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Event = require('../../input/event.js');

/**
 * CanFight Component constructor
 *
 * @class CanFight
 * @classdesc An component that tells the system that this entity can fight!
 *
 * @property {Game} game - Reference to the current game object
 * @property {Array} canAttackTypes - Array of entity types that can be attacked
 */
var CanFight = function (game, canAttackTypes) {

    /**
     * @property {String} name - The name of this system. This field is always required!
     */
    this.name = 'canFight';

    /**
     * @property {Game} game - Reference to the current game object
     */
    this.game = game;

    /**
     * @property {Array} canAttackTypes - Array of entity types that can be attacked
     */
    this.canAttackTypes = canAttackTypes;

    /**
     * @property {Event} events - Event holder
     */
    this.events = new Event();

    //Initialize the component
    this.initialize();

};

CanFight.prototype = {

    /**
     * The 'constructor' for this component
     * Adds the bump into function to the event list
     * @private
     */
    initialize: function () {

        //Attach the bumpInto function to the bumpInto event
        this.events.on('bumpInto', this.bumpInto, this);

    },

    /**
     * Function to perform when something collides with this entity
     * @public
     *
     * @param {Entity} entity - The entity being checked
     * @param {Entity} collisionEntity - The entity being checked that is bumping into this entity
     */
    bumpInto: function (entity, collisionEntity) {

        if (this.canAttackEntity(entity)) {

            //The combat system will handle the combat!
            this.game.staticSystems.combatSystem.handleSingleEntity(entity, collisionEntity);

        }

    },

    /**
     * Function to determine if an entity can be attacked by this entity
     * @protected
     *
     * @param {Entity} entity - The entity being checked
     */
    canAttackEntity: function (entity) {

        //An empty array of attack types means any entity type may be attacked
        if (this.canAttackTypes.length === 0) {
            return true;
        }

        //Otherwise check for the entity type
        if (this.canAttackTypes.indexOf(entity.type) !== -1) {
            return true;
        }

        return false;
    }

};

//Export the Browserify module
module.exports = CanFight;
