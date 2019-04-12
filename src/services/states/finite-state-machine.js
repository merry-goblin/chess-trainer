/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function(chess) {

	chess.FiniteStateMachine = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var initialState = null;
		var currentState = null;
		var transitions  = null;

		var stateNames       = null;
		var transitionNames  = null;

		/*** Private methods ***/

		function getNextState(transitionName) {

			let nextState = null;
			if (transitions[transitionName] != null) {
				let transition = transitions[transitionName];
				if (currentState == transition.from) {
					nextState = transition.to;
				}
			}

			return nextState;
		}

		function prepareStateNames() {

			stateNames = new Array();
			for (let transitionName in transitions) {
				addState(transitions[transitionName].from);
				addState(transitions[transitionName].to);
			}
		}

		function prepareTransitionNames() {

			transitionNames = new Array();
			for (let transitionName in transitions) {
				transitionNames.push(transitionName);
			}
		}

		function addState(stateName) {

			if (stateNames.indexOf(stateName) == -1) {
				stateNames.push(stateName);
			}
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			settings         = null;
			initialState     = null;
			currentState     = null;
			transitions      = null;
			stateNames       = null;
			transitionNames  = null;
		}

		var scope = {

			/*** Public methods ***/

			init: function(initialStateParam, transitionsParam) {

				initialState = initialStateParam;
				currentState = initialStateParam;
				transitions  = transitionsParam;

				prepareStateNames();
				prepareTransitionNames();
			},

			getCurrentState: function() {

				return currentState;
			},

			isTransitionValid: function(transitionName) {

				let state = getNextState(transitionName);

				return state;
			},

			applyTransition: function(transitionName) {

				let state = getNextState(transitionName);

				if (state != null) {
					currentState = state;
					return true;
				}
				else {
					return false;
				}
			},

			getStateNames: function() {

				return stateNames;
			},

			getTransitionNames: function() {

				return transitionNames;
			},

			/**
			 * Use this when Destroying this object in order to prevent for memory leak
			 * @return null
			 */
			destruct: function() {

				cleanMemory();
			}
		}
		return scope;
	}

})(Chess);
