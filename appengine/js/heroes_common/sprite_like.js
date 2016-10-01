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
// An object that executes code in the hero world.
//
var SpriteLike = function(sprite_name, sprite_ide)
{
var self = this;
self.speed = .5;

self.pidList = [];
self.interpreter = null;

self.keys_down = {};
self.ide = sprite_ide;

self.sleep = 0;

self.execute = function()
{
  self.ide.spinner(true);
  self.interpreter = new Interpreter(self.ide.get_code(), self.initInterpreter);
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
    if (go && (self.pause || self.sleep)) {
      // The last executed command requested a pause.
      go = false;
      self.pidList.push(
          setTimeout(function(){self.executeChunk_(interpreter)}, self.pause + self.sleep));
    }
  } while (go);

  // Wrap up if complete.
  if (!(self.pause || self.sleep)) {
    self.ide.spinner(false);
    self.ide.highlightBlock(null);
  }
};

self.set_sleep = function(duration_s, id)
{
  self.sleep = duration_s * 1000;
  setTimeout(function(){self.sleep = 0}, self.sleep);
  self.animate(id, true);
}

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

// Speed should be between 0 and 1.
self.setSpeed = function(speed_string, id)
{
  switch (speed_string)
  {
    case "slow":
      self.speed = .1;
      break;
    case "med":
      self.speed = .5;
      break;
    case "fast":
      self.speed = 1.0;
      break;
  }

  self.animate(id);
}

self.checkKeyEvents = function()
{
  for (key in self.keys_down)
  {
    if (self.key_events[key] && self.keys_down[key])
    {
      // Use anonymous function to put a closure around the temporary interpreter.
      (function() {
        var interpreter = new Interpreter(self.key_events[key], self.initInterpreter);
        self.pidList.push(setTimeout( function(){self.executeChunk_(interpreter);}, 1));
      })();
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
  self.ide.spinner(false);
}


/**
 * Highlight a block and pause.
 * @param {?string} id ID of block.
 */
self.animate = function(id, skip_pause) {
  if (id) {
    var m = id.match(/^block_id_([^']+)$/);
    if (m) {
      id = m[1];
    }
    self.ide.highlightBlock(id);
    var stepSpeed = 600 * Math.pow(1 - self.speed, 2);
    self.pause = skip_pause ? self.pause : Math.max(1, stepSpeed);
  }
};

/**
 * Inject the Heroes API into a JavaScript interpreter.
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
self.initBasicInterpreter = function(interpreter, scope)
{
  wrapper = function(which, fn, id) {
    self.setButtonCallback(which.data, fn.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setButtonCallback',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(noise, id) {
    self.makeNoise(noise.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'makeNoise',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(duration, id) {
    self.set_sleep(duration.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'set_sleep',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(num, id) {
    self.addPoints(num.data, id.toString());
  };
  interpreter.setProperty(scope, 'addPoints',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(speed, id) {
    self.setSpeed(speed.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setSpeed',
      interpreter.createNativeFunction(wrapper));
}

}
