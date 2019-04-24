/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.Change = function() {

	this.isAllowed         = false;
	this.opponentIsInCheck = false;
	this.checkmate         = false; // 'w'|'b'
	this.move              = new Array();
	this.remove            = new Array();
};
