/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function($, chess) {

	chess.AgentManager = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var controller = null;
		var whiteAgent = null;
		var blackAgent = null;

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
			},

			startGame: function() {

				
			},

			triggerClick(position) {

				
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
