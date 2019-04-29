/**
 * @class
 * @author Alexandre Keller
 * @since 2019
 */

/** @namespace */
var Chess = Chess || {};

(function(chess) {

	chess.PlayerAgent = function(settings) {

		/*** Private properties ***/

		var settings = $.extend({}, settings);

		var color = null;

		var callbackSelection = null;
		var callbackMovement  = null;

		/*** Private methods ***/

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

				color = colorParam;
			},

			activate: function() {

			},

			desactivate: function() {

			},

			//	AI only
			playSelection: function() {


			},

			//	AI only
			playMovement: function() {


			},

			setFunctionToTriggerEvents: function(callbackSelectionParam, callbackMovementParam) {

				callbackSelection = callbackSelectionParam;
				callbackMovement  = callbackMovementParam;
			},

			//	The agent manager informs of a click on a piece during the waitSelection state.
			//	It's up the agent to decide if it does something with this mouse click or not.
			//	If it is an AI it will be ignored. If it is a humand being, it will be handle.
			pieceSelection: function(position) {

				callbackSelection(position);
			},

			//	The agent manager informs of a click on a case during the waitMovement state.
			//	It's up the agent to decide if it does something with this mouse click or not.
			//	If it is an AI it will be ignored. If it is a humand being, it will be handle.
			caseMovement: function(position) {

				callbackMovement(position);
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
