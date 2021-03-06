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

goog.provide('ItemObject');

function Item(x, y, vx, vy) {
  var self = this;
  self.x = x || 0;
  self.y = y || 0;
  self.vx = vx || 0;
  self.vy = vy || 0;
}

// Draws this item to a given context.
Item.prototype.draw = function(ctx, rad) {
  rad = rad + (Math.random() - 1) * 9;
  ctx.fillStyle = Math.round(Math.random() + .1) ? "#0000CC" : "#AA3333";
  ctx.fillRect(this.x - rad, this.y - rad, rad * 2, rad * 2);

  var inner_rad = rad/2;
  ctx.fillStyle = "#FFFF00";
  ctx.fillRect(this.x - inner_rad, this.y - inner_rad, inner_rad * 2, inner_rad * 2);
}

Item.prototype.processEvents = function()
{
  this.x += this.vx;
  this.y += this.vy;
}
