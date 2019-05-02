/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function(chess) {

	chess.RandomAgent = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var agentColor = null;
		var roundIndex = null;

		var callbackSelection = null;
		var callbackMovement  = null;

		var movement = null;

		/*** Private methods ***/

		function getAvailablePiecesPositions(pieces, color) {

			let availablePieces = chess.simulator.allAvailablePiecesPositions(pieces, agentColor);

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

		function chooseAMove(availablePieces, availablePiecesMovements) {

			let totalAllowedMovements = 0;
			for (let i=0, nb=availablePieces.length; i<nb; i++) {
				totalAllowedMovements += availablePiecesMovements[i].length;
			}

			let number = chess.utils.getRandomInt(0, totalAllowedMovements);

			return number;
		}

		function applyMovement(availablePieces, availablePiecesMovements, number) {

			let count  = 0;

			chooseMovement:
			for (let i=0, nbPieces=availablePieces.length; i<nbPieces; i++) {
				for (let y=0, nbMovements=availablePiecesMovements[i].length; y<nbMovements; y++) {

					if (number === count) {
						movement = availablePiecesMovements[i][y];
						callbackSelection(availablePieces[i]);
						break chooseMovement;
					}
					count++;
				}
			}
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

				let availablePieces           = getAvailablePiecesPositions(pieces, agentColor);
				let availablePiecesMovements  = getAvailablePiecesMovements(pieces, roundIndex, availablePieces);

				//	Choose of a move
				let number = chooseAMove(availablePieces, availablePiecesMovements);

				applyMovement(availablePieces, availablePiecesMovements, number);
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
