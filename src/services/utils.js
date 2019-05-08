/**
 * Ex: 
 * let random = Life.utils.getRandomInteger(0, 9);
 * console.log(random);
 *
 * @static
 * @class
 * @author Alexandre Keller
 * @since 2017
 */

/** @namespace */
var Chess = Chess || {};

Chess.utils = (function(chess) {

	/*** Private static properties ***/

	var columnLabels = {
		'a': 0,
		'b': 1,
		'c': 2,
		'd': 3,
		'e': 4,
		'f': 5,
		'g': 6,
		'h': 7
	};

	var typeLabels = {
		'k': chess.types.king,
		'q': chess.types.queen,
		'b': chess.types.bishop,
		'r': chess.types.rook,
		'n': chess.types.knight,
		'p': chess.types.pawn
	};

	var colorLabels = {
		'w': chess.colors.white,
		'b': chess.colors.black
	};

	var scope = {

		/**
		 * @param  string chessPos
		 * @return object
		 */
		convertToArrayPosition: function(pos) {

			let x = Number(columnLabels[pos[0]]);
			let y = 7 - Number(pos[1]) + 1;

			return {
				x: x,
				y: y
			}
		},

		/**
		 * @param  string chessPos
		 * @return object
		 */
		convertType: function(typeLabel) {

			let type = Number(typeLabels[typeLabel]);

			return type;
		},

		/**
		 * @param  string chessPos
		 * @return object
		 */
		convertColor: function(colorLabel) {

			let color = Number(colorLabels[colorLabel]);

			return color;
		},

		copyArray: function(arr) {

			return JSON.parse(JSON.stringify(arr));
		},

		switchColor: function(color) {

			return (color === chess.colors.white) ? chess.colors.black : chess.colors.white;
		},

		compareArrays: function(array1, array2) {

			array1.sort();
			array2.sort();

			return (
				array1.length === array2.length && 
				array1.every(function(value, index) { 
					return value === array2[index];
				})
			);
		},

		compareSortedArrays: function(array1, array2) {

			let result = false;

			if (array1.length === array2.length) {
				result = true;
				for (let i=0, nb=array1.length; i<nb; i++) {
					if (array1[i] !== array2[i]) {
						result = false;
						break;
					}
				}
			}

			return result;
		},

		getRandomInt: function(min, max) {

			min = Math.ceil(min);
			max = Math.floor(max);

			return Math.floor(Math.random() * (max - min)) + min;
		}
	}
	return scope;

})(Chess);
