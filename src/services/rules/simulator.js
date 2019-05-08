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

		if (piece.type === chess.types.pawn) {
			let factor  = (piece.color === chess.colors.black) ? 1 : -1;
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

		//	To bottom
		for (let y=piecePosition.y+1; y<8; y++) {
			piece = pieces[y][piecePosition.x];
			if (piece !== null && piece.color === pieceToMove.color) {
				break;
			}
			availableMoves.push(new chess.Position(piecePosition.x, y));
		}

		//	To top
		for (let y=piecePosition.y-1; y>=0; y--) {
			piece = pieces[y][piecePosition.x];
			if (piece !== null && piece.color === pieceToMove.color) {
				break;
			}
			availableMoves.push(new chess.Position(piecePosition.x, y));
		}

		//	To right
		for (let x=piecePosition.x+1; x<8; x++) {
			piece = pieces[piecePosition.y][x];
			if (piece !== null && piece.color === pieceToMove.color) {
				break;
			}
			availableMoves.push(new chess.Position(x, piecePosition.y));
		}

		//	To left
		for (let x=piecePosition.x-1; x>=0; x--) {
			piece = pieces[piecePosition.y][x];
			if (piece !== null && piece.color === pieceToMove.color) {
				break;
			}
			availableMoves.push(new chess.Position(x, piecePosition.y));
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
					availableMoves.push(new chess.Position(posX, posY));
				}
			}
		}

		return availableMoves;
	}

	function availableBishopMoves(pieces, piecePosition, pieceToMove, availableMoves) {

		let piece = null;
		let posX  = 0;
		let posY  = 0;

		for (let i=1; (piecePosition.x+i<8 && piecePosition.y+i<8); i++) {
			posX = piecePosition.x+i;
			posY = piecePosition.y+i;
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];
				if (piece !== null && piece.color === pieceToMove.color) {
					break;
				}
				availableMoves.push(new chess.Position(posX, posY));
			}
		}

		for (let i=1; (piecePosition.x+i<8 && piecePosition.y-i>=0); i++) {
			posX = piecePosition.x+i;
			posY = piecePosition.y-i;
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];
				if (piece !== null && piece.color === pieceToMove.color) {
					break
				}
				availableMoves.push(new chess.Position(posX, posY));
			}
		}

		for (let i=1; (piecePosition.x-i>=0 && piecePosition.y+i<8); i++) {
			posX = piecePosition.x-i;
			posY = piecePosition.y+i;
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];
				if (piece !== null && piece.color === pieceToMove.color) {
					break;
				}
				availableMoves.push(new chess.Position(posX, posY));
			}
		}

		for (let i=1; (piecePosition.x-i>=0 && piecePosition.y-i>=0); i++) {
			posX = piecePosition.x-i;
			posY = piecePosition.y-i;
			if (isInChessboard(posX) && isInChessboard(posY)) {
				piece = pieces[posY][posX];
				if (piece !== null && piece.color === pieceToMove.color) {
					break;
				}
				availableMoves.push(new chess.Position(posX, posY));
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
		let posX  = 0;
		let posY  = 0;

		for (y=-1; y<=1; y++) {
			for (x=-1; x<=1; x++) {
				posX = piecePosition.x+x;
				posY = piecePosition.y+y;
				if (isInChessboard(posX) && isInChessboard(posY)) {
					piece = pieces[posY][posX];
					if (piece === null || piece.color !== pieceToMove.color) {
						availableMoves.push(new chess.Position(posX, posY));
					}
				}
			}
		}

		return availableMoves;
	}

	function availablePawnMoves(pieces, piecePosition, pieceToMove, availableMoves, roundIndex) {

		let piece  = null;
		let factor = (pieceToMove.color === chess.colors.black) ? 1 : -1;
		let posX = 0;
		let posY = 0;

		//	Straight forward
		posY = piecePosition.y+factor;
		if (isInChessboard(posY)) {
			piece = pieces[posY][piecePosition.x];
			if (piece === null) {
				availableMoves.push(new chess.Position(piecePosition.x, posY));

				//	Runs straight forward (two cases)
				posY = posY+factor;
				if (isInChessboard(posY)) {
					if (pieceToMove.last === 0) {
						piece = pieces[posY][piecePosition.x];
						if (piece === null) {
							availableMoves.push(new chess.Position(piecePosition.x, posY));
						}
					}
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
						availableMoves.push(new chess.Position(posX, posY));
					}
				}
				else {
					//	En passant
					let rusher = pieces[piecePosition.y][posX];
					if (rusher !== null && rusher.color !== pieceToMove.color) {
						if (rusher.hasRushed && rusher.last === (roundIndex-1)) {
							availableMoves.push(new chess.Position(posX, posY));
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
				pieces[move.y2][move.x2] = pieces[move.y1][move.x1];
				pieces[move.y1][move.x1] = null;
				pieces[move.y2][move.x2].last = roundIndex;
				pieces[move.y2][move.x2].hasRushed = hasRushed(pieces[move.y2][move.x2], move.y1, move.y2);
				if (move.type !== chess.types.null) {
					pieces[move.y2][move.x2].type = move.type;
				}
			}
		},

		/*
		applyChanges: function(pieces, roundIndex, changes) {

			let removedPieces = new Array();
			let movedPieces   = new Array();

			for (let remove of changes.remove) {
				removedPieces.push({
					x: remove.x,
					y: remove.y,
					piece: pieces[remove.y][remove.x]
				});
				pieces[remove.y][remove.x] = null;
			}

			for (let move of changes.move) {

				movedPieces.push({
					x1: move.x1, y1: move.y1,
					x2: move.x2, y2: move.y2,
					last: pieces[move.y1][move.x1].last,
					type: pieces[move.y1][move.x1].type,
					hasRushed: pieces[move.y1][move.x1].hasRushed
				});

				let type = (move.type == null) ? null : move.type;
				pieces[move.y2][move.x2] = pieces[move.y1][move.x1];
				pieces[move.y1][move.x1] = null;
				pieces[move.y2][move.x2].last = roundIndex;
				pieces[move.y2][move.x2].hasRushed = hasRushed(pieces[move.y2][move.x2], move.y1, move.y2);
				if (type != null) {
					pieces[move.y2][move.x2].type = type;
				}
			}

			return {
				removedPieces: removedPieces,
				movedPieces:   movedPieces
			};
		},

		cancelChanges: function(pieces, roundIndex, changesToCancel) {

			for (let move of changesToCancel.movedPieces) {
				pieces[move.y1][move.x1] = pieces[move.y2][move.x2];
				pieces[move.y2][move.x2] = null;
				pieces[move.y1][move.x1].last      = move.last;
				pieces[move.y1][move.x1].type      = move.type;
				pieces[move.y1][move.x1].hasRushed = move.hasRushed;
			}

			for (let remove of changesToCancel.removedPieces) {
				pieces[remove.y][remove.x] = remove.piece;
			}
		},*/

		allAvailablePiecesPositions: function(pieces, color) {

			let availablePieces = new Array();

			for (let y=0; y<8; y++) {
				for (let x=0; x<8; x++) {
					let piece = pieces[y][x];
					if (piece !== null && piece.color === color) {
						availablePieces.push(new chess.Position(x, y));
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
				case chess.types.rook:
					availableMoves = availableRookMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case chess.types.knight:
					availableMoves = availableKnightMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case chess.types.bishop:
					availableMoves = availableBishopMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case chess.types.queen:
					availableMoves = availableQueenMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case chess.types.king:
					availableMoves = availableKingMoves(pieces, piecePosition, piece, availableMoves);
					break;
				case chess.types.pawn:
					availableMoves = availablePawnMoves(pieces, piecePosition, piece, availableMoves, roundIndex);
					break;
			}

			return availableMoves;
		},

		allPiecesMoves: function(pieces, round, availablePieces) {

			let availablePiecesMovements = new Array();
			for (let i=0, nb=availablePieces.length; i<nb; i++) {

				let availablePieceMovement = chess.simulator.allPieceMoves(pieces, availablePieces[i], round);
				availablePiecesMovements.push(availablePieceMovement);
			}

			return availablePiecesMovements;
		}

	}
	return scope;

})(Chess);
