/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function($, chess) {

	chess.StateManager = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var controller   = null;
		var stateMachine = null;

		/*** Private methods ***/

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			
		}

		var scope = {

			/*** Public methods ***/

			init: function(controllerParam) {

				controller = controllerParam;

				stateMachine = new chess.FiniteStateMachine();
				stateMachine.init();
			},

			startGame: function() {

				if (stateMachine.applyTransition("startGame")) {


				}
			},

			/**
			 * Use this when Destroying this object in order to prevent for memory leak
			 * @return null
			 */
			destruct: function() {

				cleanMemory();
			}
		}
		return scope;
	}

})(jQuery, Chess);
