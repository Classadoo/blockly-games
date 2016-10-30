// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace BlocklyGames.soy.
 */

goog.provide('BlocklyGames.soy');

goog.require('soy');
goog.require('soydata');


BlocklyGames.soy.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Games_name">Classadoo</span><span id="Games_puzzle">Puzzle</span><span id="Games_maze">Maze</span><span id="Games_bird">Bird</span><span id="Games_turtle">Turtle</span><span id="Games_movie">Movie</span><span id="Games_pondTutor">Pond Tutor</span><span id="Games_pond">Pond</span><span id="Games_genetics">Genetics</span><span id="Games_linesOfCode1">You solved this level with 1 line of JavaScript:</span><span id="Games_linesOfCode2">You solved this level with %1 lines of JavaScript:</span><span id="Games_nextLevel">Are you ready for level %1?</span><span id="Games_finalLevel">Are you ready for the next challenge?</span><span id="Games_linkTooltip">Save and link to blocks.</span><span id="Games_runTooltip">Run the program you wrote.</span><span id="Games_runProgram">Run Program</span><span id="Games_resetTooltip">Stop the program and reset the level.</span><span id="Games_resetProgram">Reset</span><span id="Games_help">Help</span><span id="Games_dialogOk">OK</span><span id="Games_dialogCancel">Cancel</span><span id="Games_catLogic">Logic</span><span id="Games_catLoops">Loops</span><span id="Games_catMath">Math</span><span id="Games_catText">Text</span><span id="Games_catLists">Lists</span><span id="Games_catColour">Colour</span><span id="Games_catVariables">Variables</span><span id="Games_catProcedures">Functions</span><span id="Games_httpRequestError">There was a problem with the request.</span><span id="Games_linkAlert">Share your blocks with this link:\\n\\n%1</span><span id="Games_hashError">Sorry, \'%1\' doesn\'t correspond with any saved program.</span><span id="Games_xmlError">Could not load your saved file. Perhaps it was created with a different version of Blockly?</span><span id="Games_listVariable">list</span><span id="Games_textVariable">text</span><span id="Games_breakLink">Once you start editing JavaScript, you can\'t go back to editing blocks. Is this OK?</span><span id="Games_blocks">Blocks<!-- TURTLE blocks --><span id="Turtle_moveTooltip">Moves the turtle forward or backward by the specified amount.</span><span id="Turtle_moveForward">move forward by</span><span id="Turtle_moveBackward">move backward by</span><span id="Turtle_turnTooltip">Turns the turtle left or right by the specified number of degrees.</span><span id="Turtle_turnRight">turn right by</span><span id="Turtle_turnLeft">turn left by</span><span id="Turtle_widthTooltip">Changes the width of the pen.</span><span id="Turtle_setWidth">set width to</span><span id="Turtle_colourTooltip">Changes the colour of the pen.</span><span id="Turtle_setColour">set colour to</span><span id="Turtle_penTooltip">Lifts or lowers the pen, to stop or start drawing.</span><span id="Turtle_penUp">pen up</span><span id="Turtle_penDown">pen down</span><span id="Turtle_turtleVisibilityTooltip">Makes the turtle (circle and arrow) visible or invisible.</span><span id="Turtle_hideTurtle">hide turtle</span><span id="Turtle_showTurtle">show turtle</span><span id="Turtle_printHelpUrl">https://en.wikipedia.org/wiki/Printing</span><span id="Turtle_printTooltip">Draws text in the turtle\'s direction at its location.</span><span id="Turtle_print">print</span><span id="Turtle_fontHelpUrl">https://en.wikipedia.org/wiki/Font</span><span id="Turtle_fontTooltip">Sets the font used by the print block.</span><span id="Turtle_font">font</span><span id="Turtle_fontSize">font size</span><span id="Turtle_fontNormal">normal</span><span id="Turtle_fontBold">bold</span><span id="Turtle_fontItalic">italic</span><span id="Turtle_submitDisabled">Run your program until it stops. Then you may submit your drawing to the gallery.</span><!-- MAZE blocks --><span id="Maze_moveForward">move forward</span><span id="Maze_turnLeft">turn left</span><span id="Maze_turnRight">turn right</span><span id="Maze_doCode">do</span><span id="Maze_elseCode">else</span><span id="Maze_helpIfElse">If-else blocks will do one thing or the other.</span><span id="Maze_pathAhead">if path ahead</span><span id="Maze_pathLeft">if path to the left</span><span id="Maze_pathRight">if path to the right</span><span id="Maze_repeatUntil">repeat until</span><span id="Maze_moveForwardTooltip">Moves the player forward one space.</span><span id="Maze_turnTooltip">Turns the player left or right by 90 degrees.</span><span id="Maze_ifTooltip">If there is a path in the specified direction, then do some actions.</span><span id="Maze_ifelseTooltip">If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions.</span><span id="Maze_whileTooltip">Repeat the enclosed actions until finish point is reached.</span><span id="Maze_capacity0">You have %0 blocks left.</span><span id="Maze_capacity1">You have %1 block left.</span><span id="Maze_capacity2">You have %2 blocks left.</span><!-- HEROES BLOCKS --><span id="Heroes_moveTooltip">Moves the heroes forward or backward by the specified amount.</span><span id="Heroes_moveUp">move up by</span><span id="Heroes_moveDown">move down by</span><span id="Heroes_moveLeft">move left by</span><span id="Heroes_moveRight">move right by</span><span id="Heroes_turnRight">turn right by</span><span id="Heroes_turnLeft">turn left by</span><span id="Heroes_turnTooltip">Turns the hero left or right by the specified number of degrees.</span><span id="Heroes_upArrow">if up arrow pressed</span><span id="Heroes_downArrow">if down arrow pressed</span><span id="Heroes_leftArrow">if left arrow pressed</span><span id="Heroes_rightArrow">if right arrow pressed</span><span id="Heroes_wKey">if w key pressed</span><span id="Heroes_aKey">if a key pressed</span><span id="Heroes_sKey">if s key pressed</span><span id="Heroes_dKey">if d key pressed</span><span id="Heroes_spaceBar">if spacebar pressed</span><span id="Heroes_shiftKey">if shift pressed</span><span id="Heroes_bgSpace">set background to space</span><span id="Heroes_bgCats">set background to cats</span><span id="Heroes_bgDesert">set background to desert</span><span id="Heroes_bgVillage">set background to village</span><span id="Heroes_bgCastle">set background to castle</span><span id="Heroes_heroLion">set hero to Lion</span><span id="Heroes_heroEagle">set hero to Eagle</span><span id="Heroes_speak">say </span></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.messages.soyTemplateName = 'BlocklyGames.soy.messages';
}


