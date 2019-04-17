/**
 * @static
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.rules = (function(chess) {

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

		let y = (color === 'b') ? 0 : 7;

		return (y === origin.y && (steps.x === -2 || steps.x === 2));
	}

	function movePawnConditionWithoutPieceTaken(steps, origin, color) {

		let factor = (color === 'b') ? 1 : -1;
		let start  = (color === 'b') ? 1 : 6;
		let y      = steps.y * factor;

		return (steps.x === 0 && (y === 1 || (y === 2 && start == origin.y)));
	}

	function movePawnConditionWithPieceTaken(steps, color) {

		let factor = (color === 'b') ? 1 : -1;
		let y      = steps.y * factor;

		return (y === 1 && (steps.x === 1 || steps.x === -1));
	}

	function moveRook(pieces, origin, dest) {

		let result     = initResult();
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

		let result  = initResult();
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

		let result     = initResult();
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

		let result     = initResult();
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

		let result  = initResult();
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

		let result  = initResult();
		let steps   = getSteps(origin, dest);
		let color   = pieces[origin.y][origin.x].color;

		//	Origin != destination
		if (pieceHasMoved(origin, dest)) {

			//	Bishop movement
			if (movePawnConditionWithoutPieceTaken(steps, origin, color)) {

				result = buildResultPawnMoveOnly(result, pieces, origin, dest, color);
			}
			else if (movePawnConditionWithPieceTaken(steps, color)) {

				result = buildResultPawnTakeOnly(result, pieces, origin, dest, color, roundIndex);
			}
		}

		return result;
	}

	function getSteps(origin, dest) {

		return {
			x: dest.x - origin.x,
			y: dest.y - origin.y,
		}
	}

	function getIncrements(steps) {

		return {
			x: getIncrement(steps.x),
			y: getIncrement(steps.y)
		}
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

		return {
			x: position.x+increments.x,
			y: position.y+increments.y
		};
	}

	function buildResult(result, pieces, origin, dest) {

		if (pieces[dest.y][dest.x] === null) {
			//	A movement without piece taken
			result.isAllowed = true;
		}
		else if (pieces[origin.y][origin.x].color != pieces[dest.y][dest.x].color) {
			//	A piece is taken of a different color
			result.isAllowed = true;
			result.remove.push({ x: dest.x, y: dest.y });
		}
		if (result.isAllowed) {
			result.move.push({ x1: origin.x, y1: origin.y, x2: dest.x, y2: dest.y });
		}

		return result;
	}

	function buildResultPawnMoveOnly(result, pieces, origin, dest, color) {

		let border = (color === 'w')     ? 0  : 8;
		let type   = (dest.y === border) ? 'q': null; // Pawn promotion

		if (pieces[dest.y][dest.x] === null) {
			result.isAllowed = true;
			result.move.push({ x1: origin.x, y1: origin.y, x2: dest.x, y2: dest.y, type: type });
		}

		return result;
	}

	function buildResultPawnTakeOnly(result, pieces, origin, dest, color, roundIndex) {

		if (pieces[dest.y][dest.x] !== null) {
			if (pieces[origin.y][origin.x].color != pieces[dest.y][dest.x].color) {
				//	A piece is taken of a different color
				result.isAllowed = true;
				result.remove.push({ x: dest.x, y: dest.y });
				result.move.push({ x1: origin.x, y1: origin.y, x2: dest.x, y2: dest.y });
			}
		}
		else {
			//	En passant
			let decrement = (color === 'w') ? 1 : -1;
			let taken     = pieces[dest.y+decrement][dest.x];
			if (taken !== null && taken.hasRushed && taken.last === (roundIndex-1)) {
				//	En passant succeed
				result.isAllowed = true;
				result.remove.push({ x: dest.x, y: dest.y+decrement });
				result.move.push({ x1: origin.x, y1: origin.y, x2: dest.x, y2: dest.y });
			}
		}


		return result;
	}

	function buildResultKingCastling(result, pieces, origin, dest) {


		if (pieces[dest.y][dest.x] === null) {
			
		}

		return result;
	}

	function initResult() {

		let result   = {
			isAllowed: false,
			isCheck: false,
			isCheckmated: false,
			move: new Array(),
			remove: new Array()
		};

		return result;
	}

	var scope = {

		/*** Public static methods ***/

		movePiece: function(pieces, origin, dest, roundIndex) {

			let result = null;

			switch (pieces[origin.y][origin.x].type) {
				case 'r':
					result = moveRook(pieces, origin, dest);
					break;
				case 'k':
					result = moveKnight(pieces, origin, dest);
					break;
				case 'b':
					result = moveBishop(pieces, origin, dest);
					break;
				case 'q':
					result = moveQueen(pieces, origin, dest);
					break;
				case 's': // sovereign => king
					result = moveKing(pieces, origin, dest);
					break;
				case 'p':
					result = movePawn(pieces, origin, dest, roundIndex);
					break;
			}

			return result;
		}

	}
	return scope;

})(Chess);
