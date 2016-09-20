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

goog.provide('HeroesGame');

goog.require('HeroObject');
goog.require('GameWorld');


//
// Constructor for a new game object.
//
var Game = function(username)
{
  var self = this;

  self.username = username;
  self.pidList = [];

  self.ctxDisplay = document.getElementById(self.username + '_display').getContext('2d');
  self.ctxScratch = document.getElementById(self.username + '_scratch').getContext('2d');
  self.ctxLines = document.getElementById(self.username + '_lines').getContext('2d');

  self.game_world = new GameWorld(username);

  /**
   * Number of milliseconds that execution should delay.
   * @type number
   */
  self.pause = 0;

  self.radius = 32;


  /**
   * Reset the heroes to the start position, clear the display, and kill any
   * pending tasks.
   */
  self.reset = function() {

    //
    // Clear drawings.
    //
    self.ctxLines.clearRect(0, 0, self.ctxDisplay.canvas.clientWidth, self.ctxDisplay.canvas.clientHeight);
    self.background = null;

    //
    // Clear game state.
    //
    self.points = undefined;
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

    var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + getUsername() + "/code_running");
    var code_obj = {};
    code_obj[self.username] = false;
    ref['update'](code_obj);
  };

  /**
   * Copy the scratch canvas to the display canvas.
   */
  self.display = function() {
    //
    // Clear the display
    //
    self.ctxScratch.clearRect(0, 0, self.ctxDisplay.canvas.clientWidth, self.ctxDisplay.canvas.clientHeight);
    self.ctxDisplay.clearRect(0, 0, self.ctxDisplay.canvas.clientWidth, self.ctxDisplay.canvas.clientHeight);

    self.game_world.draw(self.ctxDisplay);
    for (var hero in self.heroes)
    {
      self.heroes[hero].draw(self.ctxScratch);
    }

    //
    // Copy scratch canvas onto the display canvas.
    //
    self.ctxDisplay.globalCompositeOperation = 'source-over';
    self.ctxDisplay.drawImage(self.ctxLines.canvas, 0, 0);
    self.ctxDisplay.globalCompositeOperation = 'source-over';
    self.ctxDisplay.drawImage(self.ctxScratch.canvas, 0, 0);
  };


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

    self.game_world.execute();
    for (var hero in self.heroes)
    {
      self.heroes[hero].execute();
    }

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

    var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + getUsername() + "/code_running");
    var code_obj = {};
    code_obj[self.username] = true;
    ref['update'](code_obj);
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





  //
  // Heroes actions.
  //
  self.addHero = function(name, type, x, y) {
    self.heroes[name] = new Hero(name, type, self.radius, x, y, username, self.ctxLines);
  };
  self.heroes = {};
  self.addHero("Leo", "lion", Heroes.WIDTH/2, Heroes.HEIGHT/2);
  self.addHero("William", "eagle", Heroes.WIDTH/3, Heroes.HEIGHT/2);
  self.addHero("Andrew", "human", Heroes.WIDTH/3 * 2, Heroes.HEIGHT/2);



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

        for (var keypress in keys)
        {
          for (var hero in self.heroes)
          {
            self.heroes[hero].key_event(keypress);
          }
        }

    //    self.checkCollisions();

        self.display();
      }, 60 - Heroes.speedSlider.getValue() * 50);
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
