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
goog.require('Maze.Blocks');
goog.require('Turtle_Collab.Blocks');
goog.require('Heroes.soy');
goog.require('WilddogUtils');


BlocklyGames.NAME = 'heroes';


// TODO(aheine): use jquery instead of a string of HTML. Also move this to a new file.
Heroes.GAME_HTML =
  '<div class="col-md-5" id="visualization">' +
    '<canvas id="{user}_scratch" width="570" height="400" style="display: none"></canvas>' +
    '<canvas id="{user}_display" width="570" height="400"></canvas>' +
    '<canvas id="{user}_lines" width="570" height="400" style="display: none"></canvas>' +
    '<table style="padding-top: 1em;">' +
      '<tr>' +
        '<td style="width: 15px;">' +
          '<img id="{user}_spinner" style="visibility: hidden;" src="heroes/loading.gif" height=15 width=15>' +
        '</td>' +
        '<td style="width: 190px; text-align: center">' +
          '<button id="{user}_runButton" class="primary" title="Run the program you wrote.">' +
            '<img src="common/1x1.gif" class="run icon21"> Run Program' +
          '</button>' +
          '<button id="{user}_resetButton" class="primary" style="display: none" title="Stop the program and reset the level.">' +
            '<img src="common/1x1.gif" class="stop icon21"> Reset' +
          '</button>' +
          '{publish_button}' +
        '</td>' +
      '</tr>' +
    '</table>' +
  '</div>' +
  '<div class="col-md-7 blockly read_only_{read_only}" id="{user}_blockly"></div>';

Heroes.PUBLISH_HTML =
'<td><button id="publishButton" class="primary publish" title="Save this program for viewing later.">' +
  '<img src="common/1x1.gif" class="camera icon21"> Publish Project</button></td>'

Heroes.USER_DROPDOWN = '<select id="student_dropdown"></select>';

