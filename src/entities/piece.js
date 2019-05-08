/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.Piece = function() {

	this.color     = Chess.colors.null;
	this.type      = Chess.types.null;
	this.last      = 0; // Index of last move
	this.hasRushed = false;
};
