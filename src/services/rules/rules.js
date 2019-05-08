/**
 * @static
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.rules = (function(chess) {

	var maxNumberPiecesForDraw = 2;

	var listOfInsufficientMaterial = [
		{ p1: [chess.types.king], p2: [chess.types.king] },
		{ p1: [chess.types.king], p2: [chess.types.king, chess.types.bishop] },
		{ p1: [chess.types.king], p2: [chess.types.king, chess.types.knight] }
	];

	var unusualListOfInsufficientMaterial = [
		{ p1: [chess.types.king, chess.types.bishop], p2: [chess.types.king, chess.types.bishop] }
	];

	function pieceIsBlocked(pieces, origin, dest, increments) {

		let isBlocked = false;
		let position = origin;

		if (!pieceHasMoved(position, dest)) {
			//	Origin can't be equal to dest
			isBlocked = true;
		}
		else {
			position = getNextPosition(position, increments);
			while (position.x != dest.x || position.y != dest.y) {

				//	A piece has been encoutered on the path
				if (pieces[position.y][position.x] !== null) {
					isBlocked = true;
					break;
				}
				position = getNextPosition(position, increments);
			}
		}

		return isBlocked;
	}

	function pieceHasMoved(origin, dest) {

		let hasMoved = false;
		if (origin.x !== dest.x || origin.y !== dest.y) {
			//	Origin can't be equal to dest
			hasMoved = true;
		}

		return hasMoved;
	}

	function moveRookCondition(steps) {

		return ((steps.x === 0 && steps.y !== 0) || (steps.y === 0 && steps.x !== 0));
	}

	function moveKnightCondition(steps) {

		return ((steps.x === 2 && steps.y === 1) || (steps.x === 1 && steps.y === 2));
	}

	function moveBishopCondition(steps) {

		return (steps.x === steps.y || steps.x === (steps.y*-1));
	}

	function moveQueenCondition(steps) {

		return (moveRookCondition(steps) || moveBishopCondition(steps));
	}

	function moveKingCondition(steps) {

		return (steps.x <= 1 && steps.x >= -1 && steps.y <= 1 && steps.y >= -1);
	}

	function castlingCondition(steps, origin, color) {

		let y = (color === chess.colors.black) ? 0 : 7;

		return (y === origin.y && (steps.x === -2 || steps.x === 2));
	}

	function movePawnConditionWithoutPieceTaken(steps, origin, color) {

		let factor = (color === chess.colors.black) ? 1 : -1;
		let start  = (color === chess.colors.black) ? 1 : 6;
		let y      = steps.y * factor;

		return (steps.x === 0 && (y === 1 || (y === 2 && start == origin.y)));
	}

	function movePawnConditionWithPieceTaken(steps, color) {

		let factor = (color === chess.colors.black) ? 1 : -1;
		let y      = steps.y * factor;

		return (y === 1 && (steps.x === 1 || steps.x === -1));
	}

	function moveRook(pieces, origin, dest) {

		let result     = new chess.Change();
		let steps      = getSteps(origin, dest);
		let increments = getIncrements(steps);

		//	Rook movement
		if (moveRookCondition(steps)) {
			
			//	Piece encoutered another piece when moving
			if (!pieceIsBlocked(pieces, origin, dest, increments)) {

				result = buildResult(result, pieces, origin, dest);
			}
		}

		return result;
	}

	function moveKnight(pieces, origin, dest) {

		let result  = new chess.Change();
		let steps   = getSteps(origin, dest);
		steps.x     = Math.abs(steps.x);
		steps.y     = Math.abs(steps.y);

		//	Knight movement
		if (moveKnightCondition(steps)) {
			
			//	Origin != destination
			if (pieceHasMoved(origin, dest)) {

				result = buildResult(result, pieces, origin, dest);
			}
		}

		return result;
	}

	function moveBishop(pieces, origin, dest) {

		let result     = new chess.Change();
		let steps      = getSteps(origin, dest);
		let increments = getIncrements(steps);

		//	Bishop movement
		if (moveBishopCondition(steps)) {

			//	Piece encoutered another piece when moving
			if (!pieceIsBlocked(pieces, origin, dest, increments)) {

				result = buildResult(result, pieces, origin, dest);
			}
		}

		return result;
	}

	function moveQueen(pieces, origin, dest) {

		let result     = new chess.Change();
		let steps      = getSteps(origin, dest);
		let increments = getIncrements(steps);

		//	Bishop movement
		if (moveQueenCondition(steps)) {

			//	Piece encoutered another piece when moving
			if (!pieceIsBlocked(pieces, origin, dest, increments)) {

				result = buildResult(result, pieces, origin, dest);
			}
		}

		return result;
	}

	function moveKing(pieces, origin, dest) {

		let result  = new chess.Change();
		let steps   = getSteps(origin, dest);
		let color   = pieces[origin.y][origin.x].color;

		//	Origin != destination
		if (pieceHasMoved(origin, dest)) {

			//	Bishop movement
			if (moveKingCondition(steps)) {

				result = buildResult(result, pieces, origin, dest);
			}
			else if (castlingCondition(steps, origin, color)) {

				result = buildResultKingCastling(result, pieces, origin, dest);
			}
		}

		return result;
	}

	function movePawn(pieces, origin, dest, roundIndex) {

		let result     = new chess.Change();
		let steps      = getSteps(origin, dest);
		let color      = pieces[origin.y][origin.x].color;

		//	Origin != destination
		if (pieceHasMoved(origin, dest)) {

			//	Bishop movement
			if (movePawnConditionWithoutPieceTaken(steps, origin, color)) {

				//	Piece encoutered another piece when moving
				let increments = getIncrements(steps);
				if (!pieceIsBlocked(pieces, origin, dest, increments)) {

					result = buildResultPawnMoveOnly(result, pieces, origin, dest, color);
				}
			}
			else if (movePawnConditionWithPieceTaken(steps, color)) {

				result = buildResultPawnTakeOnly(result, pieces, origin, dest, color, roundIndex);
			}
		}

		return result;
	}

	function getSteps(origin, dest) {

		let x = dest.x - origin.x;
		let y = dest.y - origin.y;

		return new chess.Position(x, y);
	}

	function getIncrements(steps) {

		let x = getIncrement(steps.x);
		let y = getIncrement(steps.y);

		return new chess.Position(x, y);
	}

	function getIncrement(step) {

		let increment = 0;
		if (step > 0) {
			increment = 1;
		}
		else if (step < 0) {
			increment = -1;
		}

		return increment;
	}

	function getNextPosition(position, increments) {

		let x = position.x+increments.x;
		let y = position.y+increments.y;

		return new chess.Position(x, y);
	}

	function buildResult(result, pieces, origin, dest) {

		if (pieces[dest.y][dest.x] === null) {
			//	A movement without piece taken
			result.isAllowed = true;
		}
		else if (pieces[origin.y][origin.x].color != pieces[dest.y][dest.x].color) {
			//	A piece is taken of a different color
			result.isAllowed = true;
			result.remove.push(new chess.Position(dest.x, dest.y));
		}
		if (result.isAllowed) {
			result.move.push(new chess.Move(origin.x, origin.y, dest.x, dest.y, chess.types.null));
		}

		return result;
	}

	function buildResultPawnMoveOnly(result, pieces, origin, dest, color) {

		let border = (color === chess.colors.white)     ? 0  : 7;
		let type   = (dest.y === border) ? chess.types.queen: chess.types.null; // Pawn promotion
		let dist   = dest.y - origin.y;

		if (pieces[dest.y][dest.x] === null) {
			result.isAllowed = true;
			result.move.push(new chess.Move(origin.x, origin.y, dest.x, dest.y, type));
		}

		return result;
	}

	function buildResultPawnTakeOnly(result, pieces, origin, dest, color, roundIndex) {

		let border = (color === chess.colors.white)     ? 0  : 7;
		let type   = (dest.y === border) ? chess.types.queen: chess.types.null; // Pawn promotion

		if (pieces[dest.y][dest.x] !== null) {
			if (pieces[origin.y][origin.x].color != pieces[dest.y][dest.x].color) {
				//	A piece is taken of a different color
				result.isAllowed = true;
				result.remove.push(new chess.Position(dest.x, dest.y));
				result.move.push(new chess.Move(origin.x, origin.y, dest.x, dest.y, type));
			}
		}
		else {
			//	En passant
			let decrement = (color === chess.colors.white) ? 1 : -1;
			let taken     = pieces[dest.y+decrement][dest.x];
			if (taken !== null && taken.hasRushed && taken.last === (roundIndex-1)) {
				//	En passant succeed
				result.isAllowed = true;
				result.remove.push(new chess.Position(dest.x, dest.y+decrement));
				result.move.push(new chess.Move(origin.x, origin.y, dest.x, dest.y, type));
			}
		}


		return result;
	}

	function getRookPositionOnCastling(dest) {

		let x = (dest.x === 2) ? 0 : 7;
		let rookPosition = new chess.Position(x, dest.y);

		return rookPosition;
	}

	function doesPieceIsValidOnCastling(pieces, position, type) {

		let isValid = false;
		let piece   = pieces[position.y][position.x];
		if (piece !== null && piece.type === type) {
			if (piece.last === 0) {
				isValid = true;
			}
		}

		return isValid;
	}

	function doesPathIsFreeOnCastling(pieces, kingPosition, rookPosition) {

		let isPathFree = true;
		let start  = (rookPosition.x === 0) ? 1 : 5;
		let end    = (rookPosition.x === 0) ? 3 : 6;
		let y      = kingPosition.y;

		for (let x = start; x <= end; x++) {
			let piece = pieces[y][x];
			if (piece !== null) {
				isPathFree = false;
				break;
			}
		}

		return isPathFree;
	}

	function buildResultKingCastling(result, pieces, origin, dest) {

		let rookPosition   = getRookPositionOnCastling(dest);

		if (doesPieceIsValidOnCastling(pieces, rookPosition, chess.types.rook) &&
			doesPieceIsValidOnCastling(pieces, origin, chess.types.king)) {

			if (doesPathIsFreeOnCastling(pieces, origin, rookPosition)) {

				//	Todo : king check is forbidden on any case of the king journey 
				//	including the start position and obviously the destination

				let rookDestinationX = (rookPosition.x === 0) ? 3 : 5;

				result.isAllowed = true;
				result.move.push(new chess.Move(origin.x, origin.y, dest.x, dest.y));
				result.move.push(new chess.Move(rookPosition.x, rookPosition.y, rookDestinationX, rookPosition.y));
			}
		}

		return result;
	}

	/**
	 * First piece of type found for a specific player
	 *
	 * @param  [{x,y}] pieces
	 * @param  string  color
	 * @param  string  type
	 * @return {x,y}
	 */
	function findPiece(pieces, color, type) {

		let position = null;

		find:
		for (let y=0; y<8; y++) {
			for (let x=0; x<8; x++) {
				let piece = pieces[y][x];
				if (piece !== null && piece.type === type && piece.color === color) {
					position = new chess.Position(x, y);
					break find;
				}
			}
		}

		return position;
	}

	/**
	 * Verify if player move will put himself in check
	 * Verify if player move will put opponent in check
	 *
	 * @param  array[Chess.Piece]  pieces
	 * @param  integer             roundIndex
	 * @param  Chess.Change        changes
	 * @param  string              color
	 * @return Chess.Change
	 */
	function inCheck(pieces, roundIndex, changes, color) {

		let nextPieces   = chess.utils.copyArray(pieces);
		chess.simulator.applyChanges(nextPieces, roundIndex, changes);
		roundIndex++;

		let opponentColor = chess.utils.switchColor(color);

		changes = selfInCheck(nextPieces, roundIndex, changes, color);
		if (changes.isAllowed) {
			changes.opponentIsInCheck      = opponentInCheck(nextPieces, roundIndex, opponentColor);
			changes.opponentIsInCheckmate  = opponentInCheckmate(nextPieces, roundIndex, opponentColor);
		}

		//	Draw
		if (!changes.opponentIsInCheck) {
			changes.draws = drawsWithInsufficientMaterial(nextPieces);
			if (!changes.draws) {
				changes.draws = drawsWithNoLegalMoves(nextPieces, roundIndex, opponentColor);
			}
		}

		return changes;
	}

	/**
	 * Verify if player is himself in check
	 *
	 * @param  array[Chess.Piece]  pieces
	 * @param  integer             roundIndex
	 * @param  Chess.Change        changes
	 * @param  string              color
	 * @return Chess.Change
	 */
	function selfInCheck(pieces, roundIndex, changes, color) {

		let kingPosition = findPiece(pieces, color, chess.types.king);

		simulation:
		for (let y=0; y<8; y++) {
			for (let x=0; x<8; x++) {
				if (y !== kingPosition.y || x !== kingPosition.x) {
					let piece = pieces[y][x];
					if (piece !== null && piece.color !== color) {
						let result = chess.rules.movePiece(pieces, new chess.Position(x, y), kingPosition, roundIndex, false);
						if (result.isAllowed) {
							changes = new chess.Change();
							break simulation;
						}
					}
				}
			}
		}
		
		return changes;
	}

	/**
	 * Verify if player put the opponent in check
	 *
	 * @param  array[Chess.Piece]  pieces       [pieces once the piece move has been fulfilled]
	 * @param  integer             roundIndex
	 * @param  string              color
	 * @return boolean
	 */
	function opponentInCheck(pieces, roundIndex, color) {

		let opponentIsInCheck = false;
		let kingPosition      = findPiece(pieces, color, chess.types.king);

		simulation:
		for (let y=0; y<8; y++) {
			for (let x=0; x<8; x++) {
				if (y !== kingPosition.y || x !== kingPosition.x) {
					let piece = pieces[y][x];
					if (piece !== null && piece.color !== color) {
						let result = chess.rules.movePiece(pieces, new chess.Position(x, y), kingPosition, roundIndex, false);
						if (result.isAllowed) {
							opponentIsInCheck = true;
							break simulation;
						}
					}
				}
			}
		}

		return opponentIsInCheck;
	}

	/**
	 * Verify if player put the opponent in checkmate
	 * This method is called if the oppenent is already in check
	 *
	 * @param  array[Chess.Piece]  pieces       [pieces once the piece move has been fulfilled]
	 * @param  integer             roundIndex
	 * @param  string              color
	 * @return Chess.Change
	 */
	function opponentInCheckmate(pieces, roundIndex, color) {

		//	We are looking for a way out
		//	So until this way out is found we consider this is a checkmate
		let opponentIsInCheckmate = true;
		let roundIndex2           = roundIndex+1;

		simulation: {
			//	Every available pieces for the opponent
			let allAvailablePieces = chess.simulator.allAvailablePiecesPositions(pieces, color); // [{x,y},...]
			for (let pieceIndex=0, nbPieces=allAvailablePieces.length; pieceIndex<nbPieces; pieceIndex++) {
				let piecePosition = allAvailablePieces[pieceIndex];

				//	Every possible moves for the opponent
				let allPieceMoves = chess.simulator.allPieceMoves(pieces, piecePosition, roundIndex);
				for (let moveIndex=0, nbMoves=allPieceMoves.length; moveIndex<nbMoves; moveIndex++) {
					let pieceMove = allPieceMoves[moveIndex];

					//	Simulate move
					let changes     = chess.rules.movePiece(pieces, piecePosition, pieceMove, roundIndex, false);
					let nextPieces  = chess.utils.copyArray(pieces);
					chess.simulator.applyChanges(nextPieces, roundIndex, changes);

					changes = selfInCheck(nextPieces, roundIndex2, changes, color);
					if (changes.isAllowed) {
						opponentIsInCheckmate = false;
						break simulation;
					}
				}
			}
		}

		return opponentIsInCheckmate;
	}

	/**
	 * Verify if player put the opponent in checkmate
	 * This method is called if the oppenent is already in check
	 *
	 * @param  array[Chess.Piece]  pieces       [pieces once the piece move has been fulfilled]
	 * @param  integer             roundIndex
	 * @param  string              color
	 * @return Chess.Change
	 */
	function drawsWithNoLegalMoves(pieces, roundIndex, color) {

		//	We are looking for a way out
		//	So until this way out is found we consider this is a checkmate
		let draws = true;

		simulation: {
			//	Every available pieces for the opponent
			let allAvailablePieces = chess.simulator.allAvailablePiecesPositions(pieces, color); // [{x,y},...]
			for (let pieceIndex=0, nbPieces=allAvailablePieces.length; pieceIndex<nbPieces; pieceIndex++) {
				let piecePosition = allAvailablePieces[pieceIndex];

				//	Every possible moves for the opponent
				let allPieceMoves = chess.simulator.allPieceMoves(pieces, piecePosition, roundIndex);
				for (let moveIndex=0, nbMoves=allPieceMoves.length; moveIndex<nbMoves; moveIndex++) {
					let pieceMove = allPieceMoves[moveIndex];

					//	Simulate move
					let changes = chess.rules.movePiece(pieces, piecePosition, pieceMove, roundIndex, false);

					//	Move is allowed but check ahs not been verified yet
					if (changes.isAllowed) {

						let nextPieces   = chess.utils.copyArray(pieces);
						chess.simulator.applyChanges(nextPieces, roundIndex, changes);

						changes = selfInCheck(nextPieces, roundIndex, changes, color);
						if (changes.isAllowed) {
							draws = false;
							break simulation;
						}
					}
				}
			}
		}

		return draws;
	}

	function drawsWithInsufficientMaterial(pieces) {

		let draws = false;

		let blackPieces = chess.simulator.allAvailablePieces(pieces, chess.colors.black);
		let whitePieces = chess.simulator.allAvailablePieces(pieces, chess.colors.white);

		if (blackPieces.length <= maxNumberPiecesForDraw || whitePieces.length <= maxNumberPiecesForDraw) {

			blackPieces.sort();
			whitePieces.sort();

			if (isThereInsufficientMaterial(blackPieces, whitePieces, listOfInsufficientMaterial) ||
			    isThereInsufficientMaterial(whitePieces, blackPieces, listOfInsufficientMaterial)) {
				draws = true;
			}
			else if (isThereInsufficientMaterial(blackPieces, whitePieces, unusualListOfInsufficientMaterial) ||
			         isThereInsufficientMaterial(whitePieces, blackPieces, unusualListOfInsufficientMaterial)) {
				
				//	In a square of the same color ?
				let p1Bishop = findPiece(pieces, chess.colors.white, chess.types.bishop);
				let p2Bishop = findPiece(pieces, chess.colors.black, chess.types.bishop);

				if (((p1Bishop.x+p1Bishop.y) % 2) === ((p2Bishop.x+p2Bishop.y) % 2)) {
					draws = true;
				}
			}
		}

		return draws;
	}

	/**
	 * @param  array[string] p1Pieces  sorted array of chars
	 * @param  array[string] p2Pieces  sorted array of chars
	 * @param  array[string] checkList sorted array of chars
	 * @return boolean
	 */
	function isThereInsufficientMaterial(p1Pieces, p2Pieces, checkList) {

		let insufficient = false;

		parsing:
		for (let i=0, nb=checkList; i<nb; i++) {
			let checkCase = checkList[i];
			if (chess.utils.compareSortedArrays(p1Pieces, checkCase.p1) &&
				chess.utils.compareSortedArrays(p2Pieces, checkCase.p2)) {
				insufficient = true;
				break parsing;
			}
		}

		return insufficient;
	}

	var scope = {

		/*** Public static methods ***/

		movePiece: function(pieces, origin, dest, roundIndex, verifyCheck) {

			let result = null;
			let piece  = pieces[origin.y][origin.x];

			switch (piece.type) {
				case chess.types.rook:
					result = moveRook(pieces, origin, dest);
					break;
				case chess.types.knight:
					result = moveKnight(pieces, origin, dest);
					break;
				case chess.types.bishop:
					result = moveBishop(pieces, origin, dest);
					break;
				case chess.types.queen:
					result = moveQueen(pieces, origin, dest);
					break;
				case chess.types.king:
					result = moveKing(pieces, origin, dest);
					break;
				case chess.types.pawn:
					result = movePawn(pieces, origin, dest, roundIndex);
					break;
			}

			//	Check & checkmate
			if (verifyCheck) {
				result = inCheck(pieces, roundIndex, result, piece.color);
			}

			return result;
		}

	}
	return scope;

})(Chess);
