// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Teacher_Dash.soy.
 */

goog.provide('Teacher_Dash.soy');

goog.require('soy');
goog.require('soydata');
goog.require('BlocklyGames.soy');


Teacher_Dash.soy.start = function(opt_data, opt_ignored, opt_ijData) {
  return BlocklyGames.soy.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1>' + BlocklyGames.soy.titleSpan({appName: 'Teacher Dash'}, null, opt_ijData) + '</h1></td></tr></table>' + ((opt_ijData.level == 10 && ! opt_ijData.html) ? '<table style="padding-top: 1em; width: 400px;"><tr><td style="text-align: center;"><form action="https://www.reddit.com/r/BlocklyGames/" target="gallery"><button type="submit" title="Open the gallery of drawings on Reddit."><img src="common/1x1.gif" class="reddit icon21"> See Gallery</button></form></td><td style="text-align: center;"><button id="submitButton" title="Submit your drawing to Reddit."><img src="common/1x1.gif" class="camera icon21"> Submit to Gallery</button><canvas id="thumbnail" width="100" height="100" style="display: none"></canvas><form id="t2r_form" action="turtle-reddit" method="POST" target="_blank" style="display: none"><input id="t2r_thumb" type="hidden" name="thumb"><input id="t2r_xml" type="hidden" name="xml"></form></td></tr>' : '') + Teacher_Dash.soy.toolbox(null, null, opt_ijData) + '<input type="text" id="pick-ide"></input><button type="button" id="send-pick-ide">Pick IDE</button><div id="students"></div>' + ((opt_ijData.level < 4) ? '<div id="helpUseLoop" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Your solution works, but you can do better. ' + ((opt_ijData.level < 3) ? 'Draw the shape with just three blocks.' : 'Draw the star with just four blocks.') + '</div>' + BlocklyGames.soy.ok(null, null, opt_ijData) + '</div>' : '') + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">' + ((opt_ijData.level == 1) ? 'Create a program that draws a square.<br><img src="turtle/square.gif" height=146 width=146 style="margin-bottom: -50px">' : (opt_ijData.level == 2) ? 'Change your program to draw a pentagon instead of a square.' : (opt_ijData.level == 3) ? 'There\'s a new block that allows you to change the colour:<div id="sampleHelp3" class="readonly"></div>Draw a yellow star.' : (opt_ijData.level == 4) ? 'There\'s a new block that allows you to lift your pen off the paper when you move:<div id="sampleHelp4" class="readonly"></div>Draw a small yellow star, then draw a line above it.' : (opt_ijData.level == 5) ? 'Instead of one star, can you draw four stars arranged in a square?' : (opt_ijData.level == 6) ? 'Draw three yellow stars, and one white line.' : (opt_ijData.level == 7) ? 'Draw the stars, then draw four white lines.' : (opt_ijData.level == 8) ? 'Drawing 360 white lines will look like the full moon.' : (opt_ijData.level == 9) ? 'Can you add a black circle so that the moon becomes a crescent?' : (opt_ijData.level == 10) ? 'Draw anything you want. You\'ve got a huge number of new blocks you can explore. Have fun!' + ((! opt_ijData.html) ? '<br><br>Use the "See Gallery" button to see what other people have drawn. If you draw something interesting, use the "Submit to Gallery" button to publish it.' : '') : '') + '</div>' + BlocklyGames.soy.ok(null, null, opt_ijData) + '</div>';
};
if (goog.DEBUG) {
  Teacher_Dash.soy.start.soyTemplateName = 'Teacher_Dash.soy.start';
}


Teacher_Dash.soy.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none">' + BlocklyGames.soy.heroes_tools(null, null, opt_ijData) + '<category name="Maze">' + BlocklyGames.soy.maze_tools(null, null, opt_ijData) + '</category>' + BlocklyGames.soy.turtle_tools(null, null, opt_ijData) + '</xml><xml id="world_toolbox" style="display: none">' + BlocklyGames.soy.heroes_world_tools(null, null, opt_ijData) + '</xml>';
};
if (goog.DEBUG) {
  Teacher_Dash.soy.toolbox.soyTemplateName = 'Teacher_Dash.soy.toolbox';
}
