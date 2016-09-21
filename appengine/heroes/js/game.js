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

  self.ctxDisplay = document.getElementById(self.username + '-display').getContext('2d');
  self.ctxScratch = document.getElementById(self.username + '-scratch').getContext('2d');
  self.ctxLines = document.getElementById(self.username + '-lines').getContext('2d');

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

    for (var hero in self.heroes)
    {
      self.heroes[hero].reset();
    }
    if (self.game_world)
    {
      self.game_world.reset();
    }

    //
    // Clear game state.
    //

    // Clear the canvas.
    self.ctxScratch.canvas.width = self.ctxScratch.canvas.width;
    self.ctxScratch.strokeStyle = '#ffffff';
    self.ctxScratch.fillStyle = '#ffffff';
    self.ctxScratch.lineWidth = 5;
    self.ctxScratch.lineCap = 'round';
    self.ctxScratch.font = 'normal 18pt Arial';
    self.display();



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

    if (self.game_world)
    {
      self.game_world.draw(self.ctxDisplay);
    }
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

    var game_speed = 60 - Heroes.speedSlider.getValue() * 50
    self.reset();
    self.startGame(game_speed);

    self.game_world.execute(game_speed);
    for (var hero in self.heroes)
    {
      self.heroes[hero].execute(game_speed);
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

    var runButton = document.getElementById(self.username + '-runButton');
    var resetButton = document.getElementById(self.username + '-resetButton');
    // Ensure that Reset button is at least as wide as Run button.
    if (!resetButton.style.minWidth) {
      resetButton.style.minWidth = runButton.offsetWidth + 'px';
    }
    runButton.style.display = 'none';
    resetButton.style.display = 'inline';
    document.getElementById(self.username + '-spinner').style.visibility = 'visible';
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
    var runButton = document.getElementById(self.username + '-runButton');
    runButton.style.display = 'inline';
    document.getElementById(self.username + '-resetButton').style.display = 'none';
    document.getElementById(self.username + '-spinner').style.visibility = 'hidden';
    self.reset();
  };


  //
  // Each new hero should be offset from the last.
  //
  var hero_offset = 4;
  self.starting_x = Heroes.WIDTH/hero_offset/2;
  self.starting_y = Heroes.HEIGHT - Heroes.HEIGHT/hero_offset;

  self.new_hero_callback = function(){};
  self.register_new_hero_callback = function(fn)
  {
    self.new_hero_callback = fn;
  }

  self.setup_game_world = function()
  {
    self.game_world = new GameWorld(username);
    self.new_hero_callback("world", "world", self.game_world.workspace);
  }

  self.addHero = function(name, type) {
    //
    // Register the hero.
    //
    if (self.heroes[name])
    {
      console.log("This hero already exists: ", name);
      return;
    }
    self.heroes[name] = new Hero(name, type, self.radius, self.starting_x,
      self.starting_y, username, self.ctxLines);

    //
    // Draw her.
    //

    self.display();

    //
    // Adjust the starting points.
    //

    self.starting_x += Heroes.WIDTH/hero_offset;
    if (self.starting_x > Heroes.WIDTH)
    {
      self.starting_x = Heroes.WIDTH/hero_offset/2;
      self.starting_y -= Heroes.HEIGHT/hero_offset;

      if (self.starting_y < 0)
      {
        self.starting_y = Heroes.HEIGHT/hero_offset/2;
      }
    }

    self.new_hero_callback(name, self.heroes[name].char, self.heroes[name].workspace);
    return self.heroes[name];
  };

  self.heroes = {};

  ["lion", "eagle", "human"].forEach(function(animal)
  {
    $("#" + username + "-hero-type").append($("<option></option>")
                      .attr("value",animal)
                      .text(animal));
  });
  $("#" + self.username + "-submit-hero").click(function()
  {
    var name = $("#" + username + "-hero-name").val();
    var type = $("#" + username + "-hero-type").val();

    if (!name || !type)
    {
      console.log("Fill out the whole form: ", name, type);
      return;
    }

    self.addHero(name, type);
  })

  /**
   * Start the event polling.
   */
  self.startGame = function(game_speed) {
    var self = this;


    self.eventLoop = setInterval(function()
    {
      //
      // Check for key presses.
      //


      for (var hero in self.heroes)
      {
        self.heroes[hero].checkKeyEvents();
        self.heroes[hero].checkCollisions(self.heroes, self.game_world.items, self.game_world.item_radius);
      }



      self.display();
    }, game_speed);
  };
}
