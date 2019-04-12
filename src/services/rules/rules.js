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
		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesKnightMovementIsAllowed(origin, dest) {

		let isAllowed = false;
		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesBishopMovementIsAllowed(origin, dest) {

		let isAllowed = false;
		let stepX = dest.x - origin.x;
		let stepY = dest.y - origin.y;
		if (stepX != 0) {
			if (stepX == stepY || stepX == (stepY*-1)) {
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
		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesKingMovementIsAllowed(origin, dest) {

		let isAllowed = false;
		return isAllowed;
	}

	/**
	 * @param  {x,y}  origin
	 * @param  {x,y}  dest
	 * @return boolean
	 */
	function doesPawnMovementIsAllowed(origin, dest, color) {

		let isAllowed = false;
		if (origin.x == dest.x) {
			let factor = (color == 'b') ? 1 : -1;
			let step   = (dest.y-origin.y) * factor;
			if (step == 1) {
				isAllowed = true;
			}
			else if (step == 2) {
				if ((color == 'w' && origin.x == 6) || (color == 'b' && origin.x == 1)) {
					isAllowed = true;
				}
			}
		}

		return false;
	}

	var scope = {

		/*** Public static methods ***/

		/**
		 * Check if the movement is allowed in an empty chessboard.
		 * Capture is not tested in this function, if false is returned
		 * it doesn't mean that the movement isn't allowed
		 * 
		 * @param  string piece  [possible values : r|k|b|q|k|p]
		 * @param  {x,y}  origin
		 * @param  {x,y}  dest
		 * @return boolean
		 */
		doesPieceMovementIsAllowed: function(piece, origin, dest) {

			let type  = piece[1];
			let color = piece[0];

			switch (type) {
				case 'r':
					doesRookMovementIsAllowed(origin, dest);
					break;
				case 'k':
					doesKnightMovementIsAllowed(origin, dest);
					break;
				case 'b':
					doesBishopMovementIsAllowed(origin, dest);
					break;
				case 'q':
					doesQueenMovementIsAllowed(origin, dest);
					break;
				case 'k':
					doesKingMovementIsAllowed(origin, dest);
					break;
				case 'p':
					doesPawnMovementIsAllowed(origin, dest, color);
					break;
			}
		}
	}
	return scope;

})(Chess);
