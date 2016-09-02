// Copyright 2016 Classadoo
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview JavaScript for Blockly's Heroes application.
 * @author drewheine@gmail.com
 */
'use strict';

goog.provide('Heroes');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Items');
goog.require('Slider');
goog.require('Heroes.Blocks');
goog.require('Heroes.soy');

BlocklyGames.NAME = 'heroes';

/**
 * Go to the next level.
 */
BlocklyInterface.nextLevel = function() {
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    window.location = window.location.protocol + '//' +
        window.location.host + window.location.pathname +
        '?lang=' + BlocklyGames.LANG + '&level=' + (BlocklyGames.LEVEL + 1);
  } else {
    BlocklyInterface.indexPage();
  }
};

Heroes.HEIGHT = 400;
Heroes.WIDTH = 600;

/**
 * PID of animation task currently executing.
 * @type !Array.<number>
 */
Heroes.pidList = [];

/**
 * Number of milliseconds that execution should delay.
 * @type number
 */
Heroes.pause = 0;

/**
 * JavaScript interpreter for executing program.
 * @type Interpreter
 */
Heroes.interpreter = null;

/**
 * Should the heroes be drawn?
 * @type boolean
 */
Heroes.visible = true;

Heroes.setBackground = function(style, id)
{
  Heroes.background = Heroes.backgrounds[style];
  Heroes.animate(id);
}

Heroes.setHero = function(hero, id)
{
  Heroes.hero = Heroes.heroes[hero];
  Heroes.animate(id);
}

/**
 * Initialize Blockly and the heroes.  Called on page load.
 */
