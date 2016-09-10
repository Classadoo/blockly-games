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

var chars = {};
chars["eagle"] = new Image();
chars["eagle"].src = "heroes/eagle.png";
chars["lion"] = new Image();
chars["lion"].src = "heroes/lion.png";
chars["human"] = new Image();
chars["human"].src = "heroes/andrew.png";

var chars_per_line = 40;

function Hero(type, radius, x, y) {
  this.x = x || 0;
  this.y = y || 0;

  this.penDown = false;
  this.colour = "#ffffff";
  this.width = 3;

  this.image = chars[type] || chars["andrew"];
  this.radius = radius;
}

// Draws this item to a given context.
Hero.prototype.draw = function(ctx) {
  ctx.drawImage(this.image, this.x - this.radius,
    this.y - this.radius, this.radius * 2, this.radius * 2);
}

Hero.prototype.speak = function(ctx, words)
{
  if (words)
  {
    ctx.font="12px Arial";
    var height = 24;
    var radius = height/4;
    var width = ctx.measureText(words).width + radius * 2;
    var x = this.x + this.radius;
    var y = this.y + this.radius;

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
    ctx.fillText(words, x + radius, y + radius * 3);
  }
}

Hero.prototype.set_pos = function(x, y)
{
  this.x = x;
  this.y = y;
}
