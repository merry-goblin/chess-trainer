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

			let pieces = chess.simulator.applyChanges(controller.pieces, roundIndex, changes);

			for (let remove of changes.remove) {
				controller.getGraphicManager().removePiece(remove.x, remove.y);
			}

			for (let move of changes.move) {
				let type = (move.type == null) ? null : move.type;
				controller.getGraphicManager().movePiece(move.x1, move.y1, move.x2, move.y2, type);
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
				let result  = chess.rules.movePiece(pieces, selection, movement, roundIndex);

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

				//	Todo : check if game is over

				controller.getStateManager().trigger('endRound');
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
