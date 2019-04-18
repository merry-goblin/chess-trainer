Chess trainer
========================

[Github](https://github.com/merry-goblin/chess-trainer)

### Purpose

It is a digital version of the well known chess game.

### Easy to install

git clone merry-goblin/chess-trainer

open index.html in a web browser to start playing

### SampleCustom placement of pieces

**/index.html :**
```
<script src="./vendor/jquery/jquery-3.3.0.min.js"></script>
<script src="./vendor/ocanvas/ocanvas-2.10.0.js"></script>
<script src="./config/app.js"></script>
<script src="./src/entities/piece.js"></script>
<script src="./src/services/utils.js"></script>
<script src="./src/services/graphics/graphic-manager.js"></script>
<script src="./src/services/rules/rule-manager.js"></script>
<script src="./src/services/rules/rules.js"></script>
<script src="./src/services/states/state-manager.js"></script>
<script src="./src/services/states/finite-state-machine.js"></script>
<script src="./src/services/agents/agent-manager.js"></script>
<script src="./src/services/agents/player-agent.js"></script>
<script src="./src/controllers/main.js"></script>

<script>

	(function($, chess) {

		let whiteAgent  = new chess.PlayerAgent();
		let blackAgent  = new chess.PlayerAgent();
		let customModel = null;

		var mainController = new chess.Main();
		mainController.init(whiteAgent, blackAgent, customModel);

	})(jQuery, Chess);

</script>
```

### Sample (Custom placement of pieces)

**/index.html :**
```
<script>

	(function($, chess) {

		let whiteAgent  = new chess.PlayerAgent();
		let blackAgent  = new chess.PlayerAgent();
		//	Lucena position
		let customModel = {
			c1: 'br',
			g6: 'bk',

			d7: 'wp',
			d8: 'wk',
			f2: 'wr',
		};

		var mainController = new chess.Main();
		mainController.init(whiteAgent, blackAgent, customModel);

	})(jQuery, Chess);

</script>
```

### Available agents

- PlayerAgent : use click mouse on pieces to be triggered
