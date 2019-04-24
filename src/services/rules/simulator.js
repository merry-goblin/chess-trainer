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
		}

	}
	return scope;

})(Chess);
