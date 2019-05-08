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
		var ruleManager    = null;

		var interval = null;

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

		function fillChessboard(customModel) {

			let model = (customModel != null) ? customModel : chess.config.defaultModel;

			initChessboard();
			fillChessboardWithModel(model);
		}

		function initChessboard() {

			self.pieces = new Array(8);
			for (var i=0; i<8; i++) {
				self.pieces[i] = [null, null, null, null, null, null, null, null];
			}
		}

		function fillChessboardWithModel(model) {

			for (positionLabel in model) {
				let pos    = chess.utils.convertToArrayPosition(positionLabel);
				let piece  = createPiece(model[positionLabel]);

				self.pieces[pos.y][pos.x] = piece;
			}
		}

		function createPiece(label) {

			let piece = new chess.Piece();

			piece.color = chess.utils.convertColor(label[0]);
			piece.type  = chess.utils.convertType(label[1]);
			piece.last  = 0;

			return piece;
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

		function handleRules() {

			ruleManager = new chess.RuleManager();
			ruleManager.init(self);
		}

		function eventRegistering() {

			stateManager.initEventRegistering();
			ruleManager.initEventRegistering();
			agentManager.initEventRegistering();
			graphicManager.initEventRegistering();
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
			ruleManager.destroy();

			graphicManager  = null;
			stateManager    = null;
			agentManager    = null;
			ruleManager     = null;
			self.pieces     = null;
			self            = null;
		}

		var scope = {

			/*** Public properties ***/

			pieces: null,

			/*** Public methods ***/

			/**
			 * Load and init any resources
			 * return null
			 */
			init: function(whiteAgentKey, blackAgentKey, customModel) {

				self = this;

				fillChessboard(customModel);

				handleStates();
				handleRules();
				handleAgents(whiteAgentKey, blackAgentKey);
				handleGraphics();

				eventRegistering();

				stateManager.trigger('startGame');
			},

			getCopyOfPieces: function() {

				return chess.utils.copyArray(this.pieces);
			},

			getStateManager:   function() { return stateManager;   },
			getRuleManager:    function() { return ruleManager;    },
			getAgentManager:   function() { return agentManager;   },
			getGraphicManager: function() { return graphicManager; },

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
