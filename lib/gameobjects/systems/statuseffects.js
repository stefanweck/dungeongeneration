//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Status Effects System constructor
 *
 * @class StatusEffectsSystem
 * @classdesc The Status Effects System handles adding and removing status effects on entities with the Status Effect Component
 *
 * @param {Game} game - Reference to the currently running game
 */
var StatusEffectsSystem = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

};

StatusEffectsSystem.prototype = {

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @public
	 *
	 * @param {Entity} entity - The entity that is being processed by this system
	 */
	handleSingleEntity: function(entity) {

		//Get the components from the current entity and store them temporarily in a variable
		var statusEffectComponent = entity.getComponent("statusEffectComponent");

		//Check if there should be status effects applied
		if(statusEffectComponent.statusEffects.length > 0){

			//Loop through all status effects
			for(var i = 0; i < statusEffectComponent.statusEffects.length; i++){

				//Apply the current status effect to this entity
				statusEffectComponent.statusEffects[i].update(entity);

			}

		}

	},

	/**
	 * Function to return every status effect currently on an entity
	 * @protected
	 *
	 * @param {Entity} entity - The entity that is being processed by this system
	 *
	 * @return {Array} An array filled with every status effect
	 */
	getStatusEffects: function(entity){

		//Get the components from the current entity and store them temporarily in a variable
		var statusEffectComponent = entity.getComponent("statusEffectComponent");

		//Return the array with all status effects for this entity
		return statusEffectComponent.statusEffects;

	},

	/**
	 * Function to add a new status effect to this entity
	 * @protected
	 *
	 * @param {Entity} entity - The entity that needs a new status effect
	 * @param {Object} statusEffect - The status effect that is being added
	 */
	addStatusEffect: function(entity, statusEffect){

		//Get the components from the current entity and store them temporarily in a variable
		var statusEffectComponent = entity.getComponent("statusEffectComponent");

		//We start with the assumption that there isn't a similar status effect
		var index = -1;

		//Loop through each status effect on this entity
		for(var i = 0; i < statusEffectComponent.statusEffects.length; i++){

			//If the name of this status effect matches the name of the effect being added
			if(statusEffectComponent.statusEffects[i].name === statusEffect.name){

				//We have found our existing and duplicate status effect
				index = i;

				//Stop here because we aren't going to find more
				break;

			}

		}

		//If the status effect haas been found, we try to stack it
		if(index !== -1){

			//If we can stack the status effect
			if(statusEffect.stackable === true){

				//If the status effect should add it's turns left to the existing status effect or
				//if it should reset the status effect back to it's original turns left
				if(statusEffect.addStack === true){

					//Add all new turns left to the existing status effect
					statusEffectComponent.statusEffects[index].turnsLeft += statusEffect.turnsLeft;

				}else{

					//Reset the turns left of the existing status effect to the default turns left provided by the new status effect
					statusEffectComponent.statusEffects[index].turnsLeft = statusEffect.turnsLeft;

				}

			}

		}else{

			//Add the status effect to the status effects array
			statusEffectComponent.statusEffects.push(statusEffect);

		}


	},

	/**
	 * Function to remove a status effect from this entity
	 * @protected
	 *
	 * @param {Entity} entity - The entity that needs a status effect to be removed
	 * @param {Object} statusEffect - The status effect that is being removed
	 *
	 * @return {Boolean} Returns true when the status effect is removed, returns false when not
	 */
	removeStatusEffect: function(entity, statusEffect){

		//Get the components from the current entity and store them temporarily in a variable
		var statusEffectComponent = entity.getComponent("statusEffectComponent");

		//Try to find the element in the effects array
		var index = statusEffectComponent.statusEffects.indexOf(statusEffect);

		//If the status effect isn't found, exit as soon as possible
		if(index === -1) {
			return false;
		}

		//The status effect has been found
		statusEffectComponent.statusEffects.splice(index, 1);

		//We've made it all the way down here so the status effect is removed
		return true;

	}

};

//Export the Browserify module
module.exports = StatusEffectsSystem;

