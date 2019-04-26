/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function(chess) {

	chess.RuleManager = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var self = null;

		var controller = null;

		var selection  = null;
		var movement   = null;
		var roundIndex = 0;
		var gameIsOver = false;

		/*** Private methods ***/

		function registerOnEvents() {

			let stateManager = controller.getStateManager();
			stateManager.register('on', 'selection', self.onSelection);
			stateManager.register('on', 'movement', self.onMovement);
			stateManager.register('after', 'agentDesactivated', self.afterAgentDesactivated);
			stateManager.register('before', 'agentActivated', self.beforeAgentActivated);
		}

		/**
		 * @param  {remove:[],move:[]}
		 * @return null
		 */
		function applyPiecesChanges(changes) {

			chess.simulator.applyChanges(controller.pieces, roundIndex, changes);

			controller.getGraphicManager().applyChanges(changes);

			if (changes.opponentIsInCheckmate || changes.draws) {
				gameIsOver = true;
			}
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			settings      = null;
			controller    = null;
			self          = null;
		}

		var scope = {

			/*** Public methods ***/

			init: function(controllerParam) {

				self = this;

				controller = controllerParam;
			},

			initEventRegistering: function() {

				registerOnEvents();
			},

			getRoundIndex: function() {

				return roundIndex;
			},

			onSelection: function(parameters) {

				selection = parameters.selection;
				movement  = null;
				return true;
			},

			onMovement: function(parameters) {

				movement  = parameters.movement;
				let pieces  = controller.pieces;
				let result  = chess.rules.movePiece(pieces, selection, movement, roundIndex, true);

				if (result.isAllowed) {
					applyPiecesChanges(result);
				}
				else {
					//	Cancel selection
					controller.getStateManager().trigger('cancelSelection');
				}

				return result.isAllowed;
			},

			beforeAgentActivated: function() {

				roundIndex++;
			},

			afterAgentDesactivated: function() {

				if (gameIsOver) {
					controller.getStateManager().trigger('endGame');
				}
				else {
					controller.getStateManager().trigger('endRound');
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

})(Chess);
