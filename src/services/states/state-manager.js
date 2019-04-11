/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function($, chess) {

	chess.StateManager = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var controller   = null;
		var stateMachine = null;

		var events = null;

		/*** Private methods ***/

		function buildStateMachine() {

			let initialState = 'game-ready';
			let transitions = {
				startGame:  { from: 'gameReady',          to: 'agentInitialized'  },
				startRound: { from: 'agentInitialized',   to: 'waitSelection'     },
				selection:  { from: 'waitSelection',      to: 'waitMovement'      },
				movement:   { from: 'waitMovement',       to: 'agentDesactivated' },
				endRound:   { from: 'agentDesactivated',  to: 'agentInitialized'  },
				endGame:    { from: 'agentDesactivated',  to: 'gameOver'          }
			};

			stateMachine = new chess.FiniteStateMachine();
			stateMachine.init(initialState, transitions);

			prepareEvents();
		}

		function prepareEvents() {

			events = array();

			//	Those events are informative and will not stop the process
			let stateNames = stateMachine.getStateNames();
			for (stateName in stateNames) {
				events[stateName] = new Array();
				events[stateName]['before'] = new Array();
				events[stateName]['after'] = new Array();
			}

			//	Those events can be blocked by the callback
			let transitionNames = stateMachine.getTransitionNames();
			for (transitionName in transitionNames) {
				events[transitionName] = new Array();
				events[transitionName]['on'] = new Array();
			}
		}

		function registerOnStateEvent(event, state, callback) {

			if (events[state] == null) {
				events[state] = new Array();
			}
			if (events[state][event] == null) {
				events[state][event] = new Array();
			}
			events[state][event].push(callback);
		}

		function dispatchStateEvent(event, state) {

			if (events[state] != null && events[state][event] != null) {
				
			}
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			
		}

		var scope = {

			/*** Public methods ***/

			init: function(controllerParam) {

				controller = controllerParam;

				buildStateMachine();
			},

			register: function(event, state, callback) {

				registerOnStateEvent(event, state, callback);
			},

			trigger: function(transition) {

				if (stateMachine.isTransitionValid(transition)) {

					//	Before
					let

					if (stateMachine.applyTransition(transition)) {

						dispatch
					}
				}

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
