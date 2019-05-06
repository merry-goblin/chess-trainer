/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function(chess) {

	chess.MinMaxAgent = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({
			depth: 2
		}, settings);

		var agentColor = null;
		var roundIndex = null;

		var callbackSelection = null;
		var callbackMovement  = null;

		var movement = null;

		//	Evaluation
		var piecesCost = {
			k: 1000, // Checkmate
			q: 25,
			r: 18,
			b: 18,
			n: 18,
			p: 5
		};
		var checkCost = 2;
		var drawsCost = -2;

		/*** Private methods ***/

		function evaluate(pieces, changes, factor) {

			let value = 0;
			let piece = null;

			for (let remove of changes.remove) {
				piece = pieces[remove.y][remove.x];
				value += piecesCost[piece.type] * factor;
			}

			if (changes.opponentIsInCheck) {
				value += checkCost * factor;
			}
			if (changes.draws) {
				value += drawsCost * factor;
			}
			if (changes.opponentIsInCheckmate) {
				value += piecesCost.k * factor;
			}

			value += chess.utils.getRandomInt(-3, 3);

			return value;
		}

		function evaluateMax(pieces, changes) {

			return evaluate(pieces, changes, 1);
		}

		function evaluateMin(pieces, changes) {

			return evaluate(pieces, changes, -1);
		}

		function max(pieces, depth, color, round) {

			let move = {
				origin: null,
				dest:   null
			};
			let maxValue = Number.NEGATIVE_INFINITY;

			let verifyCheck  = true;
			let nextColor    = chess.utils.switchColor(color);
			let nextRound    = round+1;
			let nextDepth    = depth-1;

			let availablePieces           = getAvailablePiecesPositions(pieces, color);
			let availablePiecesMovements  = getAvailablePiecesMovements(pieces, round, availablePieces);

			let count = 0;
			for (let p=0, nbPieces=availablePieces.length; p<nbPieces; p++) {
				let origin = availablePieces[p];
				for (let m=0, nbMovements=availablePiecesMovements[p].length; m<nbMovements; m++) {

					//	Simulation of the current possible move
					let dest     = availablePiecesMovements[p][m];
					let changes  = chess.rules.movePiece(pieces, origin, dest, roundIndex, verifyCheck);
					if (changes.isAllowed) {

						let value = evaluateMax(pieces, changes);

						if (depth > 0 && changes.opponentIsInCheckmate === false && changes.draws === false) {

							//	Building of a new chessboard according to the current move
							let nextPieces = chess.utils.copyArray(pieces);
							chess.simulator.applyChanges(nextPieces, round, changes);

							//	Calculation of move value
							let result = min(nextPieces, nextDepth, nextColor, nextRound, count);
							value     += result.value;
						}

						if (value > maxValue) {
							maxValue    = value;
							move.origin = origin;
							move.dest   = dest;
						}
					}
					count++;
				}
			}

			return {
				value: maxValue,
				move:  move
			};
		}

		function min(pieces, depth, color, round) {

			let move      = {
				origin: null,
				dest:   null
			};
			let minValue = Number.POSITIVE_INFINITY;

			let verifyCheck  = true;
			let nextColor  = chess.utils.switchColor(color);
			let nextRound  = round+1;
			let nextDepth  = depth-1;

			let availablePieces           = getAvailablePiecesPositions(pieces, color);
			let availablePiecesMovements  = getAvailablePiecesMovements(pieces, round, availablePieces);

			let count = 0;
			for (let p=0, nbPieces=availablePieces.length; p<nbPieces; p++) {
				let origin = availablePieces[p];
				for (let m=0, nbMovements=availablePiecesMovements[p].length; m<nbMovements; m++) {

					//	Simulation of the current possible move
					let dest     = availablePiecesMovements[p][m];
					let changes  = chess.rules.movePiece(pieces, origin, dest, roundIndex, verifyCheck);
					if (changes.isAllowed) {

						let value = evaluateMin(pieces, changes);
						if (depth > 0 && changes.opponentIsInCheckmate === false && changes.draws === false) {

							//	Building of a new chessboard according to the current move
							let nextPieces = chess.utils.copyArray(pieces);
							chess.simulator.applyChanges(nextPieces, round, changes);

							//	Calculation of move value
							let result = max(nextPieces, nextDepth, nextColor, nextRound);
							value     += result.value;
						}

						if (value < minValue) {
							minValue    = value;
							move.origin = origin;
							move.dest   = dest;
						}
					}
					count++;
				}
			}

			return {
				value: minValue,
				move:  move
			};
		}

		function getAvailablePiecesPositions(pieces, color) {

			let availablePieces = chess.simulator.allAvailablePiecesPositions(pieces, color);

			return availablePieces;
		}

		function getAvailablePiecesMovements(pieces, round, availablePieces) {

			let availablePiecesMovements = new Array();
			for (let i=0, nb=availablePieces.length; i<nb; i++) {

				let availablePieceMovement = chess.simulator.allPieceMoves(pieces, availablePieces[i], round);
				availablePiecesMovements.push(availablePieceMovement);
			}

			return availablePiecesMovements;
		}

		function applyMovement(origin, dest) {

			movement = dest;
			callbackSelection(origin);
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			settings          = null;
			callbackSelection = null;
			callbackMovement  = null;
		}

		var scope = {

			/*** Public methods ***/

			init: function(colorParam) {

				agentColor = colorParam;
			},

			activate: function(roundIndexParam) {

				roundIndex = roundIndexParam;
			},

			desactivate: function() {

			},

			//	AI only
			playSelection: function(pieces) {

				let startTime = new Date().getTime();
				let elapsedTime = 0;

				//	Choose of a move
				let result = max(pieces, settings.depth, agentColor, roundIndex);

				elapsedTime = new Date().getTime() - startTime;
				console.log((elapsedTime/1000)+" secondes");

				window.setTimeout(function() {
					applyMovement(result.move.origin, result.move.dest);
				}, 100);
			},

			//	AI only
			playMovement: function(pieces) {

				callbackMovement(movement);
			},

			setFunctionToTriggerEvents: function(callbackSelectionParam, callbackMovementParam) {

				callbackSelection = callbackSelectionParam;
				callbackMovement  = callbackMovementParam;
			},

			//	Human only
			pieceSelection: function(position) {},

			//	Human only
			caseMovement: function(position) {},

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
