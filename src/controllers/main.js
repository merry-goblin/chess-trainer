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

		var pieces = null;

		/*** Private methods ***/

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

		function fillChessBoard(customChessBoard) {


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

		function handleAgents(whiteAgent, blackAgent) {

			agentManager = new chess.AgentManager();
			agentManager.init(self, whiteAgent, blackAgent);
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			stopLoop();

			graphicManager.destroy();
			stateManager.destroy();
			agentManager.destroy();

			graphicManager  = null;
			stateManager    = null;
			agentManager    = null;
			pieces          = null;
			self            = null;
		}

		var scope = {

			/*** Public methods ***/

			/**
			 * Load and init any resources
			 * return null
			 */
			init: function(whiteAgentKey, blackAgentKey, customChessBoard) {

				self = this;

				fillChessBoard(customChessBoard);

				handleGraphics();
				handleStates();
				handleAgents(whiteAgentKey, blackAgentKey);

				stateManager.trigger('startGame');
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