BlocklyGames.soy.titleSpan = function(opt_data, opt_ignored, opt_ijData) {
  return '<span id="title"><a href="../index.html">Classadoo</a> : ' + soy.$$escapeHtml(opt_data.appName) + '</span>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.titleSpan.soyTemplateName = 'BlocklyGames.soy.titleSpan';
}


BlocklyGames.soy.levelLinks = function(opt_data, opt_ignored, opt_ijData) {
  var output = ' &nbsp; ';
  var iLimit446 = opt_data.maxLevel + 1;
  for (var i446 = 1; i446 < iLimit446; i446++) {
    output += ' ' + ((i446 == opt_data.level) ? '<span class="level_number level_done" id="level' + soy.$$escapeHtml(i446) + '">' + soy.$$escapeHtml(i446) + '</span>' : '<a class="level_number" id="level' + soy.$$escapeHtml(i446) + '" href="?level=' + soy.$$escapeHtml(i446) + soy.$$escapeHtml(opt_data.suffix) + '">' + soy.$$escapeHtml(i446) + '</a>');
  }
  return output;
};
if (goog.DEBUG) {
  BlocklyGames.soy.levelLinks.soyTemplateName = 'BlocklyGames.soy.levelLinks';
}


BlocklyGames.soy.dialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.dialog.soyTemplateName = 'BlocklyGames.soy.dialog';
}


BlocklyGames.soy.doneDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogDone" class="dialogHiddenContent"><div style="font-size: large; margin: 1em;">Congratulations!</div><div id="dialogLinesText" style="font-size: large; margin: 1em;"></div><pre id="containerCode"></pre><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"><button id="doneCancel">Cancel</button><button id="doneOk" class="secondary">OK</button></div></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.doneDialog.soyTemplateName = 'BlocklyGames.soy.doneDialog';
}


