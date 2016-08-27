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
goog.require('Puzzle.Blocks');
goog.require('Maze.Blocks');
goog.require('Teacher_Dash.soy');

var newStudentBlockly = function(username)
{
  var new_student = document.createElement("div");
  new_student.id = username + "_container";
  new_student.innerHTML =
    '<span class="username">' + username + '</span>' +
    '<span class="level" id="' + username + '_level">Level ?</span>' +
    '<div class="blockly" id="' + username + '_blockly"></div>';
  document.getElementById('students').appendChild(new_student);

  var toolbox = document.getElementById('toolbox');
  return Blockly.inject(username + '_blockly',
      {'media': 'third-party/blockly/media/',
       'rtl': false,
       'scrollbars':true,
       'toolbox': toolbox,
       'trashcan': true
     });
}

/// Initialize a two-way collaborative canvas with a new student.
var initStudent = function(username, user_id)
{
  //
  // Inject a new blockly canvas into the list of canvases.
  //

  var workspace = newStudentBlockly(username);

  //
  // Setup remote control of canvas.
  //

  var events_in_progress = {};
  workspace.addChangeListener(function(masterEvent) {
    if (masterEvent.type == Blockly.Events.UI) {
      return;
    }

    //
    // Check to see if this event was triggered by Wilddog. If so, do not
    // send it back.
    //

    if (events_in_progress[masterEvent.blockId + masterEvent.type] === true)
    {
      console.log("dropping remote");
      events_in_progress[masterEvent.blockId + masterEvent.type] = false;
      return;
    }

    //
    // Convert event to JSON for transmitting across the net.
    //

    var json = masterEvent.toJson();
    var wdmsg = {"sender":user_id, "blkmsg":json};
    push_to_user(wdmsg, null, username);
  });

  //
  // Setup remote reading of canvas.
  //

  var student_event_callback = function(snapshot) {
    var blkmsg = clean_event(snapshot, user_id);
    if (!blkmsg)
    {
      return;
    }
    var slaveEvent = Blockly.Events.fromJson(blkmsg, workspace);

    try {
      var existingGroup = Blockly.Events.getGroup();
      var groupid = existingGroup;
      if (!existingGroup) {
          Blockly.Events.setGroup(true);
          groupid = Blockly.Events.getGroup();
      }

      console.log(slaveEvent.blockId + slaveEvent.type);
      events_in_progress[slaveEvent.blockId + slaveEvent.type] = true;
      // Create will automatically trigger a move, so don't send our move command back to the student.
      if (slaveEvent.type == "create")
      {
        events_in_progress[slaveEvent.blockId + "move"] = true;
      }
      slaveEvent.run(true);
      if (!existingGroup) {
          Blockly.Events.setGroup(false);
      }
    }
    catch(err) {
        console.log("Error running slave event: ", err.message);
    }
  };
  add_user_event_callback(username, student_event_callback);
  add_user_remove_callback(username, function(old_snapshot)
  {
    var container = document.getElementById(username + "_container");
    if (container)
    {
      container.parentElement.removeChild(container);
    }
  });


  add_user_level_callback(username, function(level)
  {
    document.getElementById(username + "_level").innerHTML = "Level " + level;
  });
}

/// Initialize listener for new students and publisher for teacher updates.
var initWildDog = function(){

  var user_name = "classadoo_instructor";
  var user_id = guid();

  var new_student_callback = function(user) {
    if (user.key() != user_name)
    {
      initStudent(user.key(), user_id);
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
