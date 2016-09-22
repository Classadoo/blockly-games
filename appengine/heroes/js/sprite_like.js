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


goog.provide('SpriteLike');



//
// An object that has a blockly workspace and runs code that shows up on the canvas.
//
var SpriteLike = function(username, sprite_name, toolbox_id)
{
var self = this;

toolbox_id = toolbox_id || 'toolbox';
self.pidList = [];
self.interpreter = null;

self.keys_down = {};
self.dom_id = username + "-" + sprite_name;

//
// Add the tab for this hero.
//
var workspaces = $('#' + username + '-blockly');
var li = $('<li role="presentation" id="' + self.dom_id + '-li">' +
  '</li>').insertBefore("#" + username + "-new-hero-button");

var a = $('<a href="#' + self.dom_id + '-container" aria-controls="' + self.dom_id + '-container" data-toggle="tab" role="tab" class="hero-tab">' +
    sprite_name +
    '<img id="' + self.dom_id + '-spinner" class="spinner" src="heroes/loading.gif" height=15 width=15>' +
  '</a>');

//
// Show the delete button, if this is an optional sprite owned by this page's user.
//
if (sprite_name.toLowerCase() != "world" && username==getUsername())
{
  a.append('<img id="' + self.dom_id + '-x" src="heroes/x.png" height=15 width=15>');
}
li.append(a);


$('<div role="tabpanel" class="tab-pane active" id="' + self.dom_id + '-container">' +
    '<div class="workspace" id="' + self.dom_id + '"</div>' +
  '</div>').insertBefore("#" + username + "-add-hero");


var toolbox = document.getElementById(toolbox_id);
self.workspace = Blockly.inject(self.dom_id,
   {'media': 'third-party/blockly/media/',
    'toolbox': toolbox,
    'readOnly' : false, //readOnly,
    'scrollbars':true,
    'zoom': {'controls': true, 'wheel': false, 'maxScale' : 1.0, 'minScale' : 0.7}});

// Start a list of objects that we can interact with in this game.
self.workspace.objects = [["item", "item"]];
self.workspace.traceOn(true);

var blocklyDiv = document.getElementById(self.dom_id);
var onresize = function(e) {
  var width = window.innerWidth - 620;
  blocklyDiv.style.width = width + 'px';

  // We may have loaded stuff when the canvas was hidden, which corrupts the blocks.
  // We have to clear and reload everything...
  // This sucks but it's expected  https://groups.google.com/forum/#!msg/blockly/XaeaMAMqnLg/yTV0Z1b3DwAJ

  var xml = Blockly.Xml.workspaceToDom(self.workspace);
  self.workspace.clear();
  Blockly.Xml.domToWorkspace(xml, self.workspace);

  Blockly.svgResize(self.workspace);
};
window.addEventListener('resize', onresize);

$('#' + username + '-tabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
  onresize();
})
$('#' + username + '-tabs a[href="#' + self.dom_id + '-container"]').click();

self.execute = function()
{
  document.getElementById(self.dom_id + '-spinner').style.visibility = 'visible';
  var code = Blockly.JavaScript.workspaceToCode(self.workspace);
  code = prioritize_callbacks(code);
  self.interpreter = new Interpreter(code, self.initInterpreter);
  self.pidList.push(setTimeout(function(){self.executeChunk_(self.interpreter)}, 100));
}

self.executeChunk_ = function(interpreter) {
  // All tasks should be complete now.  Clean up the PID list.
  self.pidList.length = 0;
  self.pause = 0;
  var go;
  do {
    try {
      go = interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
    if (go && self.pause && !self.event_mode) {
      // The last executed command requested a pause.
      go = false;
      self.pidList.push(
          setTimeout(function(){self.executeChunk_(interpreter)}, self.pause));
    }
  } while (go);

  // Wrap up if complete.
  if (!self.pause || self.event_mode) {
    document.getElementById(self.dom_id + '-spinner').style.visibility = 'hidden';
    self.workspace.highlightBlock(null);
  }
};

// Events for override.
self.setButtonCallback = function(which, fn, id)
{
  self.key_events[which] = fn;

  //
  // Catch events for this key.
  //

  $(document)['keydown'](function( event ) {
    if (which == event.which)
    {
      event.preventDefault();
      self.keys_down[event.which] = true;
    }
  });
  $(document)['keyup'](function( event ) {
    if (which == event.which)
    {
      event.preventDefault();
      self.keys_down[event.which] = false;
    }
  });

  self.animate(id);
}


self.checkKeyEvents = function()
{
  for (key in self.keys_down)
  {
    if (self.key_events[key] && self.keys_down[key])
    {
      //TODO reorder code so events are always processed first.
      var interpreter = new Interpreter(self.key_events[key], self.initInterpreter);
      setTimeout( function(){self.executeChunk_(interpreter);}, 1);
    }
  }
}

self.end_process = function()
{
  // Kill all tasks.
  for (var x = 0; x < self.pidList.length; x++) {
    window.clearTimeout(self.pidList[x]);
  }
  self.pidList.length = 0;
  self.interpreter = null;
  self.event_mode = false;
  document.getElementById(self.dom_id + '-spinner').style.visibility = 'hidden';
}


/**
 * Highlight a block and pause.
 * @param {?string} id ID of block.
 */
self.animate = function(id) {
  if (id) {
    var m = id.match(/^block_id_([^']+)$/);
    if (m) {
      id = m[1];
    }
    self.workspace.highlightBlock(id);
    var stepSpeed = 600 * Math.pow(1 - Heroes.speedSlider.getValue(), 2);
    self.pause = Math.max(1, stepSpeed);
  }
};

self.remove = function()
{
  $("#" + self.dom_id + "-li").remove();
  $("#" + self.dom_id + "-container").remove();
};
}


//
// HACK! Utility for grabbing all event code and moving it to the front of our code.
// Functions MUST start with a specific string to be moved forward.
// Also we're screwed if there is a random ( or ) in a string.
//
var prioritize_callbacks = function(code)
{
  var start_token = "<callback>";
  var end_token = "</callback>";

  while (true)
  {
    var start_index = code.indexOf(start_token);
    var end_index = code.indexOf(end_token);

    if ((start_index == -1) ^ (end_index == -1))
    {
      console.log("Uh oh, there weren't matching callback tokens. We're giving up...");
      return code;
    }
    if (start_index == -1)
    {
      break;
    }
    var callback = code.substring(start_index + start_token.length, end_index);
    code = callback + code.substring(0, start_index) + code.substring(end_index + end_token.length, code.length);
  }
  return code;
}
