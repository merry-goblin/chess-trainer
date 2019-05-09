/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function(chess) {

	chess.WorkerManager = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var self = null;

		var workerId     = 0;
		var worker       = null;
		var stateMachine = null;
		var callback     = null;

		/*** Private methods ***/

		function buildStateMachine() {

			let initialState = 'readyToLoad';
			let transitions = {
				startLoading:   { from: 'readyToLoad',  to: 'loading'   },
				endLoading:     { from: 'loading',      to: 'available' },
				startBrowsing:  { from: 'available',    to: 'browsing'  },
				endBrowsing:    { from: 'browsing',     to: 'available' }
			};

			stateMachine = new chess.FiniteStateMachine();
			stateMachine.init(initialState, transitions);
		}

		function buildWorker(workerScript, id, callback) {

			workerId = id;
			worker = new Worker(workerScript);
			worker.addEventListener('message', function(e) {
				switch (e.data.state) {
					case 'loaded':
						self.trigger('endLoading')
						break;
					case 'browsed':
						self.trigger('endBrowsing')
						break;
				}
				callback(e.data);
			});
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			stateMachine.destroy();

			settings      = null;
			worker        = null;
			stateMachine  = null;
			self          = null;
		}

		var scope = {

			/*** Public methods ***/

			init: function(workerScript, id, callback) {

				self = this;

				buildStateMachine();
				buildWorker(workerScript, id, callback);
			},

			getWorker: function() {

				return worker;
			},

			load: function() {

				if (self.trigger('startLoading')) {
					worker.postMessage({
						id: workerId,
						num: 0,
						action: 'load',
						params: null
					});
				}
			},

			browse: function(moveNumber, params) {

				if (self.trigger('startBrowsing')) {
					worker.postMessage({
						id: workerId,
						num: moveNumber,
						action: 'max',
						params: params
					});
				}
			},

			trigger: function(transition) {

				let result = false;

				if ((state = stateMachine.isTransitionValid(transition)) != null) {

					stateMachine.applyTransition(transition);
					result = true;
				}

				return result;
			},

			is: function(state) {

				return (stateMachine.getCurrentState() === state) ? true : false;
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

})(Chess);
