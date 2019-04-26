/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.Change = function() {

	this.isAllowed             = false;
	this.opponentIsInCheck     = false;
	this.opponentIsInCheckmate = false;
	this.draws                 = false;
	this.move                  = new Array();
	this.remove                = new Array();
};
