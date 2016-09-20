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

  //
  // Add the tab for this hero.
  //
  var id = username + "_" + sprite_name;

  var workspaces = $('#' + username + '_blockly');
  $('<li role="presentation"><a href="#' + id + '_container" aria-controls="' + id + '_container" data-toggle="tab" role="tab">' + sprite_name + '</a></li>').insertBefore("#new_hero_button");
  workspaces.append('<div role="tabpanel" class="tab-pane active" id="' + id + '_container"><div class="workspace" id="' + id + '"</div></div>');


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
    Blockly.svgResize(self.workspace);
  };
  window.addEventListener('resize', onresize);

  $('#' + username + '_tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
    onresize();
  })
  $('#' + username + '_tabs a[href="#' + id + '_container"]').click();

  self.execute = function()
  {
    var code = Blockly.JavaScript.workspaceToCode(self.workspace);
    console.log(code);
    self.interpreter = new Interpreter(code, self.initInterpreter);
    self.pidList.push(setTimeout(self.executeChunk_, 100));
  }

  self.executeChunk_ = function() {
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
      if (go && self.pause) {
        // The last executed command requested a pause.
        go = false;
        self.pidList.push(
            setTimeout(self.executeChunk_, self.pause));
      }
    } while (go);
    // Wrap up if complete.
    if (!self.pause) {
      //document.getElementById(self.username + '_spinner').style.visibility = 'hidden';
    //  self.workspace.highlightBlock(null);
    }
  };
}
