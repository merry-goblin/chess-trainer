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

			let initialState = 'gameReady';
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

			events = new Array();

			//	Those events are informative and will not stop the process
			let stateNames = stateMachine.getStateNames();
			for (stateName of stateNames) {
				events[stateName] = new Array();
				events[stateName]['before'] = new Array();
				events[stateName]['after'] = new Array();
			}

			//	Those events can be blocked by the callback
			let transitionNames = stateMachine.getTransitionNames();
			for (transitionName of transitionNames) {
				if (events[transitionName] == null) {
					events[transitionName] = new Array();
				}
				events[transitionName]['on'] = new Array();
			}
		}

		function registerOnStateEvent(event, state, callback) {

			events[state][event].push(callback);
		}

		function dispatchStateEvent(event, state, parameters) {

			for (let callback of events[state][event]) {
				callback(parameters);
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

				if ((state = stateMachine.isTransitionValid(transition)) != null) {

					//	Before
					dispatchStateEvent('before', state);

					stateMachine.applyTransition(transition);

					//	After
					dispatchStateEvent('after', state);
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