BlocklyGames.soy.abortDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogAbort" class="dialogHiddenContent">This level is extremely difficult. Would you like to skip it and go onto the next game? You can always come back later.<div id="dialogAbortButtons" class="farSide" style="padding: 1ex 3ex 0"><button id="abortCancel">Cancel</button><button id="abortOk" class="secondary">OK</button></div></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.abortDialog.soyTemplateName = 'BlocklyGames.soy.abortDialog';
}


BlocklyGames.soy.storageDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + BlocklyGames.soy.ok(null, null, opt_ijData) + '</div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.storageDialog.soyTemplateName = 'BlocklyGames.soy.storageDialog';
}


BlocklyGames.soy.ok = function(opt_data, opt_ignored, opt_ijData) {
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyDialogs.hideDialog(true)">OK</button></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.ok.soyTemplateName = 'BlocklyGames.soy.ok';
}


BlocklyGames.soy.maze_tools = function(opt_data, opt_ignored, opt_ijData) {
  return '<block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '');
};
if (goog.DEBUG) {
  BlocklyGames.soy.maze_tools.soyTemplateName = 'BlocklyGames.soy.maze_tools';
}


BlocklyGames.soy.turtle_tools = function(opt_data, opt_ignored, opt_ijData) {
  return '' + ((opt_ijData.level == 10) ? '<category name="Turtle"><block type="turtle_move"><value name="VALUE"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block><block type="turtle_turn"><value name="VALUE"><shadow type="math_number"><field name="NUM">90</field></shadow></value></block><block type="turtle_width"><value name="WIDTH"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="turtle_pen"></block><block type="turtle_visibility"></block><block type="turtle_print"><value name="TEXT"><shadow type="text"></shadow></value></block><block type="turtle_font"></block></category><category name="Colour"><block type="turtle_colour"><value name="COLOUR"><shadow type="colour_picker"></shadow></value></block><block type="colour_picker"></block><block type="colour_random"></block><block type="colour_rgb"><value name="RED"><shadow type="math_number"><field name="NUM">100</field></shadow></value><value name="GREEN"><shadow type="math_number"><field name="NUM">50</field></shadow></value><value name="BLUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block><block type="colour_blend"><value name="COLOUR1"><shadow type="colour_picker"><field name="COLOUR">#ff0000</field></shadow></value><value name="COLOUR2"><shadow type="colour_picker"><field name="COLOUR">#3333ff</field></shadow></value><value name="RATIO"><shadow type="math_number"><field name="NUM">0.5</field></shadow></value></block></category><category name="Logic"><block type="controls_if"></block><block type="logic_compare"></block><block type="logic_operation"></block><block type="logic_negate"></block><block type="logic_boolean"></block><block type="logic_ternary"></block></category><category name="Loops"><block type="controls_repeat_ext"><value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block><block type="controls_whileUntil"></block><block type="controls_for"><value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value><value name="BY"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="controls_flow_statements"></block></category><category name="Math"><block type="math_number"></block><block type="math_arithmetic"><value name="A"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="math_single"><value name="NUM"><shadow type="math_number"><field name="NUM">9</field></shadow></value></block><block type="math_trig"><value name="NUM"><shadow type="math_number"><field name="NUM">45</field></shadow></value></block><block type="math_constant"></block><block type="math_number_property"><value name="NUMBER_TO_CHECK"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block><block type="math_change"><value name="DELTA"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="math_round"><value name="NUM"><shadow type="math_number"><field name="NUM">3.1</field></shadow></value></block><block type="math_modulo"><value name="DIVIDEND"><shadow type="math_number"><field name="NUM">64</field></shadow></value><value name="DIVISOR"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block><block type="math_constrain"><value name="VALUE"><shadow type="math_number"><field name="NUM">50</field></shadow></value><value name="LOW"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="HIGH"><shadow type="math_number"><field name="NUM">100</field></shadow></value></block><block type="math_random_int"><value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="TO"><shadow type="math_number"><field name="NUM">100</field></shadow></value></block><block type="math_random_float"></block></category><sep></sep><category name="Variables" custom="VARIABLE"></category><category name="Functions" custom="PROCEDURE"></category>' : '<category name="Turtle"><block type="turtle_move_internal"><field name="VALUE">100</field></block><block type="turtle_turn_internal"><field name="VALUE">90</field></block><block type="turtle_pen"></block></category><category name="Colour"><block type="turtle_colour_internal"></block></category><category name="Loops"><block type="turtle_repeat_internal"><field name="TIMES">4</field></block></category>');
};
if (goog.DEBUG) {
  BlocklyGames.soy.turtle_tools.soyTemplateName = 'BlocklyGames.soy.turtle_tools';
}


