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

		function hasRushed(piece, y1, y2) {

			let result = false;

			if (piece.type === 'p') {
				let factor  = (piece.color === 'b') ? 1 : -1;
				let y       = (y2 - y1) * factor;
				result      = (y == 2) ? true : false;
			}

			return result;
		}

		/**
		 * @param  {remove:[],move:[]}
		 * @return null
		 */
		function applyPiecesChanges(changes) {

			let pieces  = controller.pieces;

			for (let remove of changes.remove) {
				pieces[remove.y][remove.x] = null;
				controller.getGraphicManager().removePiece(remove.x, remove.y);
			}

			for (let move of changes.move) {
				let type = (move.type == null) ? null : move.type;
				pieces[move.y2][move.x2] = pieces[move.y1][move.x1];
				pieces[move.y1][move.x1] = null;
				pieces[move.y2][move.x2].last = roundIndex;
				if (!pieces[move.y2][move.x2].hasRushed) {
					pieces[move.y2][move.x2].hasRushed = hasRushed(pieces[move.y2][move.x2], move.y1, move.y2);
				}
				if (type != null) {
					pieces[move.y2][move.x2].type = type;
				}
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
