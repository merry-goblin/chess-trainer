/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.MinMaxConfiguration = function(pruneThresholdParam) {

	this.pruneThreshold = pruneThresholdParam;
};
