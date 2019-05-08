/**
 * @static
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.minMaxAlgorithm = (function(chess) {

	/*** Private static properties ***/

	//	Scoring
	var piecesCost = new Array(7);
	piecesCost[chess.types.null]   = 0;
	piecesCost[chess.types.king]   = 1000;
	piecesCost[chess.types.queen]  = 25;
	piecesCost[chess.types.rook]   = 18;
	piecesCost[chess.types.bishop] = 18;
	piecesCost[chess.types.knight] = 18;
	piecesCost[chess.types.pawn]   = 5;

	var checkCost = 2;
	var drawsCost = -2;

	/**
	 * @param  array[Chess.Piece] pieces
	 * @param  Chess.Change       changes
	 * @param  integer            factor
	 * @return integer
	 */
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

	/**
	 * @param  array[Chess.Piece] pieces
	 * @param  Chess.Change       changes
	 * @return integer
	 */
	function evaluateMax(pieces, changes) {

		return evaluate(pieces, changes, 1);
	}

	/**
	 * @param  array[Chess.Piece] pieces
	 * @param  Chess.Change       changes
	 * @return integer
	 */
	function evaluateMin(pieces, changes) {

		return evaluate(pieces, changes, -1);
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

	var scope = {

		maxIteration: function(pieces, depth, color, round, origin, dest) {

			let maxValue = Number.NEGATIVE_INFINITY;

			let verifyCheck  = true;
			let nextColor    = chess.utils.switchColor(color);
			let nextRound    = round+1;
			let nextDepth    = depth-1;

			let changes  = chess.rules.movePiece(pieces, origin, dest, round, verifyCheck);
			if (changes.isAllowed) {

				let value = evaluateMax(pieces, changes);

				if (depth > 0 && changes.opponentIsInCheckmate === false && changes.draws === false) {

					//	Building of a new chessboard according to the current move
					let nextPieces = chess.utils.copyArray(pieces);
					chess.simulator.applyChanges(nextPieces, round, changes);

					//	Calculation of move value
					let minValue = this.min(nextPieces, nextDepth, nextColor, nextRound);
					value       += minValue;
				}

				if (value > maxValue) {
					maxValue = value;
				}
			}

			return maxValue;
		},

		max: function(pieces, depth, color, round) {

			let maxValue = Number.NEGATIVE_INFINITY;

			let verifyCheck  = true;
			let nextColor    = chess.utils.switchColor(color);
			let nextRound    = round+1;
			let nextDepth    = depth-1;

			let availablePieces           = getAvailablePiecesPositions(pieces, color);
			let availablePiecesMovements  = getAvailablePiecesMovements(pieces, round, availablePieces);

			for (let p=0, nbPieces=availablePieces.length; p<nbPieces; p++) {
				let origin = availablePieces[p];
				for (let m=0, nbMovements=availablePiecesMovements[p].length; m<nbMovements; m++) {

					//	Simulation of the current possible move
					let dest     = availablePiecesMovements[p][m];
					let changes  = chess.rules.movePiece(pieces, origin, dest, round, verifyCheck);
					if (changes.isAllowed) {

						let value = evaluateMax(pieces, changes);

						if (depth > 0 && changes.opponentIsInCheckmate === false && changes.draws === false) {

							//	Building of a new chessboard according to the current move
							let nextPieces = chess.utils.copyArray(pieces);
							chess.simulator.applyChanges(nextPieces, round, changes);

							//	Calculation of move value
							let minValue = this.min(nextPieces, nextDepth, nextColor, nextRound);
							value       += minValue;
						}

						if (value > maxValue) {
							maxValue = value;
						}
					}
				}
			}

			return maxValue;
		},

		min: function(pieces, depth, color, round) {

			let minValue = Number.POSITIVE_INFINITY;

			let verifyCheck  = true;
			let nextColor  = chess.utils.switchColor(color);
			let nextRound  = round+1;
			let nextDepth  = depth-1;

			let availablePieces           = getAvailablePiecesPositions(pieces, color);
			let availablePiecesMovements  = getAvailablePiecesMovements(pieces, round, availablePieces);

			for (let p=0, nbPieces=availablePieces.length; p<nbPieces; p++) {
				let origin = availablePieces[p];
				for (let m=0, nbMovements=availablePiecesMovements[p].length; m<nbMovements; m++) {

					//	Simulation of the current possible move
					let dest     = availablePiecesMovements[p][m];
					let changes  = chess.rules.movePiece(pieces, origin, dest, round, verifyCheck);
					if (changes.isAllowed) {

						let value = evaluateMin(pieces, changes);
						if (depth > 0 && changes.opponentIsInCheckmate === false && changes.draws === false) {

							//	Building of a new chessboard according to the current move
							let nextPieces = chess.utils.copyArray(pieces);
							chess.simulator.applyChanges(nextPieces, round, changes);

							//	Calculation of move value
							let maxValue = this.max(nextPieces, nextDepth, nextColor, nextRound);
							value       += maxValue;
						}

						if (value < minValue) {
							minValue = value;
						}
					}
				}
			}

			return minValue;
		}
	}
	return scope;

})(Chess);
