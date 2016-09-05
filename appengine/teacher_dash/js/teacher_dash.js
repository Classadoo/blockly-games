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
goog.require('Turtle.Blocks');

goog.require('Heroes.Blocks');
goog.require('Puzzle.Blocks');
goog.require('Maze.Blocks');
goog.require('Teacher_Dash.soy');
goog.require('WilddogUtils');

var newStudentBlockly = function(username)
{
  var new_student = document.createElement("div");
  new_student.id = username + "_container";
  new_student.innerHTML =
    '<span class="username">' + username + '</span>' +
    '<span class="user_level" id="' + username + '_level">Level ?</span>' +
    '<button type="button" class="user_clear" id="' + username + '_clear">Clear</button>' +
    '<span class="user_error" id="' + username + '_error"></span>' +
    '<div class="blockly" id="' + username + '_blockly"></div>';
  document.getElementById('students').appendChild(new_student);

  document.getElementById(username + '_clear').addEventListener("click", function()
  {
    clear_one_user(username);
  });

  var toolbox = document.getElementById('toolbox');
  return Blockly.inject(username + '_blockly',
      {'media': 'third-party/blockly/media/',
       'rtl': false,
       'scrollbars':true,
       'toolbox': toolbox,
       'trashcan': true,
       'zoom': {'controls': true, 'wheel': true}
     });
}

var received_snapshots = {};
/// Initialize a two-way collaborative canvas with a new student.
var initStudent = function(username)
{
  //
  // Inject a new blockly canvas into the list of canvases.
  //

  var workspace = newStudentBlockly(username);

  //
  // Setup remote control of canvas.
  //

  var events_in_progress = {};
  connectPublisher(username, workspace);

  //
  // Setup remote reading of canvas.
  //

  connectSubscriber(username, workspace);

  add_user_remove_callback(username, function()
  {
      workspace.clear();
  });

  add_user_level_callback(username, function(level)
  {
    var level_div = document.getElementById(username + "_level");
    if (level_div)
    {
      level_div.innerHTML = "Level " + level;
    }
  });

  add_error_callback(username, function(err_string)
  {
    var error_div = document.getElementById(username + "_error");
    if (error_div)
    {
      error_div.innerHTML = err_string ? "ERROR: " + err_string : "";
    }
  });
}

/// Initialize listener for new students and publisher for teacher updates.
var initWildDog = function(){

  var user_name = "classadoo_instructor";

  var new_student_callback = function(user) {
    if (user.key() != user_name)
    {
      initStudent(user.key());
    }
  }

  add_new_student_callback(new_student_callback);
}

//myao end of the code to enable wilddog.


BlocklyGames.NAME = 'TeacherDash';

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Turtle.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Teacher_Dash.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  var clearStudents = document.getElementById('clearStudents');
  clearStudents.addEventListener("click", function()
  {
    clear_users();
  });

  initWildDog();
};

window.addEventListener('load', Turtle.init);
