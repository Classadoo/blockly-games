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

// TODO(aheine): DRY
Heroes.BLOCKLY_HTML =
  '<div class="blockly" id="{user}_blockly">' +
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


var newStudentBlockly = function(username)
{
  var new_student = $('<div class="container-fluid" id="' + username + '_container"></div>');
  new_student.append(
    '<div>' +
    '<span class="username">' + username + '</span>' +
    '<span class="user_level" id="' + username + '_level">Level ?</span>' +
    '<button type="button" class="user_clear" id="' + username + '_clear">Clear</button>' +
    '<span class="running_code" id="' + username + '_code_running"></span>' +
    '<span class="user_error" id="' + username + '_error"></span>' +
    '</div>');
  new_student.append(Heroes.BLOCKLY_HTML.replace(/{user}/g, username)
    .replace(/{read_only}/g, false));


  $('#students').append(new_student);

  $('#' + username + '_clear').click(function()
  {
    var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username);
    ref['remove']();
  });

}

var received_snapshots = {};
/// Initialize a two-way collaborative canvas with a new student.
var initStudent = function(username)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username);

  //
  // Add the HTML containers for the student
  //
  newStudentBlockly(username);

  //
  // Setup remote control of canvas.
  //
  var ide = new IDE(username, null);
  connectSubscriber(username, ide);

  // Watch out for the user being deleted.
  ref['parent']()['on']('child_removed', function(old_snapshot)
  {
    if (old_snapshot['key']() == username)
    {
      //TODO(aheine): make a clear method for the IDE and dispose of every workspace.
      //workspace.clear();
      var new_student = document.getElementById(username + "_container");
      new_student.style.display = "none";
    }
  });


  ref['child']("level")['on']("value",  function(level)
  {
    var level_div = document.getElementById(username + "_level");
    if (level_div)
    {
      level_div.innerHTML = "Level " + level['val']();
    }
  });

  ref['child']("error")['on']("value",  function(err_string)
  {
    var error_div = document.getElementById(username + "_error");
    if (error_div)
    {
      error_div.innerHTML = err_string['val']() ? "ERROR: " + err_string['val']() : "";
    }
  });

  var code_running_div = document.getElementById(username + "_code_running");
  ref['child']("code_running")['on']("value",  function(canvases)
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
}

/// Initialize listener for new students and publisher for teacher updates.
var initWildDog = function(){
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/");

  var classroom = getSavedGame();
  var new_student_callback = function(user) {
    var username = user['key']();

    var correct_class = !classroom || user['val']()['classroom'] == classroom;
    if (correct_class)
    {
      initStudent(username);
    }
    else
    {
    ref['child'](username)['on']("value", function(snapshot)
    {
      if (snapshot['val']())
      {
        if (snapshot['val']()['classroom'] == classroom)
        {
          initStudent(username);
        }
      }
    })
    }

  }

  ref['on']("child_added", new_student_callback);
}

//myao end of the code to enable wilddog.


BlocklyGames.NAME = 'TeacherDash';

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Teacher_Dash.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Teacher_Dash.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();


  var ref = new Wilddog("https://blocklypipe.wilddogio.com");

  var clearStudents = document.getElementById('clearStudents');
  clearStudents.addEventListener("click", function()
  {
    ref['child']('users')['set']({"classadoo_instructor" : {}});
  });

  initWildDog();

  //
  // Create a class if it doesn't already exist.
  //
  var classroom = getQueryParam("classroom");
  if (classroom)
  {
    ref['child']('classes')['child'](classroom)['update']({});
  }
};

window.addEventListener('load', Teacher_Dash.init);
