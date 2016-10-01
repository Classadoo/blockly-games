/**
 * Blockly Games: Turtle
 *
 * Copyright 2012 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Turtle application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Teacher_Dash');

goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Turtle_Collab.Blocks');

goog.require('Heroes.Blocks');
goog.require('HeroesIDE');
goog.require('Maze.Blocks');
goog.require('Teacher_Dash.soy');

goog.require('WilddogUtils');

BlocklyGames.NAME = 'TeacherDash';


// TODO(aheine): DRY this out.
Heroes.BLOCKLY_HTML =
'<div class="row"' +
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
  '</div>' +
'</div>';


Teacher_Dash.newStudentBlockly = function(username)
{
  var new_student = $('<div class="container-fluid" id="' + username + '_container"></div>');
  new_student.append(
    '<div>' +
    '<span class="username">' + username + '</span>' +
    '<span class="user_level" id="' + username + '_level">Level ?</span>' +
    '<button type="button" class="user_clear" id="' + username + '_clear">Clear</button>' +
    '<input type="text" id="' + username + '-pick-id" />' +
    '<button type="button" class="send-pick-id" id="' + username + '-send-pick-id">Send IDE</button>' +
    '<span class="running_code" id="' + username + '_code_running"></span>' +
    '<span class="user_error" id="' + username + '_error"></span>' +
    '</div>');
  new_student.append(Heroes.BLOCKLY_HTML.replace(/{user}/g, username)
    .replace(/{read_only}/g, false));


  $('#students').append(new_student);
}

var received_snapshots = {};
/// Initialize a two-way collaborative canvas with a new game.
Teacher_Dash.initGame = function(username, game_id)
{
  //
  // Add the HTML containers for the student
  //
  Teacher_Dash.newStudentBlockly(username);

  //
  // Setup remote control of canvas.
  //

  var ide = new IDE(username, null, Teacher_Dash.wilddog);
  Teacher_Dash.wilddog.connectSubscriberGame(game_id, ide);

  //
  // Delete EVERY reference to and from this game. Scary.
  //
  $('#' + username + '_clear')['click'](function()
  {
    if (confirm("Are you sure?"))
    {
      Teacher_Dash.wilddog.removeGame(username, game_id, ide, ide_tabs);
    }
  });

  $('#' + username + '-send-pick-id')['click'](function()
  {
    var ide = $('#' + username + '-pick-id')['val']() || username;
    Teacher_Dash.wilddog.setIDE(username, ide);
  });

  // Watch out for the game being deleted.
  var game_ref = Teacher_Dash.wilddog.ref['child']("games")['child'](game_id);
  game_ref['parent']()['on']('child_removed', function(old_snapshot)
  {
    if (old_snapshot['key']() == game_id)
    {
      //TODO(aheine): make a clear method for the IDE and dispose of every workspace from memory.
      //workspace.clear();
      var new_student = document.getElementById(username + "_container");
      new_student.style.display = "none";
    }
  });

  // Watch out for the hero being deleted.
  game_ref['child']("heroes")['on']('child_removed', function(deleted_hero)
  {
    ide.remove_tab(deleted_hero['val']().name);
  });

  // Watch out for the user changing levels.
  var user_ref = Teacher_Dash.wilddog.ref['child']("users")['child'](username);
  user_ref['child']("level")['on']("value",  function(level)
  {
    var level_div = document.getElementById(username + "_level");
    if (level_div)
    {
      level_div.innerHTML = "Level " + level['val']();
    }
  });

  // Watch out for user javascript errors.
  user_ref['child']("error")['on']("value",  function(err_string)
  {
    var error_div = document.getElementById(username + "_error");
    if (error_div)
    {
      error_div.innerHTML = err_string['val']() ? "ERROR: " + err_string['val']() : "";
    }
  });

  var code_running_div = document.getElementById(username + "_code_running");
  user_ref['child']("code_running")['on']("value",  function(canvases)
  {
    canvases = canvases['val']();
    if (!canvases)
    {
      return;
    }
    code_running_div.innerHTML = "";
    for (var canvas in canvases)
    {
      if (canvases[canvas] === true)
      {
        code_running_div.innerHTML = code_running_div.innerHTML || "Running";
        code_running_div.innerHTML = code_running_div.innerHTML + " : " + canvas;
      }
    }
  });

  Teacher_Dash.users.push(username);
}


/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Teacher_Dash.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Teacher_Dash.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       html: BlocklyGames.IS_HTML});
  BlocklyInterface.init();

  Teacher_Dash.users = [];

  Teacher_Dash.wilddog = new WilddogInterface(getClassroom());

  Teacher_Dash.wilddog.connectSubscriberClassroom(Teacher_Dash.initGame);

  $('#send-pick-ide')['click'](function()
  {
    if (confirm("Are you sure?"))
    {
      var ide = $("#pick-ide")['val']();
      Teacher_Dash.users.forEach(function(username)
      {
        Teacher_Dash.wilddog.setIDE(username, ide || username);
      })
    }
  });
};

window.addEventListener('load', Teacher_Dash.init);
