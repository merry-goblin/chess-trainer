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

		var selection = null;
		var movement  = null;

		/*** Private methods ***/

		function registerOnEvents() {

			let stateManager = controller.getStateManager();
			stateManager.register('on', 'selection', self.onSelection);
			stateManager.register('on', 'movement', self.onMovement);
			stateManager.register('after', 'agentDesactivated', self.afterAgentDesactivated);
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

				registerOnEvents();
			},

			onSelection: function(parameters) {

				selection = parameters.selection;
				movement  = null;
				return true;
			},

			onMovement: function(parameters) {

				movement  = parameters.movement;
				let pieces  = controller.pieces;
				let result  = chess.rules.movePiece(pieces, selection, movement);

				if (result.isAllowed) {
					applyPiecesChanges(result);
				}
				else {
					//	Cancel selection
					controller.getStateManager().trigger('cancelSelection');
				}

				return result.isAllowed;
			},

			onMovementOld: function(parameters) {

				let isAllowed = false;
				let isBasicMovementAllowed = false;

				let changes   = {
					move: new Array(),
					remove: new Array()
				};

				movement  = parameters.movement;
				let pieces          = controller.pieces;
				let pieceSelection  = pieces[selection.y][selection.x];
				let pieceMovement   = pieces[movement.y][movement.x];

				//	Basic movement
				if (chess.rules.doesBasicPieceMovementIsAllowed(pieceSelection, selection, movement)) {

					if (pieceMovement === null) {
						// Basic movement without piece taken
						isAllowed = true;
						let move = { x1: selection.x, y1: selection.y, x2: movement.x, y2: movement.y };
						if (pieceSelection.type === 'p' && chess.rules.doesPawnReachedTheBorder(pieceSelection, movement)) {
							move['type'] = 'q';
						}
						changes.move.push(move);
					}
					else if (pieceMovement.color !== pieceSelection.color && pieceSelection.type !== 'p') {
						// Basic movement with a piece taken. Doesn't handle pawns
						isAllowed = true;
						changes.remove.push({ x: movement.x, y: movement.y });
						changes.move.push({ x1: selection.x, y1: selection.y, x2: movement.x, y2: movement.y });
					}
				}
				else {

					//	Specific movements
					if (pieceSelection.type === 'p') {
						let pieceToTake = null;
						let move = null;
						if (chess.rules.doesPawnTakesAPiece(pieceSelection, pieceMovement, selection, movement)) {
							isAllowed = true;
							changes.remove.push({ x: movement.x, y: movement.y });
							move = { x1: selection.x, y1: selection.y, x2: movement.x, y2: movement.y };
						}
						else {
							pieceToTake = chess.rules.doesPawnTakesAPieceWithEnPassant(pieces, pieceSelection, pieceMovement, selection, movement);
							if (pieceToTake !== false) {
								isAllowed = true;
								changes.remove.push({ x: pieceToTake.x, y: pieceToTake.y });
								move = { x1: selection.x, y1: selection.y, x2: movement.x, y2: movement.y };
							}
						}
						if (move !== null) {
							if (chess.rules.doesPawnReachedTheBorder(pieceSelection, movement)) {
								move.type = 'q';
							}
							changes.move.push(move);
						}
					}
					/*else if (pieceSelection[1] === 'k') {

					}*/
				}

				if (isAllowed) {
					applyPiecesChanges(changes);
				}
				else {
					//	Cancel selection
					controller.getStateManager().trigger('cancelSelection');
				}

				return isAllowed;
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
