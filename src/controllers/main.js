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

		var graphics = null;
		var stateManager = null;

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

			graphics.update();
		}

		/**
		 * Stop the application's main loop
		 * @return null
		 */
		function stopLoop() {
	
			clearInterval(interval);
		}

		function handleGraphics() {

			graphics = new chess.Graphics();
			graphics.init(self, "chess-board");

			// Set interval
			// Calculate next step from the chess board
			interval = setInterval(loop, chess.config.loopInterval);
		}

		function handleUI() {

			$("#chess-board").click(function(e) {
				let x = e.pageX - $("#chess-board").offset().left;
				let y = e.pageY - $("#chess-board").offset().top;
			});
		}

		function handleStates() {

			stateManager = new chess.StateManager();
			stateManager.init(self);
		}

		var scope = {

			/*** Public methods ***/

			/**
			 * Load and init any resources
			 * return null
			 */
			init: function(whiteAgent, blackAgent) {

				self = this;

				handleGraphics();
				handleUI();
				handleStates();

				stateManager.startGame();
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
