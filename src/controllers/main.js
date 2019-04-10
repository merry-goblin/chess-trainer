/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function($, chess) {

	chess.Main = function(settings) {

		/*** Private properties ***/

		var self = null;
		var settings = $.extend({}, settings);

		var graphicManager = null;
		var stateManager   = null;
		var agentManager   = null;

		var interval = null;

		var playerTurn = "white";

		/*** Private methods ***/

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			stopLoop();
		}

		/**
		 * Application's main loop
		 * @return null
		 */
		function loop() {

			graphicManager.update();
		}

		/**
		 * Stop the application's main loop
		 * @return null
		 */
		function stopLoop() {
	
			clearInterval(interval);
		}

		function handleGraphics() {

			graphicManager = new chess.GraphicManager();
			graphicManager.init(self, "chess-board");

			// Set interval
			// Calculate next step from the chess board
			interval = setInterval(loop, chess.config.loopInterval);
		}

		function handleStates() {

			stateManager = new chess.StateManager();
			stateManager.init(self);
		}

		function handleAgents(whiteAgentKey, blackAgentKey) {

			agentManager = new chess.AgentManager();
			agentManager.init(whiteAgentKey, blackAgentKey);
		}

		var scope = {

			/*** Public methods ***/

			/**
			 * Load and init any resources
			 * return null
			 */
			init: function(whiteAgentKey, blackAgentKey) {

				self = this;

				handleGraphics();
				handleStates();
				handleAgents(whiteAgentKey, blackAgentKey);

				stateManager.startGame();
			},

			getGraphicManager: function() { return graphicManager; },
			getStateManager:   function() { return stateManager;   },
			getAgentManager:   function() { return agentManager;   },

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
