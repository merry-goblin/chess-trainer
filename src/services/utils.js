/**
 * Ex: 
 * var random = Life.utils.getRandomInteger(0, 9);
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

	var labels = {
		'a': 0,
		'b': 1,
		'c': 2,
		'd': 3,
		'e': 4,
		'f': 5,
		'g': 6,
		'h': 7
	};

	var scope = {

		/**
		 * @param  string chessPos
		 * @return object
		 */
		convertToArrayPosition: function(pos) {

			let x = Number(labels[pos[0]]);
			let y = 7 - Number(pos[1]) + 1;

			return {
				x: x,
				y: y
			}
		},

		copyArray(arr) {

			return JSON.parse(JSON.stringify(arr));
		},

		switchColor(color) {

			return (color === 'w') ? 'b' : 'w';
		},

		compareArrays(array1, array2) {

			array1.sort();
			array2.sort();

			return (
				array1.length === array2.length && 
				array1.every(function(value, index) { 
					return value === array2[index];
				})
			);
		}
	}
	return scope;

})(Chess);
