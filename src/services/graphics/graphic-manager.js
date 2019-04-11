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
			king: 1,
			queen: 2,
			bishop: 3,
			rook: 4,
			knight: 5,
			pawn: 6,
		}

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
				controller.triggerClick(position);
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

			layer.addChild(sprite);

			return sprite;
		}

		function createPieceOnCase(x, y, frame, offset, title) {

			let element  = createPiece(x, y, frame, offset, title);
			pieces[y][x] = element;
		}

		function createRoyaltyRow(isWhite) {

			let y       = (isWhite) ? 7 : 0;
			let offset  = (isWhite) ? 1 : 0;
			let color   = (isWhite) ? "white" : "black";

			createPieceOnCase(0, y, frames['rook'], offset, "left "+color+" rook");
			createPieceOnCase(1, y, frames['knight'], offset, "left "+color+" knight");
			createPieceOnCase(2, y, frames['bishop'], offset, "left "+color+" bishop");
			createPieceOnCase(3, y, frames['queen'], offset, color+" queen");
			createPieceOnCase(4, y, frames['king'], offset, color+" king");
			createPieceOnCase(5, y, frames['bishop'], offset, "right "+color+" bishop");
			createPieceOnCase(6, y, frames['knight'], offset, "right "+color+" knight");
			createPieceOnCase(7, y, frames['rook'], offset, "right "+color+" rook");
		}

		function createPawnRow(isWhite) {

			let y       = (isWhite) ? 6 : 1;
			let offset  = (isWhite) ? 1 : 0;
			let color   = (isWhite) ? "white" : "black";

			for (let i=0; i<8; i++) {
				createPieceOnCase(i, y, frames['pawn'], offset, color+" pawn "+Number(i+1));
			}
		}

		function createPieces() {

			pieces = new Array(8);
			for (var i=0; i<8; i++) {
				pieces[i] = [null, null, null, null, null, null, null, null];
			}

			createRoyaltyRow(false);
			createRoyaltyRow(true);
			createPawnRow(false);
			createPawnRow(true);
		}

		function erasePieces() {

			for (var y=0; y<8; y++) {
				for (var x=0; x<8; x++) {
					let piece = pieces[y][x];
					if (piece != null) {
						piece.remove();
					}
				}
			}
		}

		function movePiece(x1, y1, x2, y2) {

			//	Positions must be in chessboard
			if (x1 < 0 || x1 >= 8 ||
				y1 < 0 || y1 >= 8 ||
				x2 < 0 || x2 >= 8 ||
				y2 < 0 || y2 >= 8) {
				throw "Out of chessboard";
			}

			//	Position 1 must contain a piece
			if (pieces[y1][x1] == null) {
				throw "Not a valid origin";
			}

			//	Position 2 must be empty
			if (pieces[y2][x2] != null) {
				throw "Not a valid destination";
			}

			let piece = pieces[y1][x1];
			piece.x = x2*frameSize;
			piece.y = y2*frameSize;

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

			settings = null;
			controller = null;
			canvas = null;

			if (layer != null) {
				layer.remove();
			}
			layer = null;
			board = null;
			pieces = null;
		}

		var scope = {

			/*** Public methods ***/

			/**
			 * Build a whole new world
			 * @param string worldId
			 */
			init: function(ctrl, id) {

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

			movePiece: function(x1, y1, x2, y2) {

				movePiece(x1, y1, x2, y2);
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
