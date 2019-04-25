/**
 * @static
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.simulator = (function(chess) {

	function hasRushed(piece, y1, y2) {

		let result = false;

		if (piece.type === 'p') {
			let factor  = (piece.color === 'b') ? 1 : -1;
			let y       = (y2 - y1) * factor;
			result      = (y == 2) ? true : false;
		}

		return result;
	}

	function availableRookMoves(pieces, piecePosition, pieceToMove, availableMoves) {

		let piece = null;

		for (let y=0; y<8; y++) {
			if (availableMoves.y !== y) {
				piece = pieces[y][piecePosition.x];
				if (piece === null || piece.color !== pieceToMove.color) {
					availableMoves.push({x: piecePosition.x, y: y});
				}
			}
		}

		for (let x=0; x<8; x++) {
			if (availableMoves.x !== x) {
				piece = pieces[piecePosition.y][x];
				if (piece === null || piece.color !== pieceToMove.color) {
					availableMoves.push({x: x, y: piecePosition.y});
				}
			}
		}

		return availableMoves;
	}

	function availableKnightMoves(pieces, piecePosition, pieceToMove, availableMoves) {

		let piece = null;

		let x = [-1, -1, 1, 1, -2, -2, 2, 2];
		let y = [-2, 2, -2, 2, -1, 1, -1, 1];

		for (var i=0; i<8; i++) {
			piece = pieces[y[i]][x[i]];
			if (piece === null || piece.color !== pieceToMove.color) {
				availableMoves.push({x: x[i], y: y[i]});
			}
		}

		return availableMoves;
	}

	function availableBishopMoves(pieces, piecePosition, pieceToMove, availableMoves) {

		let piece = null;

		for (let i=1; (piecePosition.x+i<8 && piecePosition.y+i<8); i++) {
			piece = pieces[piecePosition.y+i][piecePosition.x+i];
			if (piece === null || piece.color !== pieceToMove.color) {
				availableMoves.push({x: piecePosition.x, y: y});
			}
		}

		for (let i=1; (piecePosition.x+i<8 && piecePosition.y-i>=0); i++) {
			piece = pieces[piecePosition.y-i][piecePosition.x+i];
			if (piece === null || piece.color !== pieceToMove.color) {
				availableMoves.push({x: piecePosition.x, y: y});
			}
		}

		for (let i=1; (piecePosition.x-i>=0 && piecePosition.y+i<8); i++) {
			piece = pieces[piecePosition.y+i][piecePosition.x-i];
			if (piece === null || piece.color !== pieceToMove.color) {
				availableMoves.push({x: piecePosition.x, y: y});
			}
		}

		for (let i=1; (piecePosition.x-i>=0 && piecePosition.y-i>=0); i++) {
			piece = pieces[piecePosition.y-i][piecePosition.x-i];
			if (piece === null || piece.color !== pieceToMove.color) {
				availableMoves.push({x: piecePosition.x, y: y});
			}
		}

		return availableMoves;
	}

	function availableQueenMoves(pieces, piecePosition, pieceToMove, availableMoves) {

		let piece = null;

		availableMoves = availableRookMoves(pieces, piecePosition, pieceToMove, availableMoves);
		availableMoves = availableBishopMoves(pieces, piecePosition, pieceToMove, availableMoves);

		return availableMoves;
	}

	function availableKingMoves(pieces, piecePosition, pieceToMove, availableMoves) {

		let piece = null;

		for (y=-1; y<=1; y++) {
			for (x=-1; x<=1; x++) {
				if (x !== 0 && y !== 0 && x >= 0 && x < 8 && y >= 0 && y < 8) {
					piece = pieces[piecePosition.y+y][piecePosition.x+x];
					if (piece === null || piece.color !== pieceToMove.color) {
						availableMoves.push({x: piecePosition.x+x, y: piecePosition.y+y});
					}
				}
			}
		}

		return availableMoves;
	}

	function availablePawnMoves(pieces, piecePosition, pieceToMove, availableMoves, roundIndex) {

		let piece  = null;
		let factor = (pieceToMove.color === 'b') ? 1 : -1;

		//	Straight forward
		piece = pieces[piecePosition.y+factor][piecePosition.x];
		if (piece === null) {
			availableMoves.push({x: piecePosition.x, y: piecePosition.y+y});
		}

		//	Runs straight forward (two cases)
		if (pieceToMove.last === 0) {
			piece = pieces[piecePosition.y+(factor*2)][piecePosition.x];
			if (piece === null) {
				availableMoves.push({x: piecePosition.x, y: piecePosition.y+(factor*2)});
			}
		}

		//	Takes a piece
		for (x=-1; x<=1; i=i+2) {
			piece = pieces[piecePosition.y+factor][piecePosition.x+x];

			if (piece !== null) {
				if (piece.color !== pieceToMove.color) {
					availableMoves.push({x: piecePosition.x+x, y: piecePosition.y+factor});
				}
			}
			else {
				//	En passant
				let rusher = pieces[piecePosition.y][piecePosition.x+x];
				if (rusher !== null && rusher.color !== pieceToMove.color) {
					if (rusher.hasRushed && rusher.last === (roundIndex-1)) {
						availableMoves.push({x: piecePosition.x+x, y: piecePosition.y+factor});
					}
				}
			}
		}


		return availableMoves;
	}

	var scope = {

		/*** Public static methods ***/

		applyChanges: function(pieces, roundIndex, changes) {

			for (let remove of changes.remove) {
				pieces[remove.y][remove.x] = null;
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
			}
		},

		allPiecesAvailable: function(pieces, color) {

			let availablePieces = new Array();

			for (let y=0; y<8; y++) {
				for (let x=0; x<8; x++) {
					let piece = pieces[y][x];
					if (piece !== null && piece.color === color) {
						availablePieces.push({x: x, y: y});
					}
				}
			}

			return availablePieces;
		}

		allPieceMoves: function(pieces, piecePosition, roundIndex) {

			let availableMoves = new Array();
			let piece          = pieces[piecePosition.y][piecePosition.x];

			switch (piece.type) {
				case 'r':
					availableMoves = availableRookMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case 'n': // knight
					availableMoves = availableKnightMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case 'b':
					availableMoves = availableBishopMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case 'q':
					availableMoves = availableQueenMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case 'k':
					availableMoves = availableKingMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case 'p':
					availableMoves = availablePawnMoves(pieces, piecePosition, piece, availableMoves, roundIndex);
					break;
			}

			return availableMoves;
		}
	}
	return scope;

})(Chess);
