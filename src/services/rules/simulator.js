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

	function isInChessboard(axe) {

		let result = (axe >= 0 && axe < 8) ? true : false;

		return result;
	}

	function availableRookMoves(pieces, piecePosition, pieceToMove, availableMoves) {

		let piece = null;

		for (let y=0; y<8; y++) {
			if (piecePosition.y !== y) {
				piece = pieces[y][piecePosition.x];
				if (piece === null || piece.color !== pieceToMove.color) {
					availableMoves.push({x: piecePosition.x, y: y});
				}
			}
		}

		for (let x=0; x<8; x++) {
			if (piecePosition.x !== x) {
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
			let posX = piecePosition.x+x[i];
			let posY = piecePosition.y+y[i];
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];
				if (piece === null || piece.color !== pieceToMove.color) {
					availableMoves.push({x: posX, y: posY});
				}
			}
		}

		return availableMoves;
	}

	function availableBishopMoves(pieces, piecePosition, pieceToMove, availableMoves) {

		let piece = null;

		for (let i=1; (piecePosition.x+i<8 && piecePosition.y+i<8); i++) {
			let posX = piecePosition.x+i;
			let posY = piecePosition.y+i;
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];
				if (piece === null || piece.color !== pieceToMove.color) {
					availableMoves.push({x: posX, y: posY});
				}
			}
		}

		for (let i=1; (piecePosition.x+i<8 && piecePosition.y-i>=0); i++) {
			let posX = piecePosition.x+i;
			let posY = piecePosition.y-i;
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];
				if (piece === null || piece.color !== pieceToMove.color) {
					availableMoves.push({x: posX, y: posY});
				}
			}
		}

		for (let i=1; (piecePosition.x-i>=0 && piecePosition.y+i<8); i++) {
			let posX = piecePosition.x-i;
			let posY = piecePosition.y+i;
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];
				if (piece === null || piece.color !== pieceToMove.color) {
					availableMoves.push({x: posX, y: posY});
				}
			}
		}

		for (let i=1; (piecePosition.x-i>=0 && piecePosition.y-i>=0); i++) {
			let posX = piecePosition.x-i;
			let posY = piecePosition.y-i;
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];
				if (piece === null || piece.color !== pieceToMove.color) {
					availableMoves.push({x: posX, y: posY});
				}
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
				let posX = piecePosition.x+x;
				let posY = piecePosition.y+y;
				if (isInChessboard(posX) && isInChessboard(posY)) {
					piece = pieces[posY][posX];
					if (piece === null || piece.color !== pieceToMove.color) {
						availableMoves.push({x: posX, y: posY});
					}
				}
			}
		}

		return availableMoves;
	}

	function availablePawnMoves(pieces, piecePosition, pieceToMove, availableMoves, roundIndex) {

		let piece  = null;
		let factor = (pieceToMove.color === 'b') ? 1 : -1;
		let posX = null;
		let posY = null;

		//	Straight forward
		posY = piecePosition.y+factor;
		if (isInChessboard(posY)) {
			piece = pieces[posY][piecePosition.x];
			if (piece === null) {
				availableMoves.push({x: piecePosition.x, y: posY});
			}
		}

		//	Runs straight forward (two cases)
		posY = piecePosition.y+(factor*2);
		if (isInChessboard(posY)) {
			if (pieceToMove.last === 0) {
				piece = pieces[posY][piecePosition.x];
				if (piece === null) {
					availableMoves.push({x: piecePosition.x, y: posY});
				}
			}
		}

		//	Takes a piece
		for (x=-1; x<=1; x=x+2) {
			posX = piecePosition.x+x;
			posY = piecePosition.y+factor;
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];

				if (piece !== null) {
					if (piece.color !== pieceToMove.color) {
						availableMoves.push({x: posX, y: posY});
					}
				}
				else {
					//	En passant
					let rusher = pieces[piecePosition.y][posX];
					if (rusher !== null && rusher.color !== pieceToMove.color) {
						if (rusher.hasRushed && rusher.last === (roundIndex-1)) {
							availableMoves.push({x: posX, y: posY});
						}
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

		allAvailablePiecesPositions: function(pieces, color) {

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
		},

		allAvailablePieces: function(pieces, color) {

			let availablePieces = new Array();

			for (let y=0; y<8; y++) {
				for (let x=0; x<8; x++) {
					let piece = pieces[y][x];
					if (piece !== null && piece.color === color) {
						availablePieces.push(piece.type);
					}
				}
			}

			return availablePieces;
		},

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
