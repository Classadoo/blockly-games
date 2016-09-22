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

goog.provide('GameWorld');

goog.require('SpriteLike');


var GameWorld = function(username, sprite_ide)
{
var self = this;

SpriteLike.call(self, "World", sprite_ide);


self.items = [];
self.item_radius = 5;
self.radius = 32;

self.reset = function()
{
  self.background = null;
  self.points = null;
  self.items.length = 0;
  self.title = "";
  self.key_events = {};

  self.end_process();
}

self.setBackground = function(style, id)
{
  self.background = Heroes.backgrounds[style];
  self.animate(id);
}

self.addPoints = function(delta)
{
  self.points = self.points || 0;
  self.points += delta;
}


self.draw = function(ctx)
{
  self.drawBackground(ctx);
  self.drawHUD(ctx);

  // Draw the items.
  for (var i=0; i<self.items.length; i++)
  {
    self.items[i].draw(ctx, self.item_radius);
    self.items[i].processEvents();
  }


  // Draw title.
  if (self.title)
  {
    ctx.fillStyle = "#1199CC";
    ctx.font="28px Arial";

    var pos = Heroes.WIDTH/2 - ctx.measureText(self.title).width/2;
    ctx.fillText(self.title, pos, 40);
  }
}

self.drawBackground = function(ctx)
{
  // Clear the display with black.
  ctx.beginPath();
  ctx.rect(0, 0,
      ctx.canvas.width, ctx.canvas.height);

  if (self.background)
  {
    ctx.drawImage(self.background, 0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  }
  else
  {
    ctx.fillStyle = "#333333";
    ctx.fill();
  }
}

self.drawHUD = function(ctx)
{
  if (self.points !== null)
  {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "15px Arial";
    ctx.fillText("Points: " + self.points, 30, 30);
  }
}
/**
 * Add an item to the screen.
 */
self.addItem = function(x, y, vx, vy, id) {
  self.items.push(new Item(x, y, vx, vy, self.item_radius*2));
  self.animate(id);
};

self.setTitle = function(title, id)
{
  self.title = title;
}



/**
 * Inject the Heroes API into a JavaScript interpreter.
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
self.initInterpreter = function(interpreter, scope) {

  wrapper = function(x, y, vx, vy, id) {
    self.addItem(x.data, y.data, vx.data, vy.data, id.toString());
  };
  interpreter.setProperty(scope, 'addItem',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(which, fn, id) {
    self.setButtonCallback(which.data, fn.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setButtonCallback',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(image, id) {
    self.setBackground(image.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setBackground',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(noise, id) {
    self.makeNoise(noise.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'makeNoise',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(num, id) {
    self.addPoints(num.data, id.toString());
  };
  interpreter.setProperty(scope, 'addPoints',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(title, id) {
    self.setTitle(title.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'setTitle',
      interpreter.createNativeFunction(wrapper));
};

}

GameWorld.prototype = Object.create(SpriteLike.prototype);
