/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function(chess) {

	chess.AgentManager = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var self = null;

		var controller   = null;
		var whiteAgent   = null;
		var blackAgent   = null;
		var currentAgent = null;

		playerRound = null;

		/*** Private methods ***/

		function registerOnEvents() {

			let stateManager = controller.getStateManager();
			stateManager.register('before', 'agentActivated', self.beforeAgentInitialized);
			stateManager.register('after', 'waitSelection', self.afterWaitSelection);

			whiteAgent.setFunctionToTriggerEvents(self.agentSelection, self.agentMovement);
			blackAgent.setFunctionToTriggerEvents(self.agentSelection, self.agentMovement);
		}

		function activateAgent() {

			if (playerRound == 'white') {
				currentAgent = whiteAgent;
				whiteAgent.activate();
			}
			else {
				currentAgent = blackAgent;
				blackAgent.activate();
			}
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			if (whiteAgent != null) {
				whiteAgent.destruct();
			}
			if (blackAgent != null) {
				blackAgent.destruct();
			}

			settings     = null;
			controller   = null;
			whiteAgent   = null;
			blackAgent   = null;
			currentAgent = null;
			playerRound  = null;
			self         = null;
		}

		var scope = {

			/*** Public methods ***/

			init: function(controllerParam, whiteAgentParam, blackAgentParam) {

				self = this;

				controller = controllerParam;
				whiteAgent = whiteAgentParam;
				blackAgent = blackAgentParam;

				registerOnEvents();
			},

			/**
			 * Called by state manager
			 * @return null
			 */
			beforeAgentInitialized: function() {

				if (playerRound == null) {
					playerRound = 'white';
				}
				else {
					playerRound = (playerRound == 'white') ? 'black' : 'white';
				}
				activateAgent();
			},

			/**
			 * Called by an agent
			 * @param  object position
			 * @return null
			 */
			afterWaitSelection: function() {

				
			},

			triggerClick: function(position) {

				//	todo : verify if a piece is on this case and
				//	       if this piece belongs to current agent
				
				currentAgent.pieceSelection(position);
			},

			/**
			 * Called by an agent
			 * @param  object position
			 * @return null
			 */
			agentSelection: function(position) {

				console.log(position);
				controller.getStateManager().trigger('selection');
			},

			/**
			 * Called by an agent
			 * @param  object position
			 * @return null
			 */
			agentMovement: function(position) {

				controller.getStateManger().trigger('movement');
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