Heroes.init = function() {

    Heroes.backgrounds = {};
    Heroes.backgrounds["castle"] = new Image();
    Heroes.backgrounds["castle"].src = "heroes/castle.jpg";
    Heroes.backgrounds["cats"] = new Image();
    Heroes.backgrounds["cats"].src = "heroes/cats.png";
    Heroes.backgrounds["desert"] = new Image();
    Heroes.backgrounds["desert"].src = "heroes/desert.jpg";
    Heroes.backgrounds["space"] = new Image();
    Heroes.backgrounds["space"].src = "heroes/space.jpg";
    Heroes.backgrounds["village"] = new Image();
    Heroes.backgrounds["village"].src = "heroes/village.jpg";

    Heroes.heroes = {};
    Heroes.heroes["eagle"] = new Image();
    Heroes.heroes["eagle"].src = "heroes/eagle.png";
    Heroes.heroes["lion"] = new Image();
    Heroes.heroes["lion"].src = "heroes/lion.png";

  // Render the Soy template.
  document.body.innerHTML = Heroes.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  var rtl = BlocklyGames.isRtl();
  var myBlocklyDiv = document.getElementById('my_blockly');
  var teacherBlocklyDiv = document.getElementById('teacher_blockly');
  var teacherLabelDiv = document.getElementById('teacher_label');
  var teacherCanvasDiv = document.getElementById('teacher_canvas');
  var toggleTeacherBlocks = document.getElementById('toggleTeacherBlocks');
  var visualization = document.getElementById('visualization');

  var teacherBlocksHidden = false;
  var onresize = function(e) {
    var height = teacherBlocksHidden ? window.innerHeight - 100 : window.innerHeight/2 - 50;
    var top = Math.max(10, visualization.offsetTop - window.pageYOffset);
    var width = window.innerWidth - 640;

    myBlocklyDiv.style.top =  top + 'px';
    myBlocklyDiv.style.left = rtl ? '10px' : '620px';
    myBlocklyDiv.style.width = width + 'px';
    myBlocklyDiv.style.height = height + 'px';

    teacherCanvasDiv.style.top = height + top + 5 + 'px';
    teacherCanvasDiv.style.left = rtl ? '10px' : '620px';
    teacherBlocklyDiv.style.width =  width + 'px';
    teacherBlocklyDiv.style.height = (teacherBlocksHidden ? 0 : height) + 'px';
  };
  window.addEventListener('scroll', function() {
    onresize();
    Blockly.svgResize(BlocklyGames.workspace)
  });
  window.addEventListener('resize', onresize);
  onresize();

  toggleTeacherBlocks.addEventListener("click", function()
    {
      teacherBlocksHidden = !teacherBlocksHidden;
      toggleTeacherBlocks.textContent = teacherBlocksHidden ? "Show" : "Hide"
      onresize();
      Blockly.svgResize(BlocklyGames.workspace)
    });

  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    Blockly.FieldColour.COLUMNS = 3;
    Blockly.FieldColour.COLOURS =
        ['#ff0000', '#ffcc33', '#ffff00',
         '#009900', '#3333ff', '#cc33cc',
         '#ffffff', '#999999', '#000000'];
  }

  var toolbox = document.getElementById('toolbox');
  BlocklyGames.workspace = Blockly.inject('my_blockly',
      {'media': 'third-party/blockly/media/',
       'rtl': rtl,
       'toolbox': toolbox,
       'trashcan': true,
       'zoom': BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL ?
           {'controls': true, 'wheel': true} : null});
   BlocklyGames.teacher_workspace = Blockly.inject('teacher_blockly',
       {'media': 'third-party/blockly/media/',
        'readOnly' : true,
        'rtl': rtl,
        'zoom': BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL ?
            {'controls': true, 'wheel': true} : null});

  initStudentWilddog( "Heroes", BlocklyGames.workspace, BlocklyGames.teacher_workspace );
  BlocklyGames.workspace.traceOn(true);
  BlocklyGames.teacher_workspace.traceOn(true);

  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,penUp,penDown,penWidth,penColour,' +
      'hideHeroes,showHeroes,print,font');

  if (document.getElementById('submitButton')) {
    BlocklyGames.bindClick('submitButton', Heroes.submitToReddit);
  }

  // Initialize the slider.
  var sliderSvg = document.getElementById('slider');
  Heroes.speedSlider = new Slider(10, 35, 130, sliderSvg);


  Heroes.ctxDisplay = document.getElementById('display').getContext('2d');
  Heroes.ctxAnswer = document.getElementById('answer').getContext('2d');
  Heroes.ctxScratch = document.getElementById('scratch').getContext('2d');
  Heroes.reset();

  BlocklyGames.bindClick('runButton', Heroes.runButtonClick);
  BlocklyGames.bindClick('resetButton', Heroes.resetButtonClick);

  // Preload the win sound.
  BlocklyGames.workspace.loadAudio_(['heroes/win.mp3', 'heroes/win.ogg'],
      'win');
  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);
  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);

  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                         BlocklyGames.LEVEL)) {
    setTimeout(Heroes.showHelp, 1000);
    if (BlocklyGames.LEVEL == 9) {
      setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
    }
  }
  if (BlocklyGames.LEVEL == 1) {
    // Previous apps did not have categories.
    // If the user doesn't find them, point them out.
    BlocklyGames.workspace.addChangeListener(Heroes.watchCategories_);
  }
};

if (window.location.pathname.match(/readonly.html$/)) {
  window.addEventListener('load', function() {
    BlocklyInterface.initReadonly(Heroes.soy.readonly());
  });
} else {
  window.addEventListener('load', Heroes.init);
}


/**
 * Reset the heroes to the start position, clear the display, and kill any
 * pending tasks.
 */
Heroes.reset = function() {
  // Starting location and heading of the heroes.
  Heroes.x = Heroes.WIDTH / 2;
  Heroes.y = Heroes.HEIGHT / 2;
  Heroes.heading = 0;
  Heroes.penDownValue = true;
  Heroes.visible = true;
  Heroes.background = null;
  Heroes.hero = null;

  // Clear the canvas.
  Heroes.ctxScratch.canvas.width = Heroes.ctxScratch.canvas.width;
  Heroes.ctxScratch.strokeStyle = '#ffffff';
  Heroes.ctxScratch.fillStyle = '#ffffff';
  Heroes.ctxScratch.lineWidth = 5;
  Heroes.ctxScratch.lineCap = 'round';
  Heroes.ctxScratch.font = 'normal 18pt Arial';
  Heroes.display();

  // Kill all tasks.
  for (var x = 0; x < Heroes.pidList.length; x++) {
    window.clearTimeout(Heroes.pidList[x]);
  }
  Heroes.pidList.length = 0;
  Heroes.interpreter = null;

  // Kill the game event loop.
  clearInterval(this.eventLoop);
};