BlocklyGames.soy.heroes_tools = function(opt_data, opt_ignored, opt_ijData) {
  return '<category name="Heroes"><block type="heroes_move"><value name="VALUE"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="heroes_game_speed"></block><block type="heroes_choose_image"></block><block type="heroes_next_image"></block><block type="heroes_turn"><value name="VALUE"><shadow type="math_number"><field name="NUM">90</field></shadow></value></block><block type="heroes_sleep"><value name="VALUE"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="heroes_move_forward"><value name="VALUE"><shadow type="math_number"><field name="NUM">90</field></shadow></value></block><block type="heroes_pen"></block><block type="heroes_grow"></block><block type="heroes_shrink"></block><block type="heroes_width"><value name="WIDTH"><block type="math_number"><field name="NUM">3</field></block></value></block><block type="heroes_colour"><value name="COLOUR"><block type="colour_picker"></block></value></block>' + ((opt_ijData.level >= 5) ? '<block type="heroes_speak"><value name="TEXT"><block type="text"></block></value><value name="SECONDS"><block type="math_number"><field name="NUM">3</field></block></value></block><block type="heroes_noise"></block>' : '') + '</category>' + ((opt_ijData.level >= 3) ? '<category name="Events">' + ((opt_ijData.level == 3) ? '<block type="heroes_on_arrow"><value name="DO0"><block type="heroes_move"><value name="VALUE"><block type="math_number"><field name="NUM">3</field></block></value></block></value></block>' : '<block type="heroes_on_arrow"></block><block type="heroes_on_collision"></block>') + '</category>' : '') + '<category name="Number">' + ((opt_ijData.level >= 3) ? '<block type="math_number"></block><block type="math_random_int"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">5</field></block></value></block>' : '') + '<block type="controls_repeat_ext"><value name="TIMES"><block type="math_number"><field name="NUM">10</field></block></value></block></category>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.heroes_tools.soyTemplateName = 'BlocklyGames.soy.heroes_tools';
}


BlocklyGames.soy.heroes_world_tools = function(opt_data, opt_ignored, opt_ijData) {
  return '<category name="Number">' + ((opt_ijData.level >= 3) ? '<block type="math_number"></block><block type="math_random_int"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">5</field></block></value></block>' : '') + '<block type="controls_repeat_ext"><value name="TIMES"><block type="math_number"><field name="NUM">10</field></block></value></block><block type="heroes_game_speed"></block></category>' + ((opt_ijData.level >= 2) ? '<category name="Game"><block type="heroes_add_item">' + ((opt_ijData.level < 4) ? '<value name="X"><block type="math_number"><field name="NUM">200</field></block></value><value name="VY"><block type="math_random_int"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">5</field></block></value></block></value><value name="VX"><block type="math_number"><field name="NUM">0</field></block></value><value name="Y"><block type="math_number"><field name="NUM">0</field></block></value>' : '') + '</block>' + ((opt_ijData.level >= 4) ? '<block type="heroes_add_points">' + ((opt_ijData.level == 4) ? '<value name="VALUE"><block type="math_number"><field name="NUM">10</field></block></value>' : '') + '</block>' + ((opt_ijData.level >= 5) ? '<block type="heroes_set_background"></block><block type="heroes_set_title"><value name="TITLE"><block type="text"></block></value></block>' : '') : '') + '</category>' : '');
};
if (goog.DEBUG) {
  BlocklyGames.soy.heroes_world_tools.soyTemplateName = 'BlocklyGames.soy.heroes_world_tools';
}
