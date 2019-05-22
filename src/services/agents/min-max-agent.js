/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function(chess) {

	chess.MinMaxAgent = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({
			depth: 2
		}, settings);

		var isActive = false;

		var agentColor = chess.colors.null;
		var roundIndex = 0;

		var callbackSelection = null;
		var callbackMovement  = null;

		var movement = null;

		var workers              = null;
		var numberOfWorkersReady = 0;

		var browsing = null;

		var startTime   = 0;
		var elapsedTime = 0;

		/*** Private methods ***/

		//	*** Workers ***

		/**
		 * @return null
		 */
		function initWorkers() {

			numberOfWorkersReady = 0;
			workers = new Array(chess.config.numberOfWorkers);
			for (let i=0; i<chess.config.numberOfWorkers; i++) {

				let workerManager = new Chess.WorkerManager();
				workerManager.init('src/services/agents/minmax/worker.js', i, messageFromWorker);
				workerManager.load();

				workers[i] = workerManager;
			}
		}

		function getAvailableWorkerId() {

			let workerId = null;

			for (let i=0; i<chess.config.numberOfWorkers; i++) {
				if (workers[i].is('available')) {
					workerId = i;
					break;
				}
			}

			return workerId;
		}

		function messageFromWorker(message) {

			switch (message.state) {
				case 'loaded':
					evalWorkerLoaded(message.id, message.num, message.state, message.response);
					break;
				case 'browsed':
					evalWorkerResponse(message.id, message.num, message.state, message.response);
					break;
			}
		}

		function evalWorkerLoaded(workerId, processNumber, state, value) {

			numberOfWorkersReady++;
			workers[workerId].state = state;
			if (isActive && numberOfWorkersReady >= chess.config.numberOfWorkers) {
				browse();
			}
		}

		function evalWorkerResponse(workerId, processNumber, state, value) {

			workers[workerId].state  = state;

			if (browsing.bestScore < value) {
				browsing.bestScore = value;
				browsing.bestMove  = processNumber;
			}

			//	Check if all moves have been evaluated
			browsing.numberOfEval++;
			if (browsing.numberOfEval === browsing.totalMoves) {

				//	End
				let move = searchMove(browsing.bestMove);

				window.setTimeout(function() {
					applyMove(move.origin, move.dest);
				}, 1000);

				elapsedTime = new Date().getTime() - startTime;
				console.log((elapsedTime/1000)+" secondes", "total moves: ", browsing.totalMoves);
			}
			else {
				browse();
			}
		}

		function prepareBrowsing(pieces, depth, color, round) {

			browsing = new chess.Browsing();

			browsing.pieces                    = pieces;
			browsing.depth                     = depth;
			browsing.color                     = color;
			browsing.round                     = round;
			browsing.bestScore                 = Number.NEGATIVE_INFINITY;
			browsing.bestMove                  = 0;
			browsing.alpha                     = Number.NEGATIVE_INFINITY;
			browsing.beta                      = Number.POSITIVE_INFINITY;
			browsing.currentMove               = 0;
			browsing.numberOfEval              = 0;
			browsing.availablePieces           = getAvailablePiecesPositions(pieces, color);
			browsing.availablePiecesMovements  = getAvailablePiecesMovements(pieces, round, browsing.availablePieces);
			browsing.end                       = false;

			//	Number of moves
			let count = 0;
			for (let p=0, nbPieces=browsing.availablePieces.length; p<nbPieces; p++) {
				count += browsing.availablePiecesMovements[p].length;
			}
			browsing.totalMoves = count;
		}

		/**
		 * We put available workers to work
		 * One worker evaluates one move
		 *
		 * @param  array[Chess.Piece] pieces
		 * @param  integer            depth
		 * @param  integer            color
		 * @param  integer            round
		 * @return null
		 */
		function browse() {

			simulation:
			while (browsing.currentMove < browsing.totalMoves) {

				//	Worker
				let workerId = getAvailableWorkerId();
				if (workerId === null) {
					break simulation;
				}

				//	Move
				let move = searchMove(browsing.currentMove);

				let params = { 
					pieces: browsing.pieces, 
					depth: browsing.depth, 
					color: browsing.color, 
					round: browsing.round, 
					origin: move.origin, 
					dest: move.dest, 
					alpha: browsing.alpha, 
					beta: browsing.beta
				};
				workers[workerId].browse(browsing.currentMove, params);

				browsing.currentMove++;
			}
		}

		//	*** Simulator ***

		function getAvailablePiecesPositions(pieces, color) {

			let availablePieces = chess.simulator.allAvailablePiecesPositions(pieces, color);

			return availablePieces;
		}

		function getAvailablePiecesMovements(pieces, round, availablePieces) {

			let availablePiecesMovements = new Array();
			for (let i=0, nb=availablePieces.length; i<nb; i++) {

				let availablePieceMovement = chess.simulator.allPieceMoves(pieces, availablePieces[i], round);
				availablePiecesMovements.push(availablePieceMovement);
			}

			return availablePiecesMovements;
		}

		function searchMove(numero) {

			let count = 0;

			let origin;
			let dest;

			let availablePieces       = browsing.availablePieces;
			let availablePiecesMoves  = browsing.availablePiecesMovements;

			simulation:
			for (let p=0, nbPieces=availablePieces.length; p<nbPieces; p++) {

				//	We iterate through an array only if currentMove is in this array
				let nbMoves=availablePiecesMoves[p].length;
				if (numero < count+nbMoves) {

					origin = availablePieces[p];
					for (let m=0; m<nbMoves; m++) {

						if (count === numero) {
							dest = availablePiecesMoves[p][m];
							break simulation;
						}
						count++;
					}
				}
				else {
					count += nbMoves;
				}
			}

			return {
				origin: origin,
				dest: dest
			};
		}

		function applyMove(origin, dest) {

			movement = dest;
			callbackSelection(origin);
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			settings          = null;
			callbackSelection = null;
			callbackMovement  = null;
		}

		var scope = {

			/*** Public methods ***/

			init: function(colorParam) {

				agentColor = colorParam;
				initWorkers();
			},

			activate: function(roundIndexParam) {

				isActive = true;
				roundIndex = roundIndexParam;
			},

			desactivate: function() {

				isActive = false;
			},

			//	AI only
			playSelection: function(pieces) {

				startTime = new Date().getTime();
				elapsedTime = 0;

				//	Prepare tree search browsing for workers
				prepareBrowsing(pieces, settings.depth, agentColor, roundIndex);

				//	Start iteration of tree by available workers
				browse();
			},

			//	AI only
			playMovement: function(pieces) {

				callbackMovement(movement);
			},

			setFunctionToTriggerEvents: function(callbackSelectionParam, callbackMovementParam) {

				callbackSelection = callbackSelectionParam;
				callbackMovement  = callbackMovementParam;
			},

			//	Human only
			pieceSelection: function(position) {},

			//	Human only
			caseMovement: function(position) {},

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

})(Chess);
