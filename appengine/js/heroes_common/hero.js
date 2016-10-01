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

goog.provide('HeroObject');

goog.require('Blockly.inject');
goog.require('SpriteLike');

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getCursorPosition(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return {x: x, y: y};
}

function draw_rotated_image(context, image, x, y, width, height, angle)
{
    // save the current co-ordinate system
    // before we screw with it
    context.save();

    // move to the middle of where we want to draw our image
    context.translate(x, y);

    // rotate around that point
    context.rotate(-angle);

    // draw it up and to the left by half the width
    // and height of the image
    context.drawImage(image, -width/2, -height/2, width, height);

    // and restore the co-ords to how they were when we began
    context.restore();
}

var chars = {};
chars["eagle"] = new Image();
chars["eagle"].src = "heroes/eagle.png";
chars["lion"] = new Image();
chars["lion"].src = "heroes/lion.png";
chars["human"] = new Image();
chars["human"].src = "heroes/andrew.png";

var chars_per_line = 40;


function Hero(name, char, radius, x, y, line_context, display_context, sprite_ide, game) {

var self = this;
self.ctxLines = line_context;

self.x = x || 0;
self.y = y || 0;

//
// Create a list of xs and ys so we can draw a slithery tail.
//

self.tail_length = 1;
self.xs = [self.x];
self.ys = [self.y];

self.starting_x = self.x;
self.starting_y = self.y;

// Zero is straight right.
self.heading = 0;

self.pen = true;
self.colour = null;
self.width = 5;

self.char = char;
self.image = chars[char] || chars["andrew"];
self.radius = radius;

self.collision_events = {};
self.collisions_in_progress = {};

SpriteLike.call(self, name, sprite_ide);

self.dragging = false;
$(display_context.canvas)['mousedown']( function(e)
{
  var pos = getCursorPosition(this, e)
  if (compute_distance(pos.x, pos.y, self.x, self.y) < self.radius)
  {
    self.dragging = true;
    self.drag_event_x = e.clientX;
    self.drag_event_y = e.clientY;
  }
})
$(display_context.canvas)['mouseup']( function(e) {
  self.dragging = false;
  sprite_ide.publish_pos(self.starting_x, self.starting_y);
});
$(display_context.canvas)['mousemove']( function(e) {
  if (self.dragging)
  {
    self.set_pos(self.x + e.clientX - self.drag_event_x, self.y + e.clientY - self.drag_event_y);
    self.starting_x = self.x;
    self.starting_y = self.y;

    self.drag_event_x = e.clientX;
    self.drag_event_y = e.clientY;
    game.display();
  }
});


// Draws this item to a given context.
self.draw = function(ctx)
{
  //
  // Clear any extra tails we shouldn't have.
  //

  while (self.xs.length > self.tail_length)
  {
    self.xs.shift();
    self.ys.shift();
  }

  for (var i = 0; i < self.xs.length; i++)
  {
    draw_rotated_image(ctx, self.image, self.xs[i],
      self.ys[i], self.radius * 2, self.radius * 2, self.heading);
  }

  self.draw_speech(ctx);
}

self.set_pos = function(x, y)
{
  self.x = x;
  self.y = y;
  self.xs.push(x);
  self.ys.push(y);

  //
  // Clear any extra tails we shouldn't have.
  //

  while (self.xs.length > self.tail_length)
  {
    self.xs.shift();
    self.ys.shift();
  }
}

self.extend_tail = function(amt, id)
{
  self.tail_length = Math.max(1, self.tail_length + amt);
  self.animate(id);
}

self.draw_speech = function(ctx)
{
  if (self.words)
  {
    ctx.font = "12px Arial";
    var height = 24;
    var radius = height/4;
    var width = ctx.measureText(self.words).width + radius * 2;
    var x = self.x + self.radius;
    var y = self.y + self.radius;

    var r = x + width;
    var b = y + height;
    ctx.beginPath();
    ctx.strokeStyle="black";
    ctx.lineWidth="2";
    ctx.moveTo(x+radius, y);
    ctx.lineTo(x+radius/2, y-10);
    ctx.lineTo(x+radius * 2, y);
    ctx.lineTo(r-radius, y);
    ctx.quadraticCurveTo(r, y, r, y+radius);
    ctx.lineTo(r, y+height-radius);
    ctx.quadraticCurveTo(r, b, r-radius, b);
    ctx.lineTo(x+radius, b);
    ctx.quadraticCurveTo(x, b, x, b-radius);
    ctx.lineTo(x, y+radius);
    ctx.quadraticCurveTo(x, y, x+radius, y);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.66)";
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.fillText(self.words, x + radius, y + radius * 3);
  }
}

//
// Set everything back to the beginning state.
//
self.reset = function()
{
  self.words = "";
  self.word_timeouts = 0;

  self.x = self.starting_x;
  self.y = self.starting_y;
  self.xs = [self.x];
  self.ys = [self.y];
  self.tail_length = 1;
  self.heading = 0;

  self.colour = null;

  self.collision_events = {};
  self.key_events = {};

  self.end_process();
}

self.makeNoise = function(name, id)
{
  sprite_ide.workspace.playAudio(name, 0.5);
  self.animate(id);
}

//
// Hero speech.
//
self.speak = function(what, seconds, id)
{
  self.words = what;
  clearTimeout(self.word_timeout);
  self.word_timeout = setTimeout(function()
  {
    self.words = "";
  }, seconds*1000);
  self.animate(id);
}


/**
 * Lift or lower the pen.
 * @param {boolean} down True if down, false if up.
 * @param {?string} id ID of block.
 */
self.penDown = function(down, id) {
  self.pen = down;
  self.animate(id);
};

/**
 * Change the thickness of lines.
 * @param {number} width New thickness in pixels.
 * @param {?string} id ID of block.
 */
