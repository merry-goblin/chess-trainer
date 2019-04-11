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

		var self = null;

		var controller = null;
		var whiteAgent = null;
		var blackAgent = null;

		/*** Private methods ***/

		function registerOnEvents() {

			let stateManager = controller.getStateManager();
			stateManager.register('before', 'agentInitialized', [self, 'beforeAgentInitialized']);
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			
		}

		var scope = {

			/*** Public methods ***/

			init: function(controllerParam, whiteAgentParam, blackAgentParam) {

				self = this;

				controller = controllerParam;
				whiteAgent = whiteAgentParam;
				blackAgent = blackAgentParam;

				registerOnEvents();
			},

			beforeAgentInitialized: function() {

				console.log("agentManager.beforeAgentInitialized()");
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
