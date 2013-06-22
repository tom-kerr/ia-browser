// jQuery WipeTouch 1.0.3
//
// Developed and maintained by Devv: http://devv.com
// This plugin is based on TouchWipe by Andreas Waltl: http://www.netcu.de
//
// USAGE
// $(selector).wipetouch(config);
//
// The wipe events should expect the result object with the following properties:
// speed - the wipe speed from 1 to 5
// x - how many pixels moved on the horizontal axis
// y - how many pixels moved on the vertical axis
//
// EXAMPLE
//		$(document).wipetouch({
//			allowDiagonal: true,
//			wipeLeft: function(result) { alert("Left on speed " + result.speed) },
//			wipeTopLeft: function(result) { alert("Top left on speed " + result.speed) },
//			wipeBottomLeft: function(result) { alert("Bottom left on speed " + result.speed) }
//		});
//
//
// More details at http://wipetouch.codeplex.com/

(function($)
{
	$.fn.wipetouch = function(settings)
	{
		// ------------------------------------------------------------------------
		// PLUGIN SETTINGS
		// ------------------------------------------------------------------------

		var config = {
			moveX:				30,		// minimum amount of horizontal pixels to trigger a wipe event
			moveY:				30,		// minimum amount of vertical pixels to trigger a wipe event
			preventDefault:		true,	// if true, prevents default events (click for example)
			allowDiagonal:		false,	// if false, will trigger horizontal and vertical movements only
										// so wipeTopLeft, wipeBottomLeft, wipeTopRight, wipeBottomRight are ignored)

			wipeLeft:			function(result) { },	// called on wipe left gesture
			wipeRight:			function(result) { },	// called on wipe right gesture
			wipeUp:				function(result) { },	// called on wipe up gesture
			wipeDown:			function(result) { },	// called on wipe down gesture
			wipeTopLeft:		function(result) { },	// called on wipe top and left gesture
			wipeBottomLeft:		function(result) { },	// called on wipe bottom and left gesture
			wipeTopRight:		function(result) { },	// called on wipe top and right gesture
			wipeBottomRight:	function(result) { }	// called on wipe bottom and right gesture
		};

		if (settings)
		{
			$.extend(config, settings);
		}

		this.each(function()
		{
			// ------------------------------------------------------------------------
			// INTERNAL VARIABLES
			// ------------------------------------------------------------------------
			var startX; // where touch has started, left
			var startY; // where touch has started, top
			var startDate = false; // used to calculate timing and aprox. acceleration
			var curX; // keeps touch X position while moving on the screen
			var curY; // keeps touch Y position while moving on the screen
			var isMoving = false; // is user touching and moving?

			// ------------------------------------------------------------------------
			// TOUCH EVENTS
			// ------------------------------------------------------------------------

			// Called when user touches the screen
			function onTouchStart(e)
			{
				if (!isMoving && e.touches.length > 0)
				{
					startDate = new Date().getTime();

					startX = e.touches[0].pageX;
					startY = e.touches[0].pageY;
					curX = startX;
					curY = startY;

					isMoving = true;

					this.addEventListener('touchmove', onTouchMove, false);
				}
			}

			// Called when user untouches the screen
			function onTouchEnd(e)
			{
				this.removeEventListener('touchmove', onTouchMove, false);

				touchCalculate();

				startX = false;
				startY = false;
				startDate = false;
				isMoving = false;
			}

			// Called when user is touching and moving on the screen
			function onTouchMove(e)
			{
				if (config.preventDefault)
				{
					e.preventDefault();
				}

				if (isMoving)
				{
					curX = e.touches[0].pageX;
					curY = e.touches[0].pageY;
				}
			}

			// ------------------------------------------------------------------------
			// CALCULATE TOUCH AND TRIGGER
			// ------------------------------------------------------------------------
			function touchCalculate()
			{
				var endDate = new Date().getTime();	// current date to calculate timing

				var x = curX;			// current left position
				var y = curY;			// current top position
				var dx = x - startX;	// diff of current left to starting left
				var dy = y - startY;	// diff of current top to starting top
				var ax = Math.abs(dx);	// amount of horizontal movement
				var ay = Math.abs(dy);	// amount of vertical movement

				var toright = dx > 0;	// if true X movement is to the right, if false is to the left
				var tobottom = dy > 0;	// if true Y movement is to the bottom, if false is to the top

				// calculate speed from 1 to 5, being 1 slower and 5 faster
				var s = ((ax + ay) * 99) / ((startDate - endDate) / 9 * (startDate - endDate));

				if (s < 1) s = 1;
				if (s > 5) s = 5;

				var result = {speed: s, x: ax, y: ay};

				if (ax >= config.moveX)
				{
					// Checks if it's allowed and call diagonal wipe events
					if (config.allowDiagonal && ay >= config.moveY)
					{
						if (toright && tobottom)
							triggerEvent(config.wipeBottomRight, result);
						else if (toright && !tobottom)
							triggerEvent(config.wipeTopRight, result);
						else if (!toright && tobottom)
							triggerEvent(config.wipeBottomLeft, result);
						else
							triggerEvent(config.wipeTopLeft, result);
					}
					else
					{
						if (toright)
							triggerEvent(config.wipeRight, result);
						else
							triggerEvent(config.wipeLeft, result);
					}
				}
				else if (ay >= config.moveY)
				{
					if (tobottom)
						triggerEvent(config.wipeDown, result);
					else
						triggerEvent(config.wipeTop, result);
				}
			}

			// Triggers a wipe event passing a result object with
			// speed from 1 to 5, and x / y movement amount in pixels
			function triggerEvent(wipeEvent, result)
			{
				wipeEvent(result);
			}

			// ------------------------------------------------------------------------
			// ADD TOUCHSTART AND TOUCHEND EVENT LISTENERS
			// ------------------------------------------------------------------------

			if ('ontouchstart' in document.documentElement)
			{
				this.addEventListener('touchstart', onTouchStart, false);
				this.addEventListener('touchend', onTouchEnd, false);
			}
		});

		return this;
	};
})(jQuery);