/**
 * Copy the scratch canvas to the display canvas. Add a heroes marker.
 */
Heroes.display = function() {
  Heroes.drawBackground();

  // Draw the user layer.
  for (var i=0; i<Heroes.items.length; i++)
  {
    Heroes.items[i].draw(Heroes.ctxScratch, Heroes.item_radius);
    Heroes.items[i].processEvents();
  }
  Heroes.ctxDisplay.globalCompositeOperation = 'source-over';
  Heroes.ctxDisplay.drawImage(Heroes.ctxScratch.canvas, 0, 0);

  Heroes.drawHero();
};

Heroes.drawBackground = function()
{
  // Clear the display with black.
  Heroes.ctxScratch.clearRect(0, 0, Heroes.ctxDisplay.canvas.clientWidth, Heroes.ctxDisplay.canvas.clientHeight);
  Heroes.ctxDisplay.beginPath();
  Heroes.ctxDisplay.rect(0, 0,
      Heroes.ctxDisplay.canvas.width, Heroes.ctxDisplay.canvas.height);

  if (Heroes.background)
  {
    Heroes.ctxDisplay.drawImage(Heroes.background, 0, 0, Heroes.ctxDisplay.canvas.clientWidth, Heroes.ctxDisplay.canvas.clientHeight);
  }
  else
  {
    Heroes.ctxDisplay.fillStyle = "#333333";
    Heroes.ctxDisplay.fill();
  }
}

Heroes.drawHero = function() {

    // Draw the heroes.
    if (Heroes.visible) {
      if (Heroes.hero)
      {
        Heroes.ctxDisplay.drawImage(Heroes.hero, Heroes.x - Heroes.radius, Heroes.y - Heroes.radius, Heroes.radius * 2, Heroes.radius * 2);
      }
      else
      {
        // Make the heroes the colour of the pen.
        Heroes.ctxDisplay.strokeStyle = Heroes.ctxScratch.strokeStyle;
        Heroes.ctxDisplay.fillStyle = Heroes.ctxScratch.fillStyle;

        // Draw the heroes body.
        var radius = Heroes.ctxScratch.lineWidth / 2 + 10;
        Heroes.ctxDisplay.beginPath();
        Heroes.ctxDisplay.arc(Heroes.x, Heroes.y, radius, 0, 2 * Math.PI, false);
        Heroes.ctxDisplay.lineWidth = 3;
        Heroes.ctxDisplay.stroke();

        // Draw the heroes head.
        var WIDTH = 0.3;
        var HEAD_TIP = 10;
        var ARROW_TIP = 4;
        var BEND = 6;
        var radians = 2 * Math.PI * Heroes.heading / 360;
        var tipX = Heroes.x + (radius + HEAD_TIP) * Math.sin(radians);
        var tipY = Heroes.y - (radius + HEAD_TIP) * Math.cos(radians);
        radians -= WIDTH;
        var leftX = Heroes.x + (radius + ARROW_TIP) * Math.sin(radians);
        var leftY = Heroes.y - (radius + ARROW_TIP) * Math.cos(radians);
        radians += WIDTH / 2;
        var leftControlX = Heroes.x + (radius + BEND) * Math.sin(radians);
        var leftControlY = Heroes.y - (radius + BEND) * Math.cos(radians);
        radians += WIDTH;
        var rightControlX = Heroes.x + (radius + BEND) * Math.sin(radians);
        var rightControlY = Heroes.y - (radius + BEND) * Math.cos(radians);
        radians += WIDTH / 2;
        var rightX = Heroes.x + (radius + ARROW_TIP) * Math.sin(radians);
        var rightY = Heroes.y - (radius + ARROW_TIP) * Math.cos(radians);
        Heroes.ctxDisplay.beginPath();
        Heroes.ctxDisplay.moveTo(tipX, tipY);
        Heroes.ctxDisplay.lineTo(leftX, leftY);
        Heroes.ctxDisplay.bezierCurveTo(leftControlX, leftControlY,
            rightControlX, rightControlY, rightX, rightY);
        Heroes.ctxDisplay.closePath();
        Heroes.ctxDisplay.fill();
      }
    }
}


