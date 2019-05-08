/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.Browsing = function() {

	this.pieces                    = null;
	this.depth                     = 0;
	this.color                     = 0;
	this.round                     = 0;
	this.bestScore                 = Number.NEGATIVE_INFINITY;
	this.bestMove                  = 0;
	this.currentMove               = 0;
	this.numberOfEval              = 0;
	this.availablePieces           = null;
	this.availablePiecesMovements  = null;
	this.totalMoves                = 0;
};
