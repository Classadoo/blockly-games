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
goog.require('Teacher_Dash.soy');

/// Initialize a two-way collaborative canvas with a new student.
var initStudent = function(wilddog_students_ref, student_div, username, user_id)
{

  //
  // Inject a new blockly canvas into the list of canvases.
  //

  var new_student = document.createElement("div");
  new_student.innerHTML = '<div>' + username + '</div><div class="blockly" id="' + username + '_blockly"></div>';
  student_div.appendChild(new_student);
  //
  // Init a new wilddog connection for this canvas.
  //

  var ref = wilddog_students_ref.child(username);

  var toolbox = document.getElementById('toolbox');
  var workspace = Blockly.inject(username + '_blockly',
      {'media': 'third-party/blockly/media/',
       'rtl': false,
       'scrollbars':true,
       'toolbox': toolbox,
       'trashcan': true
     });

  //
  // Setup remote control of canvas.
  //

  var events_in_progress = {};
  workspace.addChangeListener(function(masterEvent) {
    if (masterEvent.type == Blockly.Events.UI) {
      return;  // Don't mirror UI events.
    }

    //
    // Check to see if this event was already incoming. Stop it here.
    //

    if (events_in_progress[masterEvent.blockId + masterEvent.type] === true)
    {
      console.log("dropping remote");
      events_in_progress[masterEvent.blockId + masterEvent.type] = false;
      return;
    }

    // Convert event to JSON for transmitting across the net.
    var json = masterEvent.toJson();
    var wdmsg = {"sender":user_id, "blkmsg":json};

    console.log("Sending student event", masterEvent);
    ref.push(wdmsg);
  });

  //
  // Setup remote reading of canvas.
  //

  ref.on("child_added", function(snapshot) {
    var wdmsg = snapshot.val();
    if(!wdmsg){
        console.log("Nothing in database, return");
        return;
    }

    //
    // Ignore updates from this site.
    //

    if (wdmsg.sender == user_id)
    {
      return;
    }
    var blkmsg = wdmsg.blkmsg;
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
      slaveEvent.run(true);
      if (!existingGroup) {
          Blockly.Events.setGroup(false);
      }
    }
    catch(err) {
        document.getElementById("errmsg").innerHTML = err.message;
    }
  });
}

/// Initialize listener for new students and publisher for teacher updates.
var initWildDog = function(students_div){
  function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users");
  var user_name = "classadoo_instructor";
  var user_id = guid();

  ref.on("child_added", function(snapshot) {
    if (snapshot.key() != user_name)
    {
      initStudent(ref, students_div, snapshot.key(), user_id);
    }
  });
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

  var students = document.getElementById('students');
  initWildDog( students );
};

window.addEventListener('load', Turtle.init);
