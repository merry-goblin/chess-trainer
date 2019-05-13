/**
 * @worker
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

Chess.MinMaxWorker = {

	load: function(params) {

		importScripts('../../../../config/app.js');
		importScripts('../../../../config/constants.js');
		importScripts('../../../entities/change.js');
		importScripts('../../../entities/move.js');
		importScripts('../../../entities/piece.js');
		importScripts('../../../entities/position.js');
		importScripts('../../utils.js');
		importScripts('../../rules/rules.js');
		importScripts('../../rules/simulator.js');
		importScripts('algorithm.js');

		return null;
	},

	max: function(params) {
		let value = Chess.minMaxAlgorithm.maxIteration(params.pieces, params.depth, params.color, params.round, params.origin, params.dest);
//console.log("counter: ", Chess.config.counter, "value: ", value, "origin: ", params.origin, "dest: ", params.dest);Chess.config.counter = 0;
		return value;
	}
};

self.addEventListener('message', function(e) {

	let action        = e.data.action;
	let workerId      = e.data.id;
	let processNumber = e.data.num;
	let params        = e.data.params;

	switch (action) {
		case 'load':
			Chess.MinMaxWorker.load(params);
			self.postMessage({
				id: workerId,
				state: 'loaded',
				response: true
			});
			break;
		case 'max':
			let max = Chess.MinMaxWorker.max(params);
			self.postMessage({
				id: workerId,
				num: processNumber,
				state: 'browsed',
				response: max
			});
			break;
	}
});
