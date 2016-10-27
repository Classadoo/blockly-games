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
goog.require('HeroesIDE');


//
// Constructor for a new game object.
//
var Game = function(username, wilddog, id)
{
var self = this;

self.id = id;
self.username = username;
self.pidList = [];

self.ctxDisplay = document.getElementById(self.username + '-display').getContext('2d');
self.ctxScratch = document.getElementById(self.username + '-scratch').getContext('2d');
self.ctxLines = document.getElementById(self.username + '-lines').getContext('2d');

// HACK! We never want to clear the lines (because we don't store them). So we can't resize this later.
self.ctxLines.canvas.width = 3000;
self.ctxLines.canvas.height = 3000;

Heroes.HEIGHT = self.ctxDisplay.canvas.parentElement.clientHeight - 68 || Heroes.HEIGHT;
Heroes.WIDTH = self.ctxDisplay.canvas.parentElement.clientWidth || Heroes.WIDTH;

self.ide = new IDE(username, self, wilddog);

var hero_radius = 40;

self.heroes = {};

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

  var ref = new Wilddog("https://classadoo-heroes.wilddogio.com/users/" + getUsername() + "/code_running");
  var code_obj = {};
  code_obj[self.username] = false;
  ref['update'](code_obj);
};

self.display = function() {
  //
  // Resize and clear the display
  //

  var display_canvas = self.ctxDisplay.canvas;
  var scratch_canvas = self.ctxScratch.canvas;

  if (self.active)
  {
    Heroes.HEIGHT = display_canvas.parentElement.clientHeight - 68;
    Heroes.WIDTH = display_canvas.parentElement.clientWidth;
  }

  display_canvas.width = Heroes.WIDTH;
  display_canvas.height = Heroes.HEIGHT;
  scratch_canvas.width = Heroes.WIDTH;
  scratch_canvas.height = Heroes.HEIGHT;

  self.ctxScratch.clearRect(0, 0, display_canvas.clientWidth, display_canvas.clientHeight);
  self.ctxDisplay.clearRect(0, 0, display_canvas.clientWidth, display_canvas.clientHeight);

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

self.update_hero = function(hero, x, y, images)
{
  self.heroes[hero].starting_x = x;
  self.heroes[hero].starting_y = y;
  
  if (images)
  {
    self.heroes[hero].setImages(images);
  }
  if (self.pidList.length == 0)
  {
    self.reset();
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

  var game_speed = 30
  self.reset();
  self.startGame(game_speed);

  self.game_world.execute();
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
  var runButton = document.getElementById(self.username + '-runButton');
  var resetButton = document.getElementById(self.username + '-resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  runButton.style.display = 'none';
  resetButton.style.display = 'inline';
  self.execute();

  var ref = new Wilddog("https://classadoo-heroes.wilddogio.com/users/" + getUsername() + "/code_running");
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
  self.reset();
};

self.setup_game_world = function(ide_tab)
{
  self.game_world = new GameWorld(username, ide_tab);
  self.reset();
}

self.addHero = function(name, type, ide_tab, x, y, images) {

  self.heroes[name] = new Hero(name, type, hero_radius, x, y, self.ctxLines,
    self.ctxDisplay, ide_tab, self, images);

  //
  // Draw her.
  //

  self.display();
  return self.heroes[name];
};

self.remove_hero = function(name)
{
  //
  // Forget the object.
  //
  delete self.heroes[name];


  //
  // Redraw without her.
  //
  self.display();
};

/**
 * Start the event polling.
 */
self.startGame = function(game_speed) {
  self.eventLoop = setInterval(function()
  {
    //
    // Check for events, then redraw the display
    // TODO(aheine): check for events actually firing before calling display().
    //
    for (var hero in self.heroes)
    {
      self.heroes[hero].checkKeyEvents();
      self.heroes[hero].checkCollisions(self.heroes, self.game_world.items, self.game_world.item_radius);
    }

    self.display();
  }, game_speed);
};



self.hide = function()
{
  var container = $("#" + username + "_container");
  container['hide']();
  self.active = false;
}

self.show = function()
{
  var container = $("#" + username + "_container");
  container['show']();

  self.active = true;

  self.ide.display();
  self.display();
}

window.addEventListener('resize', self.display);
}
