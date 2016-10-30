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
  '<div class="col-xs-6 no-padding">' +
    '<canvas id="{user}-scratch" style="display: none"></canvas>' +
    '<canvas id="{user}-display"></canvas>' +
    '<canvas id="{user}-lines" style="display: none"></canvas>' +
    '<button id="{user}-runButton" class="primary" title="Run the program you wrote." style="height:42px;">' +
      '<img src="common/1x1.gif" class="run icon21"> Run Program' +
    '</button>' +
    '<button id="{user}-resetButton" class="primary" style="display: none; height:42px;" title="Stop the program and reset the level.">' +
      '<img src="common/1x1.gif" class="stop icon21"> Reset' +
    '</button>' +
  '</div>'
Heroes.BLOCKLY_HTML =
  '<div class="col-xs-6 no-padding ide">' +
    '<ul class="nav nav-tabs" id="{user}-tabs" role="tablist">' +
      '<li style="display:none"><a data-toggle="tab" role="tab" href="#{user}-add-hero" aria-controls="{user}-add-hero"></a></li>'  +
      '<li class="{read_only}-hero-form" role="presentation" id="{user}-new-hero-button"><a href="#"> + New Hero</a></li>'  +
    '</ul>' +
    '<div class="tab-content read_only_{read_only}" id="{user}-blockly" style="width:100%">' +
      '<div role="tabpanel" class="tab-pane" id="{user}-add-hero">' +
        '<form class="form-inline">' +
          '<div class="form-group form-item">' +
            '<label for="hero-name">Name</label>' +
            '<input type="text" class="form-control" id="{user}-hero-name">' +
          '</div>' +
          '<div class="form-group form-item">' +
            '<label for="hero-type">Type</label>' +
            '<select class="form-control" id="{user}-hero-type"></select>' +
          '</div>' +
          '<button type="button" class="btn btn-success form-item" id={user}-submit-hero>Submit</button>' +
          '<a id="{user}-x" class="form-item"><img width="15px" height="15px" src="heroes/x.png"></a>' +
        '</form>' +
        '<div class="row">' +
          '<div class="col-xs-3 thumbnails" id={user}-thumbnails>' +
            '<div id="{user}-add-costume"><button type="button" class="btn btn-warning">New Image</button></div>' +
          '</div>' +
          '<div class="col-xs-9 literally-canvas">' +
            '<div id="paint-{user}"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
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
  // Initialize our Wilddog connection
  //

  Heroes.classroom = getClassroom();
  Heroes.wilddog = new WilddogInterface(Heroes.classroom);

  //
  // Setup Push-to-talk
  //

  // TODO: configure this some other way.
  var rtc = false;
  var ptt;
  if (rtc)
  {
    ptt = new pushToTalk("https://classadoo-heroes.wilddogio.com/classrooms/" + Heroes.classroom, getUsername());
  }
  else
  {
    ptt = new Opus(new Wilddog("https://nihaoclass.wilddogio.com/recordings/" + Heroes.classroom), getUsername());
  }

  document.addEventListener("keydown", function(e) {
    if(e.keyCode == 13) {
      ptt['enableStream'](true);
    }
  });
  document.addEventListener("keyup", function(e) {
    if(e.keyCode == 13) {
      ptt['enableStream'](false);
    }
  });


  var username = getUsername();
  Heroes.wilddog.setIDE(username, username);
  Heroes.wilddog.setLevel(username, BlocklyGames.LEVEL);
  Heroes.wilddog.setError(username, "");
  var last_err_string = "";
  window.onerror = function(errorMsg, url, lineNumber)
  {
    var err_string = errorMsg + " - " + url + " - " + lineNumber;
    if (err_string != last_err_string)
    {
      Heroes.wilddog.setError(getUsername(), err_string);
    }
  }

  //
  // Listen for new users, and for when to show their IDEs.
  //
  Heroes.games = {};
  Heroes.wilddog.connectSubscriberClassroom(Heroes.add_user, Heroes.setMaxLevel);
  Heroes.wilddog.subscribeToIDE(username, function(ide_name)
  {
    // Hide other IDEs
    for (var game in Heroes.games)
    {
      Heroes.games[game].hide();
    }

    // Show this one.
    if (Heroes.games[ide_name])
    {
      Heroes.games[ide_name].show()
    }
    Heroes.displayed_ide = ide_name;
  })

  //
  // Setup the games for us and our classmates.
  //

  Heroes.loadBlockly();
  Heroes.setupGames();
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
       suffix: "&username=" + getUsername() + "&saved=" + getSavedGame() + "&classroom=" + getClassroom()});

  //
  // Set header.
  //
  $('#username-header')['html'](getUsername() + " - " + Heroes.classroom);

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

  if (!getSavedGame())
  {
    Heroes.new_game = true;
    var game_id = Heroes.wilddog.publishNewGame(getUsername());
    var newurl = window.location.href + '&saved=' + encodeURIComponent(game_id);
    window.history.replaceState({path:newurl},'',newurl);
  }
}


Heroes.addGame = function(readOnly, username, game_id)
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

  var game = new Game(username, Heroes.wilddog, game_id);

  // Initialize the world, if this is a fresh game.
  if (Heroes.new_game && username == getUsername())
  {
    //TODO(aheine): it's pointless to preload these now. Just store the data url.
    game.ide.publishHero("world", "world", [chars["world"]]);
    game.ide.publishHero(getUsername(), "human", [chars["human"], chars["human2"]]);
  }

  BlocklyGames.bindClick(username + '-runButton', game.runButtonClick);
  BlocklyGames.bindClick(username + '-resetButton', game.resetButtonClick);

  Heroes.games[username] = game;
  return game;
}

Heroes.add_user = function(username, game_id)
{
  //
  // Create the new remote user.
  //
  var read_only = username != getUsername();
  var game = Heroes.addGame(read_only, username, game_id);

  game.reset()

  if (username != Heroes.displayed_ide)
  {
    game.hide();
  }
  else {
    game.show();
  }

  Heroes.wilddog.connectSubscriberGame(game_id, game.ide);
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