/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Heroes.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  runButton.style.display = 'none';
  resetButton.style.display = 'inline';
  document.getElementById('spinner').style.visibility = 'visible';
  BlocklyGames.workspace.traceOn(true);
  Heroes.execute();
};

/**
 * Click the reset button.  Reset the Heroes.
 * @param {!Event} e Mouse or touch event.
 */
Heroes.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  runButton.style.display = 'inline';
  document.getElementById('resetButton').style.display = 'none';
  document.getElementById('spinner').style.visibility = 'hidden';
  BlocklyGames.workspace.traceOn(false);
  Heroes.reset();
};

/**
 * Inject the Heroes API into a JavaScript interpreter.
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
Heroes.initInterpreter = function(interpreter, scope) {
  // API
  var wrapper = function(distance, id) {
    Heroes.move(0, distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveUp',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    Heroes.move(0, -distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveDown',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    Heroes.move(-distance.valueOf(), 0, id.toString());
  };
  interpreter.setProperty(scope, 'moveLeft',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    Heroes.move(distance.valueOf(), 0, id.toString());
  };
  interpreter.setProperty(scope, 'moveRight',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(x, y, vx, vy, id) {
    Heroes.addItem(x.data, y.data, vx.data, vy.data, id.toString());
  };
  interpreter.setProperty(scope, 'addItem',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(which, fn, id) {
    Heroes.setButtonCallback(which.data, fn.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setButtonCallback',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(fn, id) {
    Heroes.setCollisionCallback(fn.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setCollisionCallback',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(image, id) {
    Heroes.setBackground(image.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setBackground',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(hero, id) {
    Heroes.setHero(hero.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setHero',
      interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Heroes.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Heroes.execute, 250);
    return;
  }

  Heroes.reset();
  Heroes.startGame();
  var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
  Heroes.interpreter = new Interpreter(code, Heroes.initInterpreter);
  Heroes.pidList.push(setTimeout(Heroes.executeChunk_, 100));

};

/**
 * Execute a bite-sized chunk of the user's code.
 * @private
 */
