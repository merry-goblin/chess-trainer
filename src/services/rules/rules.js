/**
 * @static
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.rules = (function(chess) {

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesRookMovementIsAllowed(origin, dest) {

		let isAllowed = false;
		let steps = getSteps(origin, dest);
		if ((steps.x === 0 && steps.y !== 0) || (steps.y === 0 && steps.x !== 0)) {
			isAllowed = true;
		}

		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesKnightMovementIsAllowed(origin, dest) {

		let isAllowed = false;
		let steps = getSteps(origin, dest);
		steps.x = Math.abs(steps.x);
		steps.y = Math.abs(steps.y);
		if ((steps.x === 2 && steps.y === 1) || (steps.x === 1 && steps.y === 2)) {
			isAllowed = true;
		}

		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesBishopMovementIsAllowed(origin, dest) {

		let isAllowed = false;
		let steps = getSteps(origin, dest);
		if (steps.x !== 0) {
			if (steps.x === steps.y || steps.x === (steps.y*-1)) {
				isAllowed = true;
			}
		}

		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesQueenMovementIsAllowed(origin, dest) {

		let isAllowed = false;
		if (doesBishopMovementIsAllowed(origin, dest) || doesRookMovementIsAllowed(origin, dest)) {
			isAllowed = true;
		}

		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesKingMovementIsAllowed(origin, dest) {

		let isAllowed = false;
		let steps = getSteps(origin, dest);
		steps.x = Math.abs(steps.x);
		steps.y = Math.abs(steps.y);
		if ((steps.x !== 0 || steps.y !== 0) && steps.x <= 1 && steps.y <= 1) {
			isAllowed = true;
		}

		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesPawnMovementIsAllowed(origin, dest, color) {

		let isAllowed = false;
		if (origin.x === dest.x) {
			let factor = (color === 'b') ? 1 : -1;
			let step   = (dest.y-origin.y) * factor;
			if (step === 1) {
				isAllowed = true;
			}
			else if (step === 2) {
				if ((color === 'w' && origin.y == 6) || (color === 'b' && origin.y === 1)) {
					isAllowed = true;
				}
			}
		}

		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesPawnTakesAPiece(origin, dest, color) {

		let isAllowed = false;
		let steps = getSteps(origin, dest);
		if (origin.x === dest.x+1 || origin.x === dest.x-1) {

		}

		if (origin.x === dest.x) {
			let factor = (color === 'b') ? 1 : -1;
			let step   = (dest.y-origin.y) * factor;
			if (step === 1) {
				isAllowed = true;
			}
			else if (step === 2) {
				if ((color === 'w' && origin.y === 6) || (color === 'b' && origin.y === 1)) {
					isAllowed = true;
				}
			}
		}

		return isAllowed;
	}

	function doesPawnMoveToTakeAPiece(origin, dest, color) {

		let isAllowed = false;
		let steps = getSteps(origin, dest);
		if (Math.abs(steps.x) == 1) {
			let factor = (color === 'b') ? 1 : -1;
			let step   = (steps.y) * factor;
			if (step === 1) {
				isAllowed = true;
			}
		}

		return isAllowed;
	}

	function getPawnTakenPositionWithEnPassant(dest, color) {

		let factor = (color === 'b') ? -1 : 1;
		let y = dest.y + factor;

		return {
			x: dest.x,
			y: y
		};
	}

	function doesPawnReachedTheBorder(dest , color) {

		let limit = (color === 'b') ? 7 : 0;

		return (dest.y === limit);
	}

	// *******************

	function pieceIsBlocked(pieces, origin, dest, increments) {

		let isBlocked = false;
		let position = origin;

		if (!pieceHasMoved(position, dest)) {
			//	Origin can't be equal to dest
			isBlocked = true;
		}
		else {
			position = getNextPosition(position, increments);
			while (position.x != dest.x && position.y != dest.y) {

				//	A piece has been encoutered on the path
				if (pieces[position.y][position.x] != null) {
					isBlocked = true;
					break;
				}
			}
		}

		return isBlocked;
	}

	function pieceHasMoved(origin, dest) {

		let hasMoved = false;

		if (origin.x == dest.x && origin.y == dest.y) {
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

		return ((steps.x <= 1 || steps.x >= -1) && (steps.y <= 1 || steps.y >= -1));
	}

	function movePawnConditionWithoutPieceTaken(steps, origin, color) {

		let factor = (color === 'b') ? 1 : -1;
		let start  = (color === 'b') ? 1 : 6;
		let y = steps.y * factor;

		return (y === 1 || (y === 2 && start == origin.y));
	}

	function moveRook(pieces, origin, dest) {

		let result     = initResult();
		let steps      = getSteps(origin, dest);
		let increments = getIncrement(steps);

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
			if (!pieceHasMoved(origin, dest)) {

				result = buildResult(result, pieces, origin, dest);
			}
		}

		return result;
	}

	function moveBishop(pieces, origin, dest) {

		let result     = initResult();
		let steps      = getSteps(origin, dest);
		let increments = getIncrement(steps);

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
		let increments = getIncrement(steps);

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

		let result     = initResult();
		let steps      = getSteps(origin, dest);

		//	Bishop movement
		if (moveKingCondition(steps)) {

			//	Origin != destination
			if (!pieceHasMoved(origin, dest)) {

				result = buildResult(result, pieces, origin, dest);
			}
		}

		return result;
	}

	function movePawn(pieces, origin, dest) {

		let result     = initResult();
		let steps      = getSteps(origin, dest);
		let color      = pieces[origin.y][origin.x][0];

		//	Origin != destination
		if (!pieceHasMoved(origin, dest)) {

			//	Bishop movement
			if (movePawnConditionWithoutPieceTaken(steps, origin, color)) {

				//result = buildResult(result, pieces, origin, dest);
			}
			//	Todo
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

	function buildResult(result, pieces, dest, origin) {

		if (pieces[dest.y][dest.x] === null) {
			//	A movement without piece taken
			result.isAllowed = true;
		}
		else if (pieces[origin.y][origin.x][0] != pieces[dest.y][dest.x][0]) {
			//	A piece is taken of a different color
			result.isAllowed = true;
			result.remove.push({ x: dest.x, y: dest.y });
		}
		if (result.isAllowed) {
			result.move.push({ x1: origin.x, y1: origin.y, x2: dest.x, y2: dest.y });
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

		movePiece: function(pieces, origin, dest) {

			let result = null;

			switch (type) {
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
					result = movePawn(pieces, origin, dest);
					break;
			}

			return result;
		},

		/**
		 * Check if the movement is allowed in an empty chessboard.
		 * Capture is not tested in this function, if false is returned
		 * it doesn't mean that the movement isn't allowed
		 * 
		 * @param  string piece
		 * @param  {x,y}  origin
		 * @param  {x,y}  dest
		 * @return boolean
		 */
		doesBasicPieceMovementIsAllowed: function(piece, origin, dest) {

			let isAllowed = false;
			let type  = piece[1];
			let color = piece[0];

			switch (type) {
				case 'r':
					isAllowed = doesRookMovementIsAllowed(origin, dest);
					break;
				case 'k':
					isAllowed = doesKnightMovementIsAllowed(origin, dest);
					break;
				case 'b':
					isAllowed = doesBishopMovementIsAllowed(origin, dest);
					break;
				case 'q':
					isAllowed = doesQueenMovementIsAllowed(origin, dest);
					break;
				case 's': // sovereign => king
					isAllowed = doesKingMovementIsAllowed(origin, dest);
					break;
				case 'p':
					isAllowed = doesPawnMovementIsAllowed(origin, dest, color);
					break;
			}

			return isAllowed;
		},

		/**
		 * @param  string pieceSelection
		 * @param  string pieceMovement
		 * @param  {x,y}  origin
		 * @param  {x,y}  dest
		 * @return boolean
		 */
		doesPawnTakesAPiece: function(pieceSelection, pieceMovement, origin, dest) {

			let isAllowed = false;
			let color = pieceSelection[0];

			if (doesPawnMoveToTakeAPiece(origin, dest, color)) {
				if (pieceMovement !== null) {
					if (pieceSelection[0] !== pieceMovement[0]) {
						isAllowed = true;
					}
				}
			}

			return isAllowed;
		},

		/**
		 * @param  array  pieces
		 * @param  string pieceSelection
		 * @param  string pieceMovement
		 * @param  {x,y}  origin
		 * @param  {x,y}  dest
		 * @return {x,y} | false
		 */
		doesPawnTakesAPieceWithEnPassant: function(pieces, pieceSelection, pieceMovement, origin, dest) {

			let pieceToTakePosition = false;
			let color = pieceSelection[0];

			if (doesPawnMoveToTakeAPiece(origin, dest, color)) {
				if (pieceMovement === null) {
					pieceToTakePosition = getPawnTakenPositionWithEnPassant(dest, color);
					let pieceToTake = pieces[pieceToTakePosition.y][pieceToTakePosition.x];
					if (pieceToTakePosition === null || pieceSelection[0] === pieceToTake[0]) {
						pieceToTakePosition = false;
					}
				}
			}

			return pieceToTakePosition;
		},

		doesPawnReachedTheBorder: function(piece, dest) {

			let color = piece[0];

			return doesPawnReachedTheBorder(dest , color);
		}
	}
	return scope;

})(Chess);
