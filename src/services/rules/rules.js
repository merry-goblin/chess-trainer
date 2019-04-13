/**
 * @static
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.rules = (function(chess) {

	function getSteps(origin, dest) {

		return {
			x: dest.x - origin.x,
			y: dest.y - origin.y,
		}
	}

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

	var scope = {

		/*** Public static methods ***/

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
