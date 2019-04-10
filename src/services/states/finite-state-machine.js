/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function($, chess) {

	chess.FiniteStateMachine = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var initialState = 'game-ready';
		var currentState = null;
		var transitions = {
			startGame:  { from: 'game-ready',          to: 'agent-initialized'  },
			startRound: { from: 'agent-initialized',   to: 'wait-selection'     },
			selection:  { from: 'wait-selection',      to: 'wait-movement'      },
			movement:   { from: 'wait-movement',       to: 'agent-desactivated' },
			endRound:   { from: 'agent-desactivated',  to: 'agent-initialized'  },
			endGame:    { from: 'agent-desactivated',  to: 'game-over'          }
		};

		/*** Private methods ***/

		function getNextState($transitionName) {

			let nextState = null;
			if (transitions[$transitionName] != null) {
				let transition = transitions[$transitionName];
				if (currentState == transition.from) {
					nextState = transition.to;
				}
			}

			return nextState;
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			
		}

		var scope = {

			/*** Public methods ***/

			init: function() {

				currentState = initialState;
			},

			getCurrentState: function() {

				return currentState;
			},

			applyTransition: function($transitionName) {

				let state = getNextState($transitionName);

				if (state != null) {
					currentState = state;
					return true;
				}
				else {
					return false;
				}
			},

			isTransitionValid: function($transitionName) {

				let state = getNextState($transitionName);

				return (state != null) ? true : false;
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

})(jQuery, Chess);