self.penWidth = function(width, id) {
  self.width = width;
  self.animate(id);
};

/**
 * Change the colour of the pen.
 * @param {string} colour Hexadecimal #rrggbb colour string.
 * @param {?string} id ID of block.
 */
self.penColour = function(colour, id) {
  self.colour = colour;
  self.animate(id);
};

self.rotate = function(clockwise, degrees, id)
{
  // Clockwise amounts to a negative multiplier.
  clockwise = clockwise ? -1 : 1;
  self.heading += clockwise * degrees * Math.PI / 180.0;

  self.animate(id);
}

//
// Move in the direction we're facing.
//
self.move_forward = function(distance, id)
{
  var x = Math.cos(self.heading) * distance;
  var y = Math.sin(self.heading) * distance
  self.move(x, y, id);
}

//
// Move in an absolute direction.
//
self.move = function(x, y, id) {
  if (self.pen)
  {
    self.ctxLines.strokeStyle = self.colour || getRandomColor();
    self.ctxLines.fillStyle = self.colour;
    self.ctxLines.lineWidth = self.width;
    self.ctxLines.beginPath();
    self.ctxLines.moveTo(self.x, self.y);
  }

  self.set_pos(self.x + x, self.y - y);

  if (self.pen)
  {
    self.ctxLines.lineTo(self.x, self.y);
    self.ctxLines.stroke();
  }

  self.animate(id);
};

self.setCollisionCallback = function(what, fn, id)
{
  self.collision_events[what] = fn;
  self.animate(id);
}


//
// Check for collision events.
//
self.checkCollisions = function(other_heroes, items, item_radius)
{
  for (var what in self.collision_events)
  {
    //
    // Assume WHAT is either an item, edge, or hero.
    //
    if (what == "item")
    {
      // Iterate in reverse so the index isn't affected when we remove elements.
      var i = items.length;
      var item;
      while (i--) {
        item = items[i];
        if (compute_distance(item.x, item.y, self.x, self.y) < (self.radius + item_radius))
        {
          // Use anonymous function to put a closure around the temporary interpreter.
          (function() {
            var interpreter = new Interpreter(self.collision_events[what], self.initInterpreter);
            self.pidList.push(setTimeout( function(){self.executeChunk_(interpreter);}, 1));
          })();
          items.splice(i, 1);
        }
      }
    }
    else if (what == "edge")
    {
      if (self.x < self.radius ||
          self.y < self.radius ||
          self.x + radius > Heroes.WIDTH ||
          self.y + radius > Heroes.HEIGHT)
      {
        if (self.collisions_in_progress[what] == false)
        {
          // Use anonymous function to put a closure around the temporary interpreter.
          (function() {
            var interpreter = new Interpreter(self.collision_events[what], self.initInterpreter);
            self.pidList.push(setTimeout( function(){self.executeChunk_(interpreter);}, 1));
          })();
        }
        self.collisions_in_progress[what] = true;
      }
      else
      {
        self.collisions_in_progress[what] = false;
      }
    }
    else
    {
      var other_hero = other_heroes[what];
      if (!other_hero)
      {
        console.log("How'd we make an event with a non-existent hero?");
        return;
      }
      if (compute_distance(other_hero.x, other_hero.y, self.x, self.y) < (self.radius + other_hero.radius))
      {
        if (self.collisions_in_progress[what] == false)
        {
          // Use anonymous function to put a closure around the temporary interpreter.
          (function() {
            var interpreter = new Interpreter(self.collision_events[what], self.initInterpreter);
            self.pidList.push(setTimeout( function(){self.executeChunk_(interpreter);}, 1));
          })();
        }
        self.collisions_in_progress[what] = true;
      }
      else
      {
        self.collisions_in_progress[what] = false;
      }
    }
  }
}

/**
 * Inject the Heroes API into a JavaScript interpreter.
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
self.initInterpreter = function(interpreter, scope)
{
  self.initBasicInterpreter(interpreter, scope);

  var wrapper = function(degrees, id) {
    self.rotate(false, degrees.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'turnLeft',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(degrees, id) {
    self.rotate(true, degrees.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'turnRight',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    self.move_forward(distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveForward',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    self.move(0, distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveUp',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    self.move(0, -distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveDown',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    self.move(-distance.valueOf(), 0, id.toString());
  };
  interpreter.setProperty(scope, 'moveLeft',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    self.move(distance.valueOf(), 0, id.toString());
  };
  interpreter.setProperty(scope, 'moveRight',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(what, fn, id) {
    self.setCollisionCallback(what.toString(), fn.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setCollisionCallback',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(what, seconds, id) {
    self.speak(what.toString(), seconds.data, id.toString());
  };
  interpreter.setProperty(scope, 'speak',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(id) {
    self.penDown(false, id.toString());
  };
  interpreter.setProperty(scope, 'penUp',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    self.penDown(true, id.toString());
  };
  interpreter.setProperty(scope, 'penDown',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(width, id) {
    self.penWidth(width.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'penWidth',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(colour, id) {
    self.penColour(colour.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'penColour',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(amt, id) {
    self.extend_tail(amt.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'extend_tail',
      interpreter.createNativeFunction(wrapper));
};

setInterval(function()
{
  for (var i=self.xs.length-2; i>=0; i--)
  {
    var distance = compute_distance(self.xs[i], self.ys[i], self.xs[i+1], self.ys[i+1]);
    self.xs[i] += (self.xs[i + 1] - self.xs[i]) / Math.max(distance, 0.000001);
    self.ys[i] += (self.ys[i + 1] - self.ys[i]) / Math.max(distance, 0.000001);
  }
}, 10);
}

Hero.prototype = Object.create(SpriteLike.prototype);
