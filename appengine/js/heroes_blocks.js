/**
 * Blockly Games: Heroes Blocks
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
 * @fileoverview Blocks for Blockly's Heroes application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Heroes.Blocks');

goog.require('Blockly');
goog.require('Blockly.Blocks.colour');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.Blocks.loops');
goog.require('BlocklyGames.JSBlocks');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Blocks.texts');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.colour');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.texts');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');

Heroes.HERO_NAMES = [["Leo", "Leo"],["William", "William"],["Andrew", "Andrew"]];
Heroes.NOISES = [["Play bow sound", "bow"], ["Play pop sound", "pop"],
  ["Play moo sound", "moo"], ["Play seal sound", "seal"],
  ["Play sneeze sound", "sneeze"], ["Play balloon sound", "balloon"]];

/**
 * Common HSV hue for all blocks in this category.
 */
Heroes.Blocks.HUE = 160;
Heroes.Blocks.EVENT_HUE = 320;

/**
 * Don't let people inject malicious code.
 */
Heroes.Blocks.MAX_FOR = 1000;

/**
 * Left turn arrow to be appended to messages.
 */
Heroes.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Heroes.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['heroes_move'] = {
  /**
   * Block for moving forward or backwards.
   * @this Blockly.Block
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Heroes_moveUp'), 'moveUp'],
         [BlocklyGames.getMsg('Heroes_moveDown'), 'moveDown'],
          [BlocklyGames.getMsg('Heroes_moveLeft'), 'moveLeft'],
           [BlocklyGames.getMsg('Heroes_moveRight'), 'moveRight']];
    this.setColour(Heroes.Blocks.HUE);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Heroes_moveTooltip'));
  }
};

Blockly.JavaScript['heroes_move'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return block.getFieldValue('DIR') +
      '('+ value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['heroes_add_points'] = {
  /**
   * Block for moving forward or backwards.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Heroes.Blocks.HUE);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField("Add points: ");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['heroes_add_points'] = function(block) {
  // Generate JavaScript for adding or removing points.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return 'addPoints(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['heroes_set_background'] = {
  /**
   * Block for moving forward or backwards.
   * @this Blockly.Block
   */
  init: function() {
    var BACKGROUNDS =
        [[BlocklyGames.getMsg('Heroes_bgSpace'), 'space'],
         [BlocklyGames.getMsg('Heroes_bgCastle'), 'castle'],
          [BlocklyGames.getMsg('Heroes_bgDesert'), 'desert'],
           [BlocklyGames.getMsg('Heroes_bgCats'), 'cats'],
            [BlocklyGames.getMsg('Heroes_bgVillage'), 'village']];
    this.setColour(Heroes.Blocks.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(BACKGROUNDS), 'BACKGROUND');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['heroes_set_background'] = function(block) {
  // Generate JavaScript for changing the background.
  var value = block.getFieldValue('BACKGROUND');
  return 'setBackground(\'' + value + '\', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['heroes_noise'] = {
  /**
   * Block for moving forward or backwards.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Heroes.Blocks.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(Heroes.NOISES), 'NOISE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['heroes_noise'] = function(block) {
  // Generate JavaScript for changing the background.
  var value = block.getFieldValue('NOISE');
  return 'makeNoise(\'' + value + '\', \'block_id_' + block.id + '\');\n';
};


Blockly.Blocks['heroes_turn'] = {
  /**
   * Block for turning left or right.
   * @this Blockly.Block
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Heroes_turnRight'), 'turnRight'],
         [BlocklyGames.getMsg('Heroes_turnLeft'), 'turnLeft']];
    // Append arrows to direction messages.
    DIRECTIONS[0][0] += Heroes.Blocks.RIGHT_TURN;
    DIRECTIONS[1][0] += Heroes.Blocks.LEFT_TURN;
    this.setColour(Heroes.Blocks.HUE);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Heroes_turnTooltip'));
  }
};

Blockly.JavaScript['heroes_turn'] = function(block) {
  // Generate JavaScript for turning left or right.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return block.getFieldValue('DIR') +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['heroes_print'] = {
  /**
   * Block for printing text.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(BlocklyGames.getMsg('Heroes_printHelpUrl'));
    this.setColour(Heroes.Blocks.HUE);
    this.appendValueInput('TEXT')
        .appendField(BlocklyGames.getMsg('Heroes_print'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Heroes_printTooltip'));
  }
};

Blockly.JavaScript['heroes_print'] = function(block) {
  // Generate JavaScript for printing text.
  var argument0 = String(Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_NONE) || '\'\'');
  return 'print(' + argument0 + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['heroes_speak'] = {
  /**
   * Block for printing text.
   * @this Blockly.Block
   */
  init: function() {

    var names = [];

    this.setColour(Heroes.Blocks.HUE);

    this.appendValueInput('TEXT')
    this.appendValueInput('SECONDS')
        .setCheck('Number')
        .appendField('for seconds');

    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['heroes_speak'] = function(block) {
  // Generate JavaScript for printing text.
  var what = String(Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_NONE) || '\'\'');
  var seconds = String(Blockly.JavaScript.valueToCode(block, 'SECONDS',
      Blockly.JavaScript.ORDER_NONE) || '\'\'');
  return 'speak(' + what + ',' + seconds + ',\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['heroes_set_title'] = {
  /**
   * Block for printing text.
   * @this Blockly.Block
   */
  init: function() {

    this.setColour(Heroes.Blocks.HUE);
    this.appendValueInput('TITLE')
        .appendField("Set Title: ");

    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['heroes_set_title'] = function(block) {
  // Generate JavaScript for printing text.
  var title = String(Blockly.JavaScript.valueToCode(block, 'TITLE',
      Blockly.JavaScript.ORDER_NONE) || '\'\'');
  return 'setTitle(' + title + ',\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['heroes_add_item'] = {
  /**
   * Block for adding an item.
   * @this Blockly.Block
   */
   init: function() {
     this.setColour(Heroes.Blocks.HUE);
     this.appendValueInput('X')
         .setCheck('Number')
         .setAlign(Blockly.ALIGN_RIGHT)
         .appendField("Add item")
         .appendField('Right');
     this.appendValueInput('Y')
         .setCheck('Number')
         .setAlign(Blockly.ALIGN_RIGHT)
         .appendField('Up');
     this.appendValueInput('VX')
         .setCheck('Number')
         .setAlign(Blockly.ALIGN_RIGHT)
         .appendField('Speed Right');
     this.appendValueInput('VY')
         .setCheck('Number')
         .setAlign(Blockly.ALIGN_RIGHT)
         .appendField('Speed Up');
     this.setPreviousStatement(true);
     this.setNextStatement(true);
   }
};

Blockly.JavaScript['heroes_add_item'] = function(block) {
  // Generate JavaScript for addItem.
  var x = Blockly.JavaScript.valueToCode(block, 'X',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  var y = Blockly.JavaScript.valueToCode(block, 'Y',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  var vx = Blockly.JavaScript.valueToCode(block, 'VX',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  var vy = Blockly.JavaScript.valueToCode(block, 'VY',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  return 'addItem(' + x + ',' + y + ',' + vx + ',' + vy + ', \'block_id_' +
      block.id + '\');\n';
};


Blockly.Blocks['heroes_add_hero'] = {
  /**
   * Block for adding an hero.
   * @this Blockly.Block
   */
   init: function() {
    var HEROES =
        [["Add lion", 'lion'],
         ["Add eagle", 'eagle']];
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(HEROES), 'TYPE');

     this.appendValueInput('NAME')
       .appendField('named');

     this.appendValueInput('X')
         .setCheck('Number')
         .appendField('X');

     this.appendValueInput('Y')
         .setCheck('Number')
         .appendField('Y');

      this.setColour(Heroes.Blocks.HUE);
      this.setPreviousStatement(true);
      this.setNextStatement(true);

   }
};

Blockly.JavaScript['heroes_add_hero'] = function(block) {
  // Generate JavaScript for addItem.

  var type = block.getFieldValue('TYPE')
  var name = Blockly.JavaScript.valueToCode(block, 'NAME',
      Blockly.JavaScript.ORDER_COMMA) || "";
  var x = Blockly.JavaScript.valueToCode(block, 'X',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  var y = Blockly.JavaScript.valueToCode(block, 'Y',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  return 'addHero(' + name + ', "' + type + '",' + x + ',' + y + ', \'block_id_' +
      block.id + '\');\n';
};


var clean_event_block = function(branch)
{
  // The interpreter can't handle nested events due to the nested strings.
  // They don't make a ton of sense, so let's remove them.
  // Note: We used to not have previous/next statements, so these had to be standalone statements,
  // but not having order made it confusing. Often events wouldn't be set up until after a collision had occurred, for example.
  return branch.replace(/setCollisionCallback.*;/g, "").replace(/setButtonCallback.*;/g, "").trim().replace(/\n/g, "");
}

Blockly.Blocks['heroes_on_arrow'] = {
  /**
   * Block for if/elseif/else condition.
   * @this Blockly.Block
   */

   init: function() {
     var DIRECTIONS =
         [[BlocklyGames.getMsg('Heroes_upArrow'), '38'],
          [BlocklyGames.getMsg('Heroes_downArrow'), '40'],
           [BlocklyGames.getMsg('Heroes_leftArrow'), '37'],
           [BlocklyGames.getMsg('Heroes_rightArrow'), '39'],
           [BlocklyGames.getMsg('Heroes_wKey'), '87'],
           [BlocklyGames.getMsg('Heroes_aKey'), '65'],
           [BlocklyGames.getMsg('Heroes_sKey'), '83'],
           [BlocklyGames.getMsg('Heroes_dKey'), '68'],
           [BlocklyGames.getMsg('Heroes_shiftKey'), '16'],
             [BlocklyGames.getMsg('Heroes_spaceBar'), '32']];
     this.setColour(Heroes.Blocks.EVENT_HUE);
     this.appendDummyInput('VALUE')
         .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
     this.setPreviousStatement(true);
     this.setNextStatement(true);
     this.appendStatementInput('DO0')
         .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
   }
};


Blockly.JavaScript['heroes_on_arrow'] = function(block) {

  //
  // Get user code from inside event.
  //

  var branch = Blockly.JavaScript.statementToCode(block, 'DO0');
  branch = clean_event_block(branch);
  var direction_number = parseInt(block.getFieldValue('DIR'));

  //
  // Trim the spaces and newlines (for the stupid interpreter), and pass it thru as a string.
  //

  var code = 'setButtonCallback(' + direction_number + ', \"' + branch + '\", \'block_id_' + block.id +'\');';
  return code + '\n';
};


Blockly.Blocks['heroes_on_collision'] = {
  /**
   * Block for if/elseif/else condition.
   * @this Blockly.Block
   */

   init: function() {
     this.setColour(Heroes.Blocks.EVENT_HUE);
     this.setPreviousStatement(true);
     this.setNextStatement(true);
     this.appendDummyInput()
         .appendField('On Collision');

     var OBJECTS = Heroes.HERO_NAMES.slice();
     OBJECTS.push(["item", "item"]);

     this.appendDummyInput()
         .appendField('with');
     this.appendDummyInput()
         .appendField(new Blockly.FieldDropdown(OBJECTS), 'B');

     this.appendStatementInput('DO0')
         .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
   }
};


Blockly.JavaScript['heroes_on_collision'] = function(block) {

  //
  // Get user code from inside event.
  //

  var branch = Blockly.JavaScript.statementToCode(block, 'DO0');
  branch = clean_event_block(branch);

  //
  // Trim the spaces and newlines (for the stupid interpreter), and pass it thru as a string.
  //

  var code = 'setCollisionCallback("' +
      block.getFieldValue('B') + '", \"' + branch+ '\", \'block_id_' + block.id +'\');';
  return code + '\n';
};


Blockly.Blocks['heroes_width'] = {
  /**
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Heroes.Blocks.HUE);
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .appendField('Set pen width:');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['heroes_width'] = function(block) {
  // Generate JavaScript for setting the width.
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'penWidth(' + width + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['heroes_pen'] = {
  /**
   * Block for pen up/down.
   * @this Blockly.Block
   */
   init: function() {
     var PEN =
         [["Bring pen up", 'penUp'],
            ["Bring pen down", 'penDown']];
     this.setColour(Heroes.Blocks.HUE);
     this.appendDummyInput()
         .appendField(new Blockly.FieldDropdown(PEN), 'PEN');
     this.setPreviousStatement(true);
     this.setNextStatement(true);
   }
};

Blockly.JavaScript['heroes_pen'] = function(block) {
  // Generate JavaScript for pen up/down.
  return block.getFieldValue('PEN') +
      '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['heroes_colour'] = {
  /**
   * Block for setting the colour.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.colour.HUE);
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendField("Set pen color");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['heroes_colour'] = function(block) {
  // Generate JavaScript for setting the colour.
  var colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_NONE) || '\'#000000\'';
  return 'penColour(' + colour + ', \'block_id_' +
      block.id + '\');\n';
};
