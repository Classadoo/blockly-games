// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Heroes.soy.
 */

goog.provide('Heroes.soy');

goog.require('soy');
goog.require('soydata');
goog.require('BlocklyGames.soy');


Heroes.soy.start = function(opt_data, opt_ignored, opt_ijData) {
  return BlocklyGames.soy.messages(null, null, opt_ijData) + '<div width="100%" id="classadoo-header"><span><h3 style="padding-right:15px">' + BlocklyGames.soy.titleSpan({appName: 'Heroes'}, null, opt_ijData) + BlocklyGames.soy.levelLinks({level: opt_ijData.level, maxLevel: opt_ijData.maxLevel, suffix: opt_ijData.suffix}, null, opt_ijData) + '</h3></span><span style="width:200px" id="username-header"></span></div>' + Heroes.soy.toolbox(null, null, opt_ijData) + '<div id="games" class="container-fluid"></div>' + BlocklyGames.soy.dialog(null, null, opt_ijData) + BlocklyGames.soy.doneDialog(null, null, opt_ijData) + BlocklyGames.soy.abortDialog(null, null, opt_ijData) + BlocklyGames.soy.storageDialog(null, null, opt_ijData) + ((opt_ijData.level < 4) ? '<div id="helpUseLoop" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Your solution works, but you can do better. ' + ((opt_ijData.level < 3) ? 'Draw the shape with just three blocks.' : 'Draw the star with just four blocks.') + '</div>' + BlocklyGames.soy.ok(null, null, opt_ijData) + '</div>' : '') + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">' + ((opt_ijData.level == 1) ? 'Create a program that draws a square.<br><img src="heroes/square.gif" height=146 width=146 style="margin-bottom: -50px">' : (opt_ijData.level == 2) ? 'Change your program to draw a pentagon instead of a square.' : (opt_ijData.level == 3) ? 'There\'s a new block that allows you to change the colour:<div id="sampleHelp3" class="readonly"></div>Draw a yellow star.' : (opt_ijData.level == 4) ? 'There\'s a new block that allows you to lift your pen off the paper when you move:<div id="sampleHelp4" class="readonly"></div>Draw a small yellow star, then draw a line above it.' : (opt_ijData.level == 5) ? 'Instead of one star, can you draw four stars arranged in a square?' : (opt_ijData.level == 6) ? 'Draw three yellow stars, and one white line.' : (opt_ijData.level == 7) ? 'Draw the stars, then draw four white lines.' : (opt_ijData.level == 8) ? 'Drawing 360 white lines will look like the full moon.' : (opt_ijData.level == 9) ? 'Can you add a black circle so that the moon becomes a crescent?' : (opt_ijData.level == 10) ? 'Draw anything you want. You\'ve got a huge number of new blocks you can explore. Have fun!' + ((! opt_ijData.html) ? '<br><br>Use the "See Gallery" button to see what other people have drawn. If you draw something interesting, use the "Submit to Gallery" button to publish it.' : '') : '') + '</div>' + BlocklyGames.soy.ok(null, null, opt_ijData) + '</div>' + ((opt_ijData.level == 1) ? '<div id="helpToolbox" class="dialogHiddenContent"><div><img src="heroes/help_left.png" class="mirrorImg" height=23 width=64></div>Choose a category to see the blocks.</div>' : '');
};
if (goog.DEBUG) {
  Heroes.soy.start.soyTemplateName = 'Heroes.soy.start';
}


Heroes.soy.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none">' + BlocklyGames.soy.heroes_tools(null, null, opt_ijData) + '</xml><xml id="world_toolbox" style="display: none">' + BlocklyGames.soy.heroes_world_tools(null, null, opt_ijData) + '</xml>';
};
if (goog.DEBUG) {
  Heroes.soy.toolbox.soyTemplateName = 'Heroes.soy.toolbox';
}
