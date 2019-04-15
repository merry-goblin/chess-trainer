/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.Piece = function() {

	this.color = null;
	this.type  = null;
	this.last  = null; // Index of last move
};
