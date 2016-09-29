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
goog.require('HeroesGame');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Heroes.Blocks');
goog.require('Maze.Blocks');
goog.require('Turtle_Collab.Blocks');
goog.require('Heroes.soy');

goog.require('WilddogUtils');


BlocklyGames.NAME = 'heroes';


// TODO(aheine): use jquery instead of a string of HTML. Also move this to a new file.
Heroes.GAME_HTML =
  '<div class="col-md-6 no-padding">' +
    '<canvas id="{user}-scratch" style="display: none"></canvas>' +
    '<canvas id="{user}-display"></canvas>' +
    '<canvas id="{user}-lines" style="display: none"></canvas>' +
    '<button id="{user}-runButton" class="primary" title="Run the program you wrote." style="height:40px">' +
      '<img src="common/1x1.gif" class="run icon21"> Run Program' +
    '</button>' +
    '<button id="{user}-resetButton" class="primary" style="display: none" title="Stop the program and reset the level." style="height:40px">' +
      '<img src="common/1x1.gif" class="stop icon21"> Reset' +
    '</button>' +
  '</div>'
Heroes.BLOCKLY_HTML =
  '<div class="col-md-6 no-padding ide">' +
    '<ul class="nav nav-tabs" id="{user}-tabs" role="tablist">' +
      '<li class="{read_only}-hero-form" role="presentation" id="{user}-new-hero-button"><a data-toggle="tab" role="tab" href="#{user}-add-hero" aria-controls="{user}-add-hero"> + New Hero</a></li>'  +
    '</ul>' +
    '<div class="tab-content" id="{user}-blockly" style="width:100%">' +
      '<form role="tabpanel" class="tab-pane" id="{user}-add-hero">' +
        '<div class="form-group">' +
          '<label for="hero-name">Name</label>' +
          '<input type="text" class="form-control" id="{user}-hero-name" placeholder="Andrew">' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="hero-type">Type</label>' +
          '<select class="form-control" id="{user}-hero-type"></select>' +
        '</div>' +
        '<button type="button" class="btn btn-default" id={user}-submit-hero>Submit</button>' +
      '</form>' +
    '</div>' +
  '</div>';

Heroes.USER_DROPDOWN = '<select id="student_dropdown"></select>';


/**
 * Initialize Blockly and the shared Heroes object. All games will share these values.
 */
Heroes.init = function() {

  //
  // First, figure out if they are in viewing or editing mode.
  //


  //
  // What class are they registered for?
  //
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/");
  var classroom = ref['child']("users")['child'](getUsername())['child']("classroom");
  var all_classrooms = ref['child']("classrooms");

  classroom['on']("value", function(snapshot)
  {
    //
    // If we're not in a class, or our username doesn't exist, do nothing.
    //
    if (!snapshot['val']())
    {
      return;
    }

    //
    // Set header.
    //
    Heroes.classroom = snapshot['val']();
    $('#username-header')['html'](getUsername() + " - " + Heroes.classroom);

    //
    // Setup the games for us and our classmates.
    //

    Heroes.loadBlockly();
    Heroes.setupGames();

    //
    // Register callback for the max level of this classroom.
    //
    all_classrooms["child"](Heroes.classroom)["on"]("value", function(room)
    {
      if (room['val']())
      {
        var level_allowed = room['val']()['level'] || 999;
        Heroes.setMaxLevel(level_allowed);
      }
    });
  });
};

Heroes.loadBlockly = function()
{
  //
  // Some global Blockly setup.
  //
  Blockly.SOUND_LIMIT = 50;

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
       maxLevel: 5,
       html: BlocklyGames.IS_HTML,
       suffix: "&username=" + getUsername() + "&saved=" + getSavedGame()});

  BlocklyInterface.init();

  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,penUp,penDown,penWidth,penColour,' +
      'hideHeroes,showHeroes,print,font');

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);
  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);
}

Heroes.setupGames = function()
{
  if (Heroes.games_initialized)
  {
    return;
  }
  Heroes.games_initialized = true;

  // Add a game
  var student_game = Heroes.addGame(false, getUsername());

  publishWorkspace(getUsername(), "world", "world", null);
  publishWorkspace(getUsername(), getUsername(), "human", null);
  student_game.reset();

  if (getUsername() !== "Classadoo_instructor")
  {
    Heroes.add_remote_user("Classadoo_instructor");
  }

  var student_dropdown = $('#student_dropdown');


  var users = new Wilddog("https://blocklypipe.wilddogio.com/users");
  users['on']("child_added", function(user)
  {
    var username = user['key']();
    if (username == getUsername())
    {
      return;
    }

    var new_classmate = function()
    {
      student_dropdown['append']($('<option></option>')['val'](username)['html'](username));
      if (username == "Classadoo_instructor")
      {
        student_dropdown['val'](username);
      }
    }

    var correct_class = !Heroes.classroom || user['val']()['classroom'] == Heroes.classroom;
    if (correct_class)
    {
      new_classmate();
    }
    else
    {
      users['child'](username)['on']("value", function(snapshot)
      {
        if (snapshot['val']())
        {
          if (snapshot['val']()['classroom'] == Heroes.classroom)
          {
            new_classmate();
          }
        }
      });
    }
  });

  student_dropdown['change'](function()
  {
    Heroes.add_remote_user($(this)['val']());
  });

  //
  // Now that our game is setup, subscribe to changes.
  //
  initStudentWilddog( "Heroes", BlocklyGames.LEVEL, student_game.ide, getSavedGame());
}


Heroes.addGame = function(readOnly, username)
{
  //
  // Set up the HTML.
  //

  var new_game = $('<div class="row" id="' + username + '_container" style="height:100%"></div>');

  var game_html = $(Heroes.GAME_HTML.replace(/{user}/g, username));

  var blockly_html = $(Heroes.BLOCKLY_HTML.replace(/{user}/g, username)
    .replace(/{read_only}/g, readOnly));

  new_game.append(blockly_html).append(game_html);

  var games_div = $('#games');
  games_div.append(new_game);


  var game = new Game(username);

  BlocklyGames.bindClick(username + '-runButton', game.runButtonClick);
  BlocklyGames.bindClick(username + '-resetButton', game.resetButtonClick);

  return game;
}

Heroes.add_remote_user = function(username)
{
  Heroes.remote_user = username;
  //
  // Create or show the new remote user.
  //
  var remote_game = Heroes.addGame(true, username);
  remote_game.reset()

  var container = $("#" + username + "_container");
  container.hide();

  connectSubscriber(username, remote_game.ide);
}

Heroes.setMaxLevel = function(level_allowed)
{
  //
  // Go through all the levels and hide the ones that aren't allowed.
  //

  var levels = document.getElementsByClassName("level_number");
  for (var i=0; i < levels.length; i++)
  {
    var num = levels[i].id.replace("level", "");
    num = parseInt(num);
    if (num > level_allowed)
    {
      levels[i].style.display = "none";
    }
    else
    {
      levels[i].style.display = "inline";
    }
  }
}

window.addEventListener('load', Heroes.init);

var compute_distance = function(x1, y1, x2, y2)
{
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}
