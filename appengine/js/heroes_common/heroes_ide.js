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

goog.provide('HeroesIDE');

goog.require('HeroesEditor');


//
// An object that displays several blockly workspaces to produce hero code.
//
var IDE = function(username, game, wilddog)
{
var self = this;
self.username = username;
self.game = game;
self.tabs = {};

//
// Each new hero should be offset from the last.
//
var hero_offset = 3;
self.starting_x = Heroes.WIDTH/hero_offset;
self.starting_y = Heroes.HEIGHT/2;

self.publishHero = function(name, type, image)
{
  if (self.tabs[name])
  {
    wilddog.publish_image(self.tabs[name].hero_id, image);
  }
  else
  {
    wilddog.publishHero(game.id, name, type, Object.keys(self.tabs).length,
      self.starting_x, self.starting_y, image);
  }
}

self.cycle_starting_locations = function()
{
  self.starting_x += Heroes.WIDTH/hero_offset;
  if (self.starting_x > Heroes.WIDTH)
  {
    self.starting_x = Heroes.WIDTH/hero_offset/2;
  }
}

//
// When a new hero is created.
//
self.new_hero_tab = function(new_tab_name, type, hero_id, image)
{
  self.tabs[new_tab_name] = new IDE_Tab(self.username, new_tab_name, type, hero_id, self, null, image);

  // Start pushing data.
  if (!self.tabs[new_tab_name].read_only)
  {
    wilddog.connectPublisherWorkspace(hero_id, type, self.tabs[new_tab_name].workspace);
  }

  //
  // Tell all the workspaces about this hero, so they can use her in their events.
  // Simultaneously, tell this workspace about all the old heroes.
  //

  for (var tab in self.tabs)
  {
    if (new_tab_name != tab && tab != "world")
    {
      self.tabs[tab].workspace.objects.push([new_tab_name, new_tab_name]);
      self.tabs[new_tab_name].workspace.objects.push([tab, tab]);
    }
  }

  if (self.game)
  {
    self.game.addHero(new_tab_name, type, self.tabs[new_tab_name], self.starting_x, self.starting_y, image);
    self.cycle_starting_locations();

  }

  //
  // Setup the delete click event.
  //
  $("#" + self.tabs[new_tab_name].dom_id + "-x")['click'](
    function()
    {
      if (confirm("DELETE this hero? Are you sure?"))
      {
        self.remove_tab(new_tab_name);
      }
    }
  )

  return self.tabs[new_tab_name];
}

self.update_hero = function(hero_name, x, y, image)
{
  game.update_hero(hero_name, x, y, image);
}

self.remove_tab = function(tab_name)
{
  //
  // Remove from wilddog, DOM, self, and game..
  //
  if (self.game)
  {
    wilddog.publishDeleteTab(self.tabs[tab_name].hero_id, game.id);
  }

  self.tabs[tab_name].remove();
  delete self.tabs[tab_name];

  if (self.game)
  {
    self.game.remove_hero(tab_name);
  }

  //
  // Remove from collision list.
  //
  for (var hero in self.heroes)
  {
    // Iterate in reverse so the index isn't affected when we remove elements.
    var i = self.heroes[hero].workspace.objects.length;
    var item;
    while (i--) {
      if (self.heroes[hero].workspace.objects[i][0] == name)
      {
        self.heroes[hero].workspace.objects.splice(i, 1);
      }
    }
  }
}

self.new_world_tab = function(world_id)
{
  self.tabs["world"] = new IDE_Tab(self.username, "world", "world", world_id, self, "world_toolbox");
  if (self.game)
  {
    self.game.setup_game_world(self.tabs["world"]);
  }

  // Start pushing data.
  if (!self.tabs["world"].read_only)
  {
    wilddog.connectPublisherWorkspace(world_id, "world", self.tabs["world"].workspace);
  }

  return self.tabs["world"];
}

self.display = function()
{
  for (var tab in self.tabs)
  {
    self.tabs[tab].display();
  }
}

//
// Tell wilddog about a hero's new position.
self.publish_pos = function(id, x, y)
{
  wilddog.publish_pos(id, x, y);
}

//
// Setup the UI for creating/editing characters.
self.show_character_editor = function(character)
{
  new HeroEditor(self, self.username, character);
}
$('#' + self.username + '-new-hero-button')['click']( function() {
  self.show_character_editor(null);
})
//
// Setup the dropdown for hero templates.
//
var character_types = ["custom", "lion", "eagle", "human", "smiley", "king", "knight", "dancer", "turtle"];
character_types.forEach(function(animal)
{
  $("#" + self.username + "-hero-type")['append']($("<option></option>",
      {"value": animal, "text": animal}));
});

}


//
// Tab containing one workspace for a world/hero.
//

