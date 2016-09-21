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
goog.require('Slider');
goog.require('Heroes.Blocks');
goog.require('Maze.Blocks');
goog.require('Turtle_Collab.Blocks');
goog.require('Heroes.soy');

goog.require('WilddogUtils');


BlocklyGames.NAME = 'heroes';


// TODO(aheine): use jquery instead of a string of HTML. Also move this to a new file.
Heroes.GAME_HTML =
  '<div class="visualization">' +
    '<canvas id="{user}-scratch" width="570" height="400" style="display: none"></canvas>' +
    '<canvas id="{user}-display" width="570" height="400"></canvas>' +
    '<canvas id="{user}-lines" width="570" height="400" style="display: none"></canvas>' +
    '<table style="padding-top: 1em;">' +
      '<tr>' +
        '<td style="width: 15px;">' +
          '<img id="{user}-spinner" style="visibility: hidden;" src="heroes/loading.gif" height=15 width=15>' +
        '</td>' +
        '<td style="width: 190px; text-align: center">' +
          '<button id="{user}-runButton" class="primary" title="Run the program you wrote.">' +
            '<img src="common/1x1.gif" class="run icon21"> Run Program' +
          '</button>' +
          '<button id="{user}-resetButton" class="primary" style="display: none" title="Stop the program and reset the level.">' +
            '<img src="common/1x1.gif" class="stop icon21"> Reset' +
          '</button>' +
          '{publish_button}' +
        '</td>' +
      '</tr>' +
    '</table>' +
  '</div>' +
  '<div class=blockly>' +
    '<ul class="nav nav-tabs" id="{user}-tabs" role="tablist">' +
      '<li class="{read_only}-hero-form" role="presentation" id="{user}-new-hero-button"><a data-toggle="tab" role="tab" href="#{user}-add-hero" aria-controls="{user}-add-hero"> + New Hero</a></li>'  +
    '</ul>' +
    '<div class="tab-content" id="{user}-blockly">' +
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



Heroes.PUBLISH_HTML =
'<td><button id="publishButton" class="primary publish" title="Save this program for viewing later.">' +
  '<img src="common/1x1.gif" class="camera icon21"> Publish Project</button></td>'

Heroes.USER_DROPDOWN = '<select id="student_dropdown"></select>';


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
       maxLevel: 5,
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
  var student_game = Heroes.addGame(false, getUsername());
  initStudentWilddog( "Heroes", BlocklyGames.LEVEL, student_game, getSavedGame());
  student_game.setup_game_world();
  student_game.addHero(getUsername(), "human");
  student_game.reset();

  if (getUsername() !== "Classadoo_instructor")
  {
    Heroes.add_remote_user("Classadoo_instructor");
    var publish = function(e) {
      var project_name = prompt("Choose a project name", getUsername() + "'s game");
      if (project_name)
      {

        snapshot_key = snapshot_key || "Untitled Heroes";
        var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + getUsername() + "/snapshots");

        var snapshot_obj = {};
        snapshot_obj[snapshot_key] = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(student_workspace));
        ref['update'](snapshot_obj);

      }
    };
    BlocklyGames.bindClick('publishButton', publish);
  }

  var student_dropdown = $('#student_dropdown');
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/");
  var users = ref['child']("users");
  var classrooms = ref['child']("classrooms");

  users['child'](getUsername())['on']("value", function(snapshot)
  {
    //
    // Hide levels if we are in a class.
    //
    if (!snapshot['val']())
    {
      return;
    }
    if (!snapshot['val']()['classroom'])
    {
      return;
    }
    Heroes.classroom = snapshot['val']()['classroom'];
    classrooms["child"](Heroes.classroom)["on"]("value", function(snapshot)
    {
      var room = snapshot['val']();
      if (room)
      {
        var level_allowed = room['level'] || 999;

        //
        // Now do something crazy - go through all the levels and hide the ones that aren't allowed.
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
    })
  });

  users['on']("child_added", function(user)
  {
    var username = user['key']();
    if (username == getUsername())
    {
      return;
    }

    var new_classmate = function()
    {
      student_dropdown.append($('<option></option>')['val'](username)['html'](username));
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


  var game = new Game(username);

  BlocklyGames.bindClick(username + '-runButton', game.runButtonClick);
  BlocklyGames.bindClick(username + '-resetButton', game.resetButtonClick);

  return game;
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
    var remote_game = Heroes.addGame(true, username);
    remote_game.setup_game_world();
    remote_game.reset()
    connectSubscriber(username, remote_game, getSavedGame());
  }
}


window.addEventListener('load', Heroes.init);

var compute_distance = function(x1, y1, x2, y2)
{
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}
