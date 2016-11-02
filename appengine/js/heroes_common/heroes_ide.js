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

self.publishHero = function(id, name, type, images)
{
  var index, x, y;
  if (!id)
  {
    x = self.starting_x;
    y = self.starting_y;
    index = Object.keys(self.tabs).length;
  }
  wilddog.publishHero(game.id, name, type, index, x, y, images, id);
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
self.new_hero_tab = function(new_tab_name, type, hero_id, images)
{
  self.tabs[hero_id] = new IDE_Tab(self.username, new_tab_name, type, hero_id, self, null, images);

  // Start pushing data.
  if (!self.tabs[hero_id].read_only)
  {
    wilddog.connectPublisherWorkspace(hero_id, type, self.tabs[hero_id].workspace);
  }

  //
  // Tell all the workspaces about this hero, so they can use her in their events.
  // Simultaneously, tell this workspace about all the old heroes.
  //

  for (var tab in self.tabs)
  {
    if (hero_id != tab)
    {
      if (self.tabs[tab].hero_type == "world")
      {
        continue;
      }
      self.tabs[tab].workspace.objects.push([hero_id, hero_id]);
      self.tabs[hero_id].workspace.objects.push([tab, tab]);
    }
  }

  if (self.game)
  {
    self.game.addHero(hero_id, new_tab_name, type, self.tabs[hero_id], self.starting_x, self.starting_y, images);
    self.cycle_starting_locations();
  }

  return self.tabs[hero_id];
}

self.update_hero = function(id, hero_name, x, y, images)
{
  if (self.game)
  {
    game.update_hero(id, x, y, images);
  }
  self.tabs[id].update_images(images);
}

self.remove_tab = function(id)
{
  //
  // Remove from wilddog, DOM, self, and game..
  //
  if (self.game)
  {
    wilddog.publishDeleteTab(self.tabs[id].hero_id, game.id);
  }

  self.tabs[id].remove();
  delete self.tabs[id];

  if (self.game)
  {
    self.game.remove_hero(id);
  }

  //
  // Remove from collision list.
  //
  for (var hero in self.tabs)
  {
    // Iterate in reverse so the index isn't affected when we remove elements.
    var i = self.tabs[id].workspace.objects.length;
    var item;
    while (i--) {
      if (self.tabs[id].workspace.objects[i][0] == name)
      {
        self.tabs[id].workspace.objects.splice(i, 1);
      }
    }
  }
}

self.new_world_tab = function(world_id, images)
{
  self.tabs[world_id] = new IDE_Tab(self.username, "world", "world", world_id, self, "world_toolbox", images);
  if (self.game)
  {
    self.game.setup_game_world(self.tabs[world_id]);
  }

  // Start pushing data.
  if (!self.tabs[world_id].read_only)
  {
    wilddog.connectPublisherWorkspace(world_id, "world", self.tabs[world_id].workspace);
  }

  return self.tabs[world_id];
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
//

self.publish_pos = function(id, x, y)
{
  wilddog.publishHero(game.id, null, null, null, x, y, null, id);
}

//
// Setup the UI for creating/editing characters.
//

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

var character_types = ["lion", "eagle", "human", "smiley", "king", "knight", "dancer", "turtle", "custom"];
character_types.forEach(function(animal)
{
  $("#" + self.username + "-hero-type")['append']($("<option></option>",
      {"value": animal, "text": animal}));
});

}


//
// Tab containing one workspace for a world/hero.
//

var IDE_Tab = function(username, tab_name, hero_type, hero_id, parent, toolbox_id, images)
{
var self = this;
self.hero_id = hero_id;
self.hero_type = hero_type;
self.tab_name = tab_name;
self.images = images || [];
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
if (self.images.length)
{
  var thumbnail = new Image(20, 20);
  thumbnail.src = self.images[0];
  thumbnail.id = self.dom_id + '-thumbnail';
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
if (tab_name.toLowerCase() != "world" && !self.read_only)
{
  a['append']('<img id="' + self.dom_id + '-edit" src="heroes/edit.png" height=22 width=22>');
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
self.update_images = function(images)
{
  self.images = images;
  self.workspace.hero_images = [];
  Object.keys(images).forEach( function(el)
  {
    self.workspace.hero_images.push([el.toString(), el]);
  });

  
  $("#" + self.dom_id + '-thumbnail')['attr']('src', images[0]);
}

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

self.edit = function()
{
  parent.show_character_editor(self);
}
$("#" + self.dom_id + "-edit")['click'](function()
{
  setTimeout(function(){self.edit();}, 1);
});
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