var IDE_Tab = function(username, tab_name, hero_type, hero_id, parent, toolbox_id, image)
{
var self = this;
self.hero_id = hero_id;
self.hero_type = hero_type;
toolbox_id = toolbox_id || 'toolbox';
self.dom_id = username + "-" + tab_name;
self.read_only = !(getUsername() == username ||
                   getUsername().toLowerCase() == "teacher");
//
// Add the tab for this hero.
//
var li = $('<li role="presentation" id="' + self.dom_id + '-li">' +
  '</li>')['insertBefore']("#" + username + "-new-hero-button");

var a = $('<a href="#' + self.dom_id + '-container" aria-controls="' + self.dom_id + '-container" data-toggle="tab" role="tab" class="hero-tab">' +
    tab_name +
  '</a>');

//
// Insert thumbnail of the hero.
//
if (image)
{
  var thumbnail = new Image(20, 20);
  thumbnail.src = image;
  a.append(thumbnail);
}

//
// Add the spinner for when code is running.
//

var spinner = new Image(15, 15);
spinner.src = "heroes/loading.gif";
spinner.className = "spinner";
spinner.id = self.dom_id + "-spinner";
a.append(spinner);

//
// Show the delete button if this is an optional sprite owned by this page's user.
//
if (tab_name.toLowerCase() != "world" && username==getUsername())
{
  a['append']('<img id="' + self.dom_id + '-x" src="heroes/x.png" height=15 width=15>');
}
li['append'](a);


$('<div role="tabpanel" class="tab-pane active" id="' + self.dom_id + '-container"  style="width:100%">' +
    '<div class="workspace" id="' + self.dom_id + '" style="width:100%"></div>' +
  '</div>')['insertBefore']("#" + username + "-add-hero");

var toolbox = document.getElementById(toolbox_id);
self.workspace = Blockly.inject(self.dom_id,
   {'media': 'third-party/blockly/media/',
    'toolbox': toolbox,
    'readOnly' : self.read_only,
    'scrollbars':true,
    'zoom': {'controls': true, 'wheel': false, 'maxScale' : 1.0, 'minScale' : 0.7}});

// Start a list of objects that we can interact with in this game.
self.workspace.objects = [["item", "item"], ["edge", "edge"]];
self.workspace.traceOn(true);

self.display = function() {

  // We may have loaded stuff when the canvas was hidden, which corrupts the blocks.
  // We have to clear and reload everything...
  // This sucks but it's expected  https://groups.google.com/forum/#!msg/blockly/XaeaMAMqnLg/yTV0Z1b3DwAJ

  var xml = Blockly.Xml.workspaceToDom(self.workspace);
  self.workspace.clear();
  Blockly.Xml.domToWorkspace(xml, self.workspace);

  Blockly.svgResize(self.workspace);
};
window.addEventListener('resize', self.display);

$('#' + self.dom_id + '-li a')['click'](function (e) {
  e['preventDefault']();
  $(this)['tab']('show');
  self.display();
  self.workspace.zoomToFit();
  self.workspace.zoomCenter(-1);
})
$('#' + username + '-tabs a[href="#' + self.dom_id + '-container"]')['click']();

//
// Add sounds to our library.
//
Heroes.NOISES.forEach(function(el)
{
  self.workspace.loadAudio_(['heroes/' + el[1] + '.mp3'], el[1]);
});


self.get_code = function()
{
  var code = Blockly.JavaScript.workspaceToCode(self.workspace);
  return prioritize_callbacks(code);
}


self.remove = function()
{
  $("#" + self.dom_id + "-li")['remove']();
  $("#" + self.dom_id + "-container")['remove']();
};

self.spinner = function(spinning)
{
  document.getElementById(self.dom_id + '-spinner').style.visibility = spinning ? 'visible' : 'hidden';
}

self.highlightBlock = function(id)
{
  self.workspace.highlightBlock(id);
}

self.publish_pos = function(x, y)
{
  parent.publish_pos(hero_id, x, y);
}
}



//
// HACK! Utility for grabbing all event code and moving it to the front of our code.
// Functions MUST start be wrapped in <callback /> to be moved forward.
//
var prioritize_callbacks = function(code)
{
  var start_token = "<callback>";
  var end_token = "</callback>";

  while (true)
  {
    var start_index = code.indexOf(start_token);
    var end_index = code.indexOf(end_token);

    if ((start_index == -1) ^ (end_index == -1))
    {
      console.log("Uh oh, there weren't matching callback tokens. We're giving up...");
      return code;
    }
    if (start_index == -1)
    {
      break;
    }
    var callback = code.substring(start_index + start_token.length, end_index);
    code = callback + code.substring(0, start_index) + code.substring(end_index + end_token.length, code.length);
  }
  return code;
}