//
// Constructor for a new game object.
//
var Game = function(username, blockly_workspace)
{
  var self = this;

  self.workspace = blockly_workspace;
  self.username = username;
  self.pidList = [];

  self.ctxDisplay = document.getElementById(self.username + '_display').getContext('2d');
  self.ctxScratch = document.getElementById(self.username + '_scratch').getContext('2d');
  self.ctxLines = document.getElementById(self.username + '_lines').getContext('2d');

  self.items = [];
  self.item_radius = 5;
  self.radius = 32;
  self.heroes = {};

  /**
   * Number of milliseconds that execution should delay.
   * @type number
   */
  self.pause = 0;

  /**
   * JavaScript interpreter for executing program.
   * @type Interpreter
   */
  self.interpreter = null;

  self.setBackground = function(style, id)
  {
    self.background = Heroes.backgrounds[style];
    self.animate(id);
  }

  self.addPoints = function(delta)
  {
    self.points = self.points || 0;
    self.points += delta;
  }

  /**
   * Reset the heroes to the start position, clear the display, and kill any
   * pending tasks.
   */
  self.reset = function() {
    //
    // Reset state of the heroes.
    //
    self.heroes = {};
    self.addHero("Leo", "lion", Heroes.WIDTH/2, Heroes.HEIGHT/2);
    self.addHero("William", "eagle", Heroes.WIDTH/3, Heroes.HEIGHT/2);
    self.addHero("Andrew", "human", Heroes.WIDTH/3 * 2, Heroes.HEIGHT/2);

    //
    // Clear drawings.
    //
    self.ctxLines.clearRect(0, 0, self.ctxDisplay.canvas.clientWidth, self.ctxDisplay.canvas.clientHeight);
    self.background = null;

    //
    // Clear game state.
    //
    self.points = undefined;
    self.words = {};
    self.word_timeouts = {};
    self.title = "";
    self.key_events = {};
    self.collision_events = {};
    self.collisions_in_progress = {};

    // Clear the canvas.
    self.ctxScratch.canvas.width = self.ctxScratch.canvas.width;
    self.ctxScratch.strokeStyle = '#ffffff';
    self.ctxScratch.fillStyle = '#ffffff';
    self.ctxScratch.lineWidth = 5;
    self.ctxScratch.lineCap = 'round';
    self.ctxScratch.font = 'normal 18pt Arial';
    self.display();

    // Kill all tasks.
    for (var x = 0; x < self.pidList.length; x++) {
      window.clearTimeout(self.pidList[x]);
    }
    self.pidList.length = 0;
    self.interpreter = null;

    // Kill the game event loop.
    clearInterval(self.eventLoop);

    set_code_running(getUsername(), self.username, false);
  };

  /**
   * Copy the scratch canvas to the display canvas. Add a heroes marker.
   */
  self.display = function() {
    self.drawBackground();

    // Draw the items.
    for (var i=0; i<self.items.length; i++)
    {
      self.items[i].draw(self.ctxScratch, self.item_radius);
      self.items[i].processEvents();
    }
    // Draw the heroes.
    for (var hero in self.heroes)
    {
      self.heroes[hero].draw(self.ctxScratch);
      self.heroes[hero].speak(self.ctxScratch, self.words[hero]);
    }
    // Draw title.
    if (self.title)
    {
      self.ctxScratch.fillStyle = "#1199CC";
      self.ctxScratch.font="28px Arial";

      var pos = Heroes.WIDTH/2 - self.ctxScratch.measureText(self.title).width/2;
      self.ctxScratch.fillText(self.title, pos, 40);
    }

    self.ctxDisplay.globalCompositeOperation = 'source-over';
    self.ctxDisplay.drawImage(self.ctxLines.canvas, 0, 0);
    self.ctxDisplay.globalCompositeOperation = 'source-over';
    self.ctxDisplay.drawImage(self.ctxScratch.canvas, 0, 0);

    self.drawHUD();
  };

  self.drawBackground = function()
  {
    // Clear the display with black.
    self.ctxScratch.clearRect(0, 0, self.ctxDisplay.canvas.clientWidth, self.ctxDisplay.canvas.clientHeight);
    self.ctxDisplay.beginPath();
    self.ctxDisplay.rect(0, 0,
        self.ctxDisplay.canvas.width, self.ctxDisplay.canvas.height);

    if (self.background)
    {
      self.ctxDisplay.drawImage(self.background, 0, 0, self.ctxDisplay.canvas.clientWidth, self.ctxDisplay.canvas.clientHeight);
    }
    else
    {
      self.ctxDisplay.fillStyle = "#333333";
      self.ctxDisplay.fill();
    }
  }

  self.drawHUD = function()
  {
    if (self.points !== undefined)
    {
      self.ctxDisplay.fillStyle = "#FFFFFF";
      self.ctxDisplay.font = "15px Arial";
      self.ctxDisplay.fillText("Points: " + self.points, 30, 30);
    }
  }

  /**
   * Execute the user's code.  Heaven help us...
   */
  self.execute = function() {
    if (!('Interpreter' in window)) {
      // Interpreter lazy loads and hasn't arrived yet.  Try again later.
      setTimeout(self.execute, 250);
      return;
    }

    self.reset();
    self.startGame();

    var code = Blockly.JavaScript.workspaceToCode(self.workspace);
    self.interpreter = new Interpreter(code, self.initInterpreter);
    self.pidList.push(setTimeout(self.executeChunk_, 100));
  };

  /**
   * Click the run button.  Start the program.
   * @param {!Event} e Mouse or touch event.
   */
  self.runButtonClick = function(e) {
    // Prevent double-clicks or double-taps.
    if (BlocklyInterface.eventSpam(e)) {
      return;
    }

    var runButton = document.getElementById(self.username + '_runButton');
    var resetButton = document.getElementById(self.username + '_resetButton');
    // Ensure that Reset button is at least as wide as Run button.
    if (!resetButton.style.minWidth) {
      resetButton.style.minWidth = runButton.offsetWidth + 'px';
    }
    runButton.style.display = 'none';
    resetButton.style.display = 'inline';
    document.getElementById(self.username + '_spinner').style.visibility = 'visible';
    self.execute();
    set_code_running(getUsername(), self.username, true);
  };

  /**
   * Click the reset button.  Reset the Heroes.
   * @param {!Event} e Mouse or touch event.
   */
  self.resetButtonClick = function(e) {
    // Prevent double-clicks or double-taps.
    if (BlocklyInterface.eventSpam(e)) {
      return;
    }
    var runButton = document.getElementById(self.username + '_runButton');
    runButton.style.display = 'inline';
    document.getElementById(self.username + '_resetButton').style.display = 'none';
    document.getElementById(self.username + '_spinner').style.visibility = 'hidden';
    self.reset();
  };

  /**
   * Inject the Heroes API into a JavaScript interpreter.
   * @param {!Object} scope Global scope.
   * @param {!Interpreter} interpreter The JS interpreter.
   */
  self.initInterpreter = function(interpreter, scope) {
    // API
    var wrapper = function(who, distance, id) {
      self.move(who.toString(), 0, distance.valueOf(), id.toString());
    };
    interpreter.setProperty(scope, 'moveUp',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(who, distance, id) {
      self.move(who.toString(), 0, -distance.valueOf(), id.toString());
    };
    interpreter.setProperty(scope, 'moveDown',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(who, distance, id) {
      self.move(who.toString(), -distance.valueOf(), 0, id.toString());
    };
    interpreter.setProperty(scope, 'moveLeft',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(who, distance, id) {
      self.move(who.toString(), distance.valueOf(), 0, id.toString());
    };
    interpreter.setProperty(scope, 'moveRight',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(x, y, vx, vy, id) {
      self.addItem(x.data, y.data, vx.data, vy.data, id.toString());
    };
    interpreter.setProperty(scope, 'addItem',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(name, type, x, y, id) {
      self.addHero(name.toString(), type.toString(), x.data, y.data, id.toString());
    };
    interpreter.setProperty(scope, 'addHero',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(which, fn, id) {
      self.setButtonCallback(which.data, fn.toString(), id.toString());
    };
    interpreter.setProperty(scope, 'setButtonCallback',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(a, b, fn, id) {
      self.setCollisionCallback(a.toString(), b.toString(), fn.toString(), id.toString());
    };
    interpreter.setProperty(scope, 'setCollisionCallback',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(image, id) {
      self.setBackground(image.toString(), id.toString());
    };
    interpreter.setProperty(scope, 'setBackground',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(noise, id) {
      self.makeNoise(noise.toString(), id.toString());
    };
    interpreter.setProperty(scope, 'makeNoise',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(num, id) {
      self.addPoints(num.data, id.toString());
    };
    interpreter.setProperty(scope, 'addPoints',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(who, what, seconds, id) {
      self.speak(who.toString(), what.toString(), seconds.data, id.toString());
    };
    interpreter.setProperty(scope, 'speak',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(title, id) {
      self.setTitle(title.toString(), id.toString());
    };
    interpreter.setProperty(scope, 'setTitle',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(who, id) {
      self.penDown(who.toString(), false, id.toString());
    };
    interpreter.setProperty(scope, 'penUp',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(who, id) {
      self.penDown(who.toString(), true, id.toString());
    };
    interpreter.setProperty(scope, 'penDown',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(who, width, id) {
      self.penWidth(who.toString(), width.valueOf(), id.toString());
    };
    interpreter.setProperty(scope, 'penWidth',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(who, colour, id) {
      self.penColour(who.toString(), colour.toString(), id.toString());
    };
    interpreter.setProperty(scope, 'penColour',
        interpreter.createNativeFunction(wrapper));
  };

  /**
   * Execute a bite-sized chunk of the user's code.
   * @private
   */
  self.executeChunk_ = function() {
    // All tasks should be complete now.  Clean up the PID list.
    self.pidList.length = 0;
    self.pause = 0;
    var go;
    do {
      try {
        go = self.interpreter.step();
      } catch (e) {
        // User error, terminate in shame.
        alert(e);
        go = false;
      }
      if (go && self.pause) {
        // The last executed command requested a pause.
        go = false;
        self.pidList.push(
            setTimeout(self.executeChunk_, self.pause));
      }
    } while (go);
    // Wrap up if complete.
    if (!self.pause) {
      document.getElementById(self.username + '_spinner').style.visibility = 'hidden';
      self.workspace.highlightBlock(null);
    }
  };

  /**
   * Highlight a block and pause.
   * @param {?string} id ID of block.
   */
  self.animate = function(id) {
    if (id) {
      var m = id.match(/^block_id_([^']+)$/);
      if (m) {
        id = m[1];
      }
      var block = self.workspace.getBlockById(id);
      if (block)
      {
        block.select();
      }
      var stepSpeed = 1000 * Math.pow(1 - Heroes.speedSlider.getValue(), 2);
      self.pause = Math.max(1, stepSpeed);
    }
  };


  /**
   * Add an item to the screen.
   */
  self.addItem = function(x, y, vx, vy, id) {
    self.items.push(new Item(x, y, vx, vy, self.item_radius*2));
    self.animate(id);
  };


  //
  // Heroes actions.
  //
  self.addHero = function(name, type, x, y, id) {
    self.heroes[name] = new Hero(type, self.radius, x, y);

    self.animate(id);
  };

  self.move = function(who, x, y, id) {
    var hero = self.heroes[who];
    if (hero.penDown) {
      self.ctxLines.strokeStyle = hero.colour;
      self.ctxLines.fillStyle = hero.colour;
      self.ctxLines.lineWidth = hero.width;
      self.ctxLines.beginPath();
      self.ctxLines.moveTo(hero.x, hero.y);
    }

    hero.x += x;
    hero.y -= y;

    if (hero.penDown) {
      self.ctxLines.lineTo(self.heroes[who].x, self.heroes[who].y);
      self.ctxLines.stroke();
    }

    self.animate(id);
  };

  /**
   * Lift or lower the pen.
   * @param {boolean} down True if down, false if up.
   * @param {?string} id ID of block.
   */
  self.penDown = function(who, down, id) {
    if (self.heroes[who])
    {
      self.heroes[who].penDown = down;
    }
    self.animate(id);
  };

  /**
   * Change the thickness of lines.
   * @param {number} width New thickness in pixels.
   * @param {?string} id ID of block.
   */
  self.penWidth = function(who, width, id) {
    if (self.heroes[who])
    {
      self.heroes[who].width = width;
    }
    self.animate(id);
  };

  /**
   * Change the colour of the pen.
   * @param {string} colour Hexadecimal #rrggbb colour string.
   * @param {?string} id ID of block.
   */
  self.penColour = function(who, colour, id) {
    if (self.heroes[who])
    {
      self.heroes[who].colour = colour;
    }
    self.animate(id);
  };

  //
  // Add sounds to our library.
  //
  Heroes.NOISES.forEach(function(el)
  {
    self.workspace.loadAudio_(['heroes/' + el[1] + '.mp3'], el[1]);
  });
  self.makeNoise = function(name, id)
  {
    self.workspace.playAudio(name, 0.5);
    self.animate(id);
  }

  //
  // Hero speech.
  //
  self.speak = function(who, what, seconds, id)
  {
    self.words[who] = what;
    clearTimeout(self.word_timeouts[who]);
    self.word_timeouts[who] = setTimeout(function()
    {
      self.words[who] = "";
    }, seconds*1000);
    self.animate(id);
  }

  self.setTitle = function(title, id)
  {
    self.title = title;
  }

  // Events for override.
  self.setButtonCallback = function(which, fn, id)
  {
    self.key_events[which] = fn;
    self.animate(id);
  }

  self.setCollisionCallback = function(a, b, fn, id)
  {
    self.collision_events[a] = self.collision_events[a] || {};
    self.collision_events[a][b] = fn;
    self.animate(id);
  }

  /**
   * Start the event polling.
   */
  self.startGame = function() {
    var self = this;
    self.items = []

    //
    // Track each key press.
    //

    var keys = {};
    $(document)['keydown'](function( event ) {
      if (self.key_events[event.which])
      {
        event.preventDefault();
      }
      keys[event.which] = true;
    });
    $(document)['keyup'](function( event ) {
      keys[event.which] = false;
    });

    self.eventLoop = setInterval(function()
      {
        //
        // Check for key presses.
        //

        for (event in self.key_events)
        {
          if (keys[event])
          {
            self.interpreter['appendCode'](self.key_events[event]);
            while (self.interpreter.step()){};
          }
        }

        self.checkCollisions();

        self.display();
      }, 20);
  };

  //
  // Check for collision events.
  //
  self.checkCollisions = function()
  {
    for (var a in self.collision_events)
    {
      var hero_a = self.heroes[a];
      for (var b in self.collision_events[a])
      {
        // Assume B is either an item or a hero.
        if (b == "item")
        {
          // Iterate in reverse so the index isn't affected when we remove elements.
          var i = self.items.length
          var item;
          while (i--) {
            item = self.items[i];
            if (compute_distance(item.x, item.y, hero_a.x, hero_a.y) < (hero_a.radius + self.item_radius))
            {
              self.interpreter['appendCode'](self.collision_events[a][b]);
              while (self.interpreter.step()){};
              self.items.splice(i, 1);
            }
          }
        }
        else
        {
          var hero_b = self.heroes[b];
          if (compute_distance(hero_b.x, hero_b.y, hero_a.x, hero_a.y) < (hero_a.radius + hero_b.radius))
          {
            if (self.collisions_in_progress[a + b] == false)
            {
              self.interpreter['appendCode'](self.collision_events[a][b]);
              while (self.interpreter.step()){};
              self.items.splice(i, 1);
            }
            self.collisions_in_progress[a + b] = true;
          }
          else
          {
            self.collisions_in_progress[a + b] = false;
          }
        }
      }
    }
  }
}

/**
 * Initialize Blockly and the shared Heroes object. All games will share these values.
 */
Heroes.init = function() {

  //
  // First, figure out if they are in viewing or editing mode.
  //

  //
  // Some global Blockly setup.
  //
  Blockly.SOUND_LIMIT = 50;

  Heroes.HEIGHT = 400;
  Heroes.WIDTH = 570;

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

  // Render the Soy template.
  document.body.innerHTML = Heroes.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: 4,
       html: BlocklyGames.IS_HTML,
       suffix: "&username="+getUsername()});

  BlocklyInterface.init();

  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,penUp,penDown,penWidth,penColour,' +
      'hideHeroes,showHeroes,print,font');

  // Initialize the slider.
  var sliderSvg = document.getElementById('slider');
  Heroes.speedSlider = new Slider(10, 35, 130, sliderSvg);

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);
  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);

  // Add a game
  var student_workspace = Heroes.addGame(false, getUsername());
  initStudentWilddog( "Heroes", "", student_workspace, getSavedGame());

  if (getUsername() !== "Classadoo_instructor")
  {
    Heroes.add_remote_user("Classadoo_instructor");
    var publish = function(e) {
      var project_name = prompt("Choose a project name", getUsername() + "'s game");
      if (project_name)
      {
        update_snapshot(getUsername(), Blockly.Xml.domToText(
          Blockly.Xml.workspaceToDom(student_workspace)), project_name);
      }
    };
    BlocklyGames.bindClick('publishButton', publish);
  }

  var student_dropdown = $('#student_dropdown');
  add_new_student_callback(function(username)
  {
    if (username.key() == getUsername())
    {
      return;
    }
    username = username.key();
    student_dropdown['append']($('<option></option>')['val'](username)['html'](username));
    if (username == "Classadoo_instructor")
    {
      student_dropdown['val'](username);
    }
    //
    // If this is the first user to show up, trigger the change event manually.
    //
    if (!Heroes.remote_user)
    {
      Heroes.add_remote_user(username);
    }
  });

  student_dropdown['change'](function()
  {
    Heroes.add_remote_user($(this)['val']());
  });


};

Heroes.addGame = function(readOnly, username)
{
  //
  // Set up the HTML.
  //

  var new_game = document.createElement("div");
  new_game.id = username + "_container";
  new_game.className = "row";
  var publish_button = readOnly ? "" : Heroes.PUBLISH_HTML;
  new_game.innerHTML = Heroes.GAME_HTML.replace(/{user}/g, username)
    .replace(/{read_only}/g, readOnly)
    .replace("{publish_button}", publish_button);

  var games_div = document.getElementById('games');
  games_div.appendChild(new_game);

  if (!readOnly)
  {
    var dropdown = document.createElement("div");
    dropdown.innerHTML = Heroes.USER_DROPDOWN;
    games_div.appendChild(dropdown);
  }

  //
  // Add the game to the screen.
  //
  var toolbox = document.getElementById('toolbox');
  var workspace = Blockly.inject(username + '_blockly',
     {'media': 'third-party/blockly/media/',
      'toolbox': readOnly ? null : toolbox,
      'readOnly' : readOnly,
      'zoom': {'controls': !readOnly, 'wheel': false}});
  workspace.traceOn(true);
  workspace.loadAudio_(['heroes/win.mp3', 'heroes/win.ogg'], 'win');

  var game = new Game(username, workspace);
  game.reset();

  BlocklyGames.bindClick(username + '_runButton', game.runButtonClick);
  BlocklyGames.bindClick(username + '_resetButton', game.resetButtonClick);
  return workspace;
}

Heroes.add_remote_user = function(username)
{
  //
  // Hide the old remote user.
  //
  if (Heroes.remote_user)
  {
    document.getElementById(Heroes.remote_user + "_container").style.display = "none";
  }
  Heroes.remote_user = username;
  //
  // Create or show the new remote user.
  //
  var container = document.getElementById(username + "_container");
  if (container)
  {
    container.style.display = "block";
  }
  else
  {
    var remote_workspace = Heroes.addGame(true, username);
    connectSubscriber(username, remote_workspace, getSavedGame());
  }
}


window.addEventListener('load', Heroes.init);

var compute_distance = function(x1, y1, x2, y2)
{
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}
