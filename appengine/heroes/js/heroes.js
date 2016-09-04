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

goog.require('ItemObject');
goog.require('HeroObject');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Slider');
goog.require('Heroes.Blocks');
goog.require('Heroes.soy');



/// HACK (aheine): get the user name in a better way
function getUsername() {
    var url = window.location.href;
    var regex = new RegExp("[?&]username(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return "unknown";
    if (!results[2]) return 'unknown2';
    return decodeURIComponent(results[2].replace(/\+/g, " ")) + "_heroes";
}

var initStudentWilddog = function(game, level, workspace, teacher_workspace){
    var user_id = guid();
    push_to_user(null, game + "-" + level, getUsername());

    var events_in_progress = {};
    workspace.addChangeListener(function(masterEvent) {
      if (masterEvent.type == Blockly.Events.UI) {
        return;  // Don't mirror UI events.
      }

      if (events_in_progress[masterEvent.blockId + masterEvent.type] === true)
      {
        console.log("don't send event triggered by wilddog.", masterEvent);
        events_in_progress[masterEvent.blockId + masterEvent.type] = false;
        return;
      }


      // Convert event to JSON for transmitting across the net.
      var json = masterEvent.toJson();
      var wdmsg = {"sender":user_id, "blkmsg":json};

      console.log("Sending student event", masterEvent);
      push_to_user(wdmsg, null, getUsername());
    });

    var teacher_event_callback = function(snapshot) {
      var blkmsg = clean_event(snapshot, user_id);
      if (!blkmsg)
      {
        return;
      }
      var slaveEvent = Blockly.Events.fromJson(blkmsg, teacher_workspace);

      try {
        if (slaveEvent.type == "ui" && slaveEvent.newValue)
        {
          teacher_workspace.highlightBlock(slaveEvent.newValue);
        }
        else
        {
          var existingGroup = Blockly.Events.getGroup();
          var groupid = existingGroup;
          if (!existingGroup) {
              Blockly.Events.setGroup(true);
              groupid = Blockly.Events.getGroup();
          }
          slaveEvent.run(true);
          if (!existingGroup) {
              Blockly.Events.setGroup(false);
          }
        }
      }
      catch(err) {
        console.log("Error running slave event", err.message);
      }
    }
    add_user_event_callback("classadoo_instructor", teacher_event_callback);
    add_user_remove_callback("classadoo_instructor", function(old_snapshot)
    {
      teacher_workspace.clear();
    });

    var self_event_callback = function(snapshot) {
      var blkmsg = clean_event(snapshot, user_id);
      if (!blkmsg)
      {
        return;
      }
      var slaveEvent = Blockly.Events.fromJson(blkmsg, workspace);

      try {
        if (slaveEvent.type == "ui" && slaveEvent.newValue)
        {
          BlocklyInterface.highlight(slaveEvent.newValue);
        }
        else
        {
          var existingGroup = Blockly.Events.getGroup();
          var groupid = existingGroup;
          if (!existingGroup) {
              Blockly.Events.setGroup(true);
              groupid = Blockly.Events.getGroup();
          }
          events_in_progress[slaveEvent.blockId + slaveEvent.type] = true;
          // Create will automatically trigger a move, so don't send our move command back to the student.
          if (slaveEvent.type == "create")
          {
            events_in_progress[slaveEvent.blockId + "move"] = true;
          }
          slaveEvent.run(true);
          if (!existingGroup) {
              Blockly.Events.setGroup(false);
          }
        }
      }
      catch(err) {
         console.log("Error executing slave event", err.message);
      }
    }
    add_user_event_callback(getUsername(), self_event_callback);
}



BlocklyGames.NAME = 'heroes';

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

Heroes.addPoints = function(delta)
{
  Heroes.points = Heroes.points || 0;
  Heroes.points += delta;
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

    Heroes.HERO_NAMES = [];
    Heroes.addHero("Leo", "lion", Heroes.WIDTH/2, Heroes.HEIGHT/2);
    Heroes.addHero("William", "eagle", Heroes.WIDTH/3, Heroes.HEIGHT/2);
    Heroes.addHero("Andrew", "human", Heroes.WIDTH/3 * 2, Heroes.HEIGHT/2);


  // Render the Soy template.
  document.body.innerHTML = Heroes.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML,
       suffix: "&username="+getUsername() });

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
    var my_height = teacherBlocksHidden ? window.innerHeight - 100 : window.innerHeight/3*2 - 50;
    var teacher_height = teacherBlocksHidden ? 0 : window.innerHeight/3*1 - 50;
    var top = Math.max(10, visualization.offsetTop - window.pageYOffset);
    var width = window.innerWidth - 640;

    myBlocklyDiv.style.top =  top + 'px';
    myBlocklyDiv.style.left = rtl ? '10px' : '620px';
    myBlocklyDiv.style.width = width + 'px';
    myBlocklyDiv.style.height = my_height + 'px';

    teacherCanvasDiv.style.top = my_height + top + 5 + 'px';
    teacherCanvasDiv.style.left = rtl ? '10px' : '620px';
    teacherBlocklyDiv.style.width =  width + 'px';
    teacherBlocklyDiv.style.height = teacher_height + 'px';
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


  var toolbox = document.getElementById('toolbox');
  BlocklyGames.workspace = Blockly.inject('my_blockly',
      {'media': 'third-party/blockly/media/',
       'rtl': rtl,
       'toolbox': toolbox,
       'trashcan': true,
       'zoom': {'controls': true, 'wheel': false}});
   BlocklyGames.teacher_workspace = Blockly.inject('teacher_blockly',
       {'media': 'third-party/blockly/media/',
        'readOnly' : true,
        'rtl': rtl});

  initStudentWilddog( "Heroes", "", BlocklyGames.workspace, BlocklyGames.teacher_workspace );
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
  // Starting location of the heroes.
  for (var hero in Heroes.heroes)
  {
    // TODO(aheine).
  }



  Heroes.background = null;

  Heroes.points = undefined;

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
  clearInterval(Heroes.eventLoop);
};

