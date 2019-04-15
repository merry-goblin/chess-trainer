/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function($, chess) {

	chess.GraphicManager = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var self = null;

		var controller   = null;
		var chessboardId = null;

		var canvas       = null;
		var boardWith    = 0;
		var boardHeight  = 0;
		var caseSize     = null;

		var layer  = null;
		var board  = null;
		var pieces = null;

		var ratio = 1;
		var frameSize = 100; 
		var frames = {
			s: 1,
			q: 2,
			b: 3,
			r: 4,
			k: 5,
			p: 6,
		};

		/*** Private methods ***/

		function initOCanvas() {

			var boardDomElement = document.getElementById(chessboardId);
			caseSize = boardDomElement.width / 8;
			ratio = caseSize/frameSize;
			canvas = oCanvas.create({
				canvas: boardDomElement,
				background: "#fff"
			});

			layer = buildNeutralElement();
			layer.scale(ratio, ratio);
			canvas.addChild(layer);
		}

		function initUI() {

			$("#"+chessboardId).click(function(e) {
				let x = e.pageX - $("#chess-board").offset().left;
				let y = e.pageY - $("#chess-board").offset().top;

				let position = calculatePiecePosition(x, y);
				controller.getAgentManager().triggerClick(position);
			});
		}

		function calculatePiecePosition(realX, realY) {

			let x = Math.floor(realX / caseSize);
			let y = Math.floor(realY / caseSize);

			return {
				x: x,
				y: y
			};
		}

		function buildNeutralElement() {

			var neutralElement = canvas.display.rectangle({
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				fill: "transparent"
			});

			return neutralElement;
		}

		function createCase(x, y, fill) {

			rect = canvas.display.rectangle({
				x: x*frameSize,
				y: y*frameSize,
				width: frameSize,
				height: frameSize,
				fill: fill
			});

			board.addChild(rect);
		}

		function createDarkOrBrightCase(x, y, evenOdd) {

			if (evenOdd) {
				createCase(x, y, "#fff");
			}
			else {
				createCase(x, y, "#000");
			}
		}

		function createChessBoard() {

			//	Ocanvas element
			board = buildNeutralElement();
			layer.addChild(board);

			//	Squares
			let evenOdd = true;
			for (var y=0; y<8; y++) {
				for (var x=0; x<8; x++) {
					createDarkOrBrightCase(x, y, evenOdd);
					evenOdd = !evenOdd;
				}
				evenOdd = !evenOdd;
			}
		}

		function createPiece(x, y, frame, offset, title) {

			let sprite = canvas.display.sprite({
				x: x*frameSize,
				y: y*frameSize,
				image: "assets/svg/chess-pieces.svg",
				generate: true,
				width: frameSize,
				height: frameSize,
				direction: "x",
				frame: frame,
				offset_y: offset*frameSize,
				title: title
			});

			board.addChild(sprite);

			return sprite;
		}

		function createPieceOnCase(x, y, frame, offset, title) {

			let element  = createPiece(x, y, frame, offset, title);
			pieces[y][x] = element;
		}

		function createPieces() {

			pieces = new Array(8); // init
			let piecesPositions = controller.pieces;

			for (let y=0; y<8; y++) {
				pieces[y] = [null, null, null, null, null, null, null, null]; // init
				for (let x=0; x<8; x++) {
					let piece = piecesPositions[y][x];
					if (piece !== null) {
						let frame   = frames[piece.type];
						let offset  = (piece.color === 'w') ? 1 : 0;
						createPieceOnCase(x, y, frame, offset, piece);
					}
				}
			}
		}

		function removePiece(x,y) {

			if (piece !== null) {
				piece.remove();
				pieces[y][x] = null;
			}
		}

		function erasePieces() {

			for (var y=0; y<8; y++) {
				for (var x=0; x<8; x++) {
					let piece = pieces[y][x];
					if (piece !== null) {
						piece.remove();
						pieces[y][x] = null;
					}
				}
			}
		}

		function movePiece(x1, y1, x2, y2, type) {

			//	Positions must be in chessboard
			if (x1 < 0 || x1 >= 8 ||
				y1 < 0 || y1 >= 8 ||
				x2 < 0 || x2 >= 8 ||
				y2 < 0 || y2 >= 8) {
				throw "Out of chessboard";
			}

			//	Position 1 must contain a piece
			if (pieces[y1][x1] === null) {
				throw "Not a valid origin";
			}

			//	Position 2 must be empty
			if (pieces[y2][x2] !== null) {
				throw "Not a valid destination";
			}

			let piece = pieces[y1][x1];
			let x = x2*frameSize;
			let y = y2*frameSize;

			//	A lucky pawn become a beautiful queen 
			if (type !== null) {
				let newPiece = piece.clone({
					frame: 2
				})
				board.removeChild(piece);
				board.addChild(newPiece);
				piece = newPiece;
			}

			piece.x = x;
			piece.y = y;

			pieces[y2][x2] = piece;
			pieces[y1][x1] = null;
		}

		function removePiece(x, y) {

			//	Positions must be in chessboard
			if (x < 0 || x >= 8 ||
				y < 0 || y >= 8) {
				throw "Out of chessboard";
			}

			//	Position 1 must contain a piece
			if (pieces[y][x] == null) {
				throw "Not a valid origin";
			}

			let piece = pieces[y][x];
			piece.remove();

			pieces[y][x] = null;
		}

		/**
		 * Free any pointer stored on this object
		 * @return null
		 */
		function cleanMemory() {

			if (layer != null) {
				layer.remove();
			}

			settings    = null;
			controller  = null;
			canvas      = null;
			layer       = null;
			board       = null;
			pieces      = null;
			self        = null;
		}

		var scope = {

			/*** Public methods ***/

			/**
			 * Build a whole new world
			 * @param string worldId
			 */
			init: function(ctrl, id) {

				self = this;

				controller = ctrl;
				chessboardId = id;

				initOCanvas();

				createChessBoard();
				createPieces();

				initUI();

				this.update();
			},

			clear: function() {

				erasePieces();
				createPieces();

				this.update();
			},

			movePiece: function(x1, y1, x2, y2, type) {

				movePiece(x1, y1, x2, y2, type);
			},

			removePiece: function(x, y) {

				removePiece(x, y);
			},

			debug: function() {

				console.log(pieces);
			},

			update: function() {

				canvas.redraw();
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
