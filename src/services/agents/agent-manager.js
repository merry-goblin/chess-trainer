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

		var playerRound = null;

		/*** Private methods ***/

		function registerOnEvents() {

			let stateManager = controller.getStateManager();
			stateManager.register('before', 'agentActivated', self.beforeAgentInitialized);
			stateManager.register('after', 'waitSelection', self.afterWaitSelection);
			stateManager.register('after', 'waitMovement', self.afterWaitMovement);

			whiteAgent.setFunctionToTriggerEvents(self.agentSelection, self.agentMovement);
			blackAgent.setFunctionToTriggerEvents(self.agentSelection, self.agentMovement);
		}

		function activateAgent() {

			let roundIndex = controller.getRuleManager().getRoundIndex();

			if (playerRound == 'w') {
				currentAgent = whiteAgent;
				whiteAgent.activate(roundIndex);
			}
			else {
				currentAgent = blackAgent;
				blackAgent.activate(roundIndex);
			}
		}

		/**
		 * Allowed if case isn't empty 
		 * and piece belongs to the player
		 *
		 * @param  {x,y} pos
		 * @return null
		 */
		function triggerSelectionClick(pos) {

			let pieces = controller.pieces;
			let piece  = pieces[pos.y][pos.x];

			if (piece != null && piece.color === playerRound) {
				currentAgent.pieceSelection(pos);
			}
		}

		/**
		 * Allowed if case is empty
		 * or piece belongs to the other player
		 *
		 * @param  {x,y} pos
		 * @return null
		 */
		function triggerMovementClick(pos) {

			//	la case est vide ou contient une piece ennemie
			let pieces = controller.pieces;
			let piece  = pieces[pos.y][pos.x];

			if (piece == null || piece.color !== playerRound) {
				currentAgent.caseMovement(pos);
			}
			else {
				//	Cancel selection
				controller.getStateManager().trigger('cancelSelection');
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
				whiteAgent.init('w');
				blackAgent.init('b');
			},

			initEventRegistering: function() {

				registerOnEvents();
			},

			/**
			 * Called by state manager
			 * @return null
			 */
			beforeAgentInitialized: function() {

				if (playerRound == null) {
					playerRound = 'w';
				}
				else {
					playerRound = (playerRound == 'w') ? 'b' : 'w';
				}
				activateAgent();
			},

			/**
			 * Called by state manager
			 * @return null
			 */
			afterWaitSelection: function() {

				currentAgent.playSelection(controller.pieces);
			},

			/**
			 * Called by state manager
			 * @return null
			 */
			afterWaitMovement: function() {

				currentAgent.playMovement(controller.pieces);
			},

			triggerClick: function(position) {

				if (controller.getStateManager().is('waitSelection')) {
					triggerSelectionClick(position);
				}
				else if (controller.getStateManager().is('waitMovement')) {
					triggerMovementClick(position);
				}
			},

			/**
			 * Called by an agent
			 * @param  object position
			 * @return null
			 */
			agentSelection: function(position) {

				controller.getStateManager().trigger('selection', {selection: position});
			},

			/**
			 * Called by an agent
			 * @param  object position
			 * @return null
			 */
			agentMovement: function(position) {

				controller.getStateManager().trigger('movement', {movement: position});
			},

			getPlayerColor: function() {

				return playerRound;
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
