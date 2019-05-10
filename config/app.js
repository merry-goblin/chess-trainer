
/** @namespace */
var Chess = Chess || {};

Chess.config = {
	loopInterval: 1000,
	numberOfWorkers: 8,
	defaultModel: {
		a1: 'wr',
		b1: 'wn',
		c1: 'wb',
		d1: 'wq',
		e1: 'wk',
		f1: 'wb',
		g1: 'wn',
		h1: 'wr',

		a2: 'wp',
		b2: 'wp',
		c2: 'wp',
		d2: 'wp',
		e2: 'wp',
		f2: 'wp',
		g2: 'wp',
		h2: 'wp',

		a7: 'bp',
		b7: 'bp',
		c7: 'bp',
		d7: 'bp',
		e7: 'bp',
		f7: 'bp',
		g7: 'bp',
		h7: 'bp',

		a8: 'br',
		b8: 'bn',
		c8: 'bb',
		d8: 'bq',
		e8: 'bk',
		f8: 'bb',
		g8: 'bn',
		h8: 'br'
	},
	counter: 0
}
