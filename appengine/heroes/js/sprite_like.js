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

//
// Add the tab for this hero.
//
var id = username + "-" + sprite_name;

var workspaces = $('#' + username + '-blockly');
$('<li role="presentation"><a href="#' + id + '-container" aria-controls="' + id + '-container" data-toggle="tab" role="tab">' + sprite_name + '</a></li>').insertBefore("#" + username + "-new-hero-button");
$('<div role="tabpanel" class="tab-pane active" id="' + id + '-container"><div class="workspace" id="' + id + '"</div></div>').insertBefore("#" + username + "-add-hero");


var toolbox = document.getElementById(toolbox_id);
self.workspace = Blockly.inject(id,
   {'media': 'third-party/blockly/media/',
    'toolbox': toolbox,
    'readOnly' : false, //readOnly,
    'scrollbars':true,
    'zoom': {'controls': true, 'wheel': false, 'maxScale' : 1.0, 'minScale' : 0.7}});
self.workspace.traceOn(true);

var blocklyDiv = document.getElementById(id);
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
$('#' + username + '-tabs a[href="#' + id + '-container"]').click();

self.execute = function(game_speed)
{
  var code = Blockly.JavaScript.workspaceToCode(self.workspace);
  console.log(code);
  self.interpreter = new Interpreter(code, self.initInterpreter);
  self.pidList.push(setTimeout(function(){self.executeChunk_(game_speed)}, 100));
}

self.executeChunk_ = function(game_speed) {
  // All tasks should be complete now.  Clean up the PID list.
  self.pidList.length = 0;
  self.pause = 0;
  var go;
  do {
    try {
      go = self.interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
    if (go && self.pause && !self.event_mode) {
      // The last executed command requested a pause.
      go = false;
      self.pidList.push(
          setTimeout(function(){self.executeChunk_(game_speed)}, self.pause));
    }
  } while (go);

  // Wrap up if complete.
  if (!self.pause || self.event_mode) {
  //  document.getElementById(self.username + '-spinner').style.visibility = 'hidden'; // TODO make a spinner per sprite? Or just have them || to this spinner?
    self.workspace.highlightBlock(null);

    // Continue to check for events, but now we never want to pause.
    self.event_mode = true;
    self.pidList.push(setTimeout(function(){self.executeChunk_(game_speed)}, game_speed));
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
      self.interpreter['appendCode'](self.key_events[key]);
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
}