/**
 * Copy the scratch canvas to the display canvas. Add a heroes marker.
 */
Heroes.display = function() {
  Heroes.drawBackground();

  // Draw the items.
  for (var i=0; i<Heroes.items.length; i++)
  {
    Heroes.items[i].draw(Heroes.ctxScratch, Heroes.item_radius);
    Heroes.items[i].processEvents();
  }
  // Draw the heroes.
  for (var hero in Heroes.heroes)
  {
    Heroes.heroes[hero].draw(Heroes.ctxScratch);
    Heroes.heroes[hero].speak(Heroes.ctxScratch, Heroes.words[hero]);
  }
  // Draw title.
  if (Heroes.title)
  {
    Heroes.ctxScratch.fillStyle = "#1199CC";
    var pos = Heroes.WIDTH/2 - Heroes.ctxScratch.measureText(Heroes.title).width/2;
    Heroes.ctxScratch.fillText(Heroes.title, pos, 40);
  }

  Heroes.ctxDisplay.globalCompositeOperation = 'source-over';
  Heroes.ctxDisplay.drawImage(Heroes.ctxScratch.canvas, 0, 0);

  Heroes.drawHUD();
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

Heroes.drawHUD = function()
{
  if (Heroes.points !== undefined)
  {
    Heroes.ctxDisplay.fillStyle = "#FFFFFF";
    Heroes.ctxDisplay.font = "15px Arial";
    Heroes.ctxDisplay.fillText("Points: " + Heroes.points, 30, 30);
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
  var wrapper = function(who, distance, id) {
    Heroes.move(who.toString(), 0, distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveUp',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(who, distance, id) {
    Heroes.move(who.toString(), 0, -distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveDown',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(who, distance, id) {
    Heroes.move(who.toString(), -distance.valueOf(), 0, id.toString());
  };
  interpreter.setProperty(scope, 'moveLeft',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(who, distance, id) {
    Heroes.move(who.toString(), distance.valueOf(), 0, id.toString());
  };
  interpreter.setProperty(scope, 'moveRight',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(x, y, vx, vy, id) {
    Heroes.addItem(x.data, y.data, vx.data, vy.data, id.toString());
  };
  interpreter.setProperty(scope, 'addItem',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(name, type, x, y, id) {
    Heroes.addHero(name.toString(), type.toString(), x.data, y.data, id.toString());
  };
  interpreter.setProperty(scope, 'addHero',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(which, fn, id) {
    Heroes.setButtonCallback(which.data, fn.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setButtonCallback',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(a, b, fn, id) {
    Heroes.setCollisionCallback(a.toString(), b.toString(), fn.toString(), id.toString());
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

  wrapper = function(num, id) {
    Heroes.addPoints(num.data, id.toString());
  };
  interpreter.setProperty(scope, 'addPoints',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(who, what, seconds, id) {
    Heroes.speak(who.toString(), what.toString(), seconds.data, id.toString());
  };
  interpreter.setProperty(scope, 'speak',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(title, id) {
    Heroes.setTitle(title.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setTitle',
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
 * Add an item to the screen.
 */
Heroes.items = [];
Heroes.item_radius = 5;
Heroes.addItem = function(x, y, vx, vy, id) {
  Heroes.items.push(new Item(x, y, vx, vy, Heroes.item_rad*2));
  Heroes.animate(id);
};


//
// Heroes actions.
//
Heroes.radius = 32;
Heroes.heroes = {};
Heroes.addHero = function(name, type, x, y, id) {
  Heroes.heroes[name] = new Hero(type, Heroes.radius, x, y);
  Heroes.HERO_NAMES.push([name, name]);
  Heroes.animate(id);
};
Heroes.move = function(who, x, y, id) {

  Heroes.heroes[who].x += x;
  Heroes.heroes[who].y -= y;

};

//
// Hero speech.
//
Heroes.words = {};
Heroes.word_timeouts = {};
Heroes.speak = function(who, what, seconds, id)
{
  Heroes.words[who] = what;
  clearTimeout(Heroes.word_timeouts[who]);
  Heroes.word_timeouts[who] = setTimeout(function()
  {
    Heroes.words[who] = "";
  }, seconds*1000);
  Heroes.animate(id);
}

Heroes.title = "";
Heroes.setTitle = function(title, id)
{
  Heroes.title = title;
}

Heroes.Heroes = [];

// Events for override.
Heroes.key_events = {};
Heroes.setButtonCallback = function(which, fn, id)
{
  Heroes.key_events[which] = fn;
  Heroes.animate(id);
}
Heroes.collision_events = {};
Heroes.collisions_in_progress = {};
Heroes.setCollisionCallback = function(a, b, fn, id)
{
  Heroes.collision_events[a] = Heroes.collision_events[a] || {};
  Heroes.collision_events[a][b] = fn;
  Heroes.animate(id);
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
  $(document)['keydown'](function( event ) {
    keys[event.which] = true;
  });
  $(document)['keyup'](function( event ) {
    keys[event.which] = false;
  });

  Heroes.eventLoop = setInterval(function()
    {
      //
      // Check for key presses.
      //

      for (event in Heroes.key_events)
      {
        if (keys[event])
        {
          Heroes.interpreter['appendCode'](Heroes.key_events[event]);
          while (Heroes.interpreter.step()){};
        }
      }

      Heroes.checkCollisions();

      Heroes.display();
    }, 50);
};

//
// Check for collision events.
//
Heroes.checkCollisions = function()
{
  for (var a in Heroes.collision_events)
  {
    var hero_a = Heroes.heroes[a];
    for (var b in Heroes.collision_events[a])
    {
      // Assume B is either an item or a hero.
      if (b == "item")
      {
        // Iterate in reverse so the index isn't affected when we remove elements.
        var i = Heroes.items.length
        var item;
        while (i--) {
          item = Heroes.items[i];
          if (compute_distance(item.x, item.y, hero_a.x, hero_a.y) < (hero_a.radius + Heroes.item_radius))
          {
            Heroes.interpreter['appendCode'](Heroes.collision_events[a][b]);
            while (Heroes.interpreter.step()){};
            Heroes.items.splice(i, 1);
          }
        }
      }
      else
      {
        var hero_b = Heroes.heroes[b];
        if (compute_distance(hero_b.x, hero_b.y, hero_a.x, hero_a.y) < (hero_a.radius + hero_b.radius))
        {
          if (Heroes.collisions_in_progress[a + b] == false)
          {
            Heroes.interpreter['appendCode'](Heroes.collision_events[a][b]);
            while (Heroes.interpreter.step()){};
            Heroes.items.splice(i, 1);
          }
          Heroes.collisions_in_progress[a + b] = true;
        }
        else
        {
          Heroes.collisions_in_progress[a + b] = false;
        }
      }
    }
  }
}

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
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}