Heroes.executeChunk_ = function() {
  // All tasks should be complete now.  Clean up the PID list.
  Heroes.pidList.length = 0;
  Heroes.pause = 0;
  var go;
  do {
    try {
      go = Heroes.interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
    if (go && Heroes.pause) {
      // The last executed command requested a pause.
      go = false;
      Heroes.pidList.push(
          setTimeout(Heroes.executeChunk_, Heroes.pause));
    }
  } while (go);
  // Wrap up if complete.
  if (!Heroes.pause) {
    document.getElementById('spinner').style.visibility = 'hidden';
    BlocklyGames.workspace.highlightBlock(null);
  }
};

/**
 * Highlight a block and pause.
 * @param {?string} id ID of block.
 */
Heroes.animate = function(id) {
  if (id) {
    BlocklyInterface.highlight(id);
    // Scale the speed non-linearly, to give better precision at the fast end.
    var stepSpeed = 1000 * Math.pow(1 - Heroes.speedSlider.getValue(), 2);
    Heroes.pause = Math.max(1, stepSpeed);
  }
};

/**
 * Move the heroes forward or backward.
 * @param {number} distance Pixels to move.
 * @param {?string} id ID of block.
 */
Heroes.move = function(x, y, id) {
  if (Heroes.penDownValue) {
    Heroes.ctxScratch.beginPath();
    Heroes.ctxScratch.moveTo(Heroes.x, Heroes.y);
  }
  Heroes.x += x;
  Heroes.y -= y;

  if (Heroes.penDownValue) {
    Heroes.ctxScratch.lineTo(Heroes.x, Heroes.y);
    Heroes.ctxScratch.stroke();
  }
  Heroes.animate(id);
};

/**
 * Add an item to the screen.
 */
Heroes.items = [];
Heroes.item_radius = 5;
Heroes.radius = 22;
Heroes.addItem = function(x, y, vx, vy, id) {
  this.items.push(new Item(x, y, vx, vy, Heroes.item_rad*2));
  Heroes.animate(id);
};

// Events for override.
Heroes.key_events = {};
Heroes.collision_event = "";
Heroes.setButtonCallback = function(which, fn, id)
{
  this.key_events[which] = fn;
  this.animate(id);
}
Heroes.setCollisionCallback = function(fn, id)
{
  this.collision_event = fn;
  this.animate(id);
}

/**
 * Start the event polling.
 */
Heroes.startGame = function() {
  var self = this;
  Heroes.items = []

  //
  // Track each key press.
  //

  var keys = {};
  $(document).keydown(function( event ) {
    keys[event.which] = true;
  });
  $(document).keyup(function( event ) {
    keys[event.which] = false;
  });

  this.eventLoop = setInterval(function()
    {
      //
      // Check for key presses.
      //

      for (event in self.key_events)
      {
        if (keys[event])
        {
          Heroes.interpreter.appendCode(self.key_events[event]);
          while (Heroes.interpreter.step()){};
        }
      }

      //
      // Check for collision events.
      // Iterate in reverse so the index isn't affected when we remove elements.
      //

      var i = Heroes.items.length
      while (i--) {
        if (compute_distance(Heroes.items[i].x, Heroes.items[i].y, Heroes.x, Heroes.y) < (Heroes.radius + Heroes.item_radius))
        {
          Heroes.interpreter.appendCode(self.collision_event);
          while (Heroes.interpreter.step()){};
          Heroes.items.splice(i, 1);
        }
      }

      Heroes.display();
    }, 50);
};

/**
 * Lift or lower the pen.
 * @param {boolean} down True if down, false if up.
 * @param {?string} id ID of block.
 */
Heroes.penDown = function(down, id) {
  Heroes.penDownValue = down;
  Heroes.animate(id);
};

/**
 * Change the thickness of lines.
 * @param {number} width New thickness in pixels.
 * @param {?string} id ID of block.
 */
Heroes.penWidth = function(width, id) {
  Heroes.ctxScratch.lineWidth = width;
  Heroes.animate(id);
};

/**
 * Change the colour of the pen.
 * @param {string} colour Hexadecimal #rrggbb colour string.
 * @param {?string} id ID of block.
 */
Heroes.penColour = function(colour, id) {
  Heroes.ctxScratch.strokeStyle = colour;
  Heroes.ctxScratch.fillStyle = colour;
  Heroes.animate(id);
};

/**
 * Make the heroes visible or invisible.
 * @param {boolean} visible True if visible, false if invisible.
 * @param {?string} id ID of block.
 */
Heroes.isVisible = function(visible, id) {
  Heroes.visible = visible;
  Heroes.animate(id);
};

/**
 * Print some text.
 * @param {string} text Text to print.
 * @param {?string} id ID of block.
 */
Heroes.drawPrint = function(text, id) {
  Heroes.ctxScratch.save();
  Heroes.ctxScratch.translate(Heroes.x, Heroes.y);
  Heroes.ctxScratch.rotate(2 * Math.PI * (Heroes.heading - 90) / 360);
  Heroes.ctxScratch.fillText(text, 0, 0);
  Heroes.ctxScratch.restore();
  Heroes.animate(id);
};

/**
 * Change the typeface of printed text.
 * @param {string} font Font name (e.g. 'Arial').
 * @param {number} size Font size (e.g. 18).
 * @param {string} style Font style (e.g. 'italic').
 * @param {?string} id ID of block.
 */
Heroes.drawFont = function(font, size, style, id) {
  Heroes.ctxScratch.font = style + ' ' + size + 'pt ' + font;
  Heroes.animate(id);
};

var compute_distance = function(x1, y1, x2, y2)
{
  return Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);
}
