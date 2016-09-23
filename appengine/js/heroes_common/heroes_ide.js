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


//
// An object that displays several blockly workspaces to produce hero code.
//
var IDE = function(username, game)
{
var self = this;
self.username = username;
self.game = game;
self.tabs = {};

//
// Setup the tab for creating a new hero.
//
var character_types = ["lion", "eagle", "human"];
character_types.forEach(function(animal)
{
  $("#" + username + "-hero-type")['append']($("<option></option>",
      {"value": animal, "text": animal}));
});

$("#" + self.username + "-submit-hero")['click'](function()
{
  var name = $("#" + username + "-hero-name")['val']();
  var type = $("#" + username + "-hero-type")['val']();

  name = name.replace(/[^a-zA-Z0-9]+/g, "");

  if (!name || !type)
  {
    console.log("Fill out the whole form: ", name, type);
    return;
  }

  self.new_hero_tab(name, type);
})

// If the user hits enter, prevent the POST event and just add a hero.
$('.tab-pane')['keydown'](function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    $("#" + self.username + "-submit-hero")['click']();
  }
});

//
// When a new hero is created.
//
self.new_hero_tab = function(new_tab_name, type)
{
  //
  // Register the hero.
  //

  if (self.tabs[new_tab_name])
  {
    console.log("This hero already exists: ", new_tab_name);
    return self.tabs[new_tab_name]
  }


  self.tabs[new_tab_name] = new IDE_Tab(self.username, new_tab_name, type);

  // Start pushing data.
  if (!self.tabs[new_tab_name].read_only)
  {
    connectPublisherWorkspace(username, new_tab_name, type, self.tabs[new_tab_name].workspace);
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
    self.game.addHero(new_tab_name, type, self.tabs[new_tab_name]);
  }

  //
  // Setup the delete click event.
  //
  $("#" + self.tabs[new_tab_name].dom_id + "-x")['click'](
    function()
    {
      self.remove_tab(new_tab_name);
    }
  )

  return self.tabs[new_tab_name];
}

self.remove_tab = function(tab_name)
{
  //
  // Remove from DOM, self, game, and wilddog.
  //

  self.tabs[tab_name].remove();
  delete self.tabs[tab_name];

  if (self.game)
  {
    self.game.remove_hero(tab_name);
  }
  publishDeleteTab(self.username, tab_name);

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

self.new_world_tab = function()
{
  if (self.tabs["world"])
  {
    return self.tabs["world"];
  }

  self.tabs["world"] = new IDE_Tab(self.username, "world", "world", "world_toolbox");
  if (self.game)
  {
    self.game.setup_game_world(self.tabs["world"]);
  }

  // Start pushing data.
  if (!self.tabs["world"].read_only)
  {
    connectPublisherWorkspace(username, "world", "world", self.tabs["world"].workspace);
  }

  return self.tabs["world"];
}
}

//
// Tab containing one workspace for a world/hero.
var IDE_Tab = function(username, tab_name, hero_type, toolbox_id)
{
var self = this;
self.hero_type = hero_type;
toolbox_id = toolbox_id || 'toolbox';
self.dom_id = username + "-" + tab_name;
self.read_only = !(getUsername() == username ||
                   getUsername().toLowerCase() == "classadoo_instructor");
//
// Add the tab for this hero.
//
var workspaces = $('#' + username + '-blockly');
var li = $('<li role="presentation" id="' + self.dom_id + '-li">' +
  '</li>')['insertBefore']("#" + username + "-new-hero-button");

var a = $('<a href="#' + self.dom_id + '-container" aria-controls="' + self.dom_id + '-container" data-toggle="tab" role="tab" class="hero-tab">' +
    tab_name +
    '<img id="' + self.dom_id + '-spinner" class="spinner" src="heroes/loading.gif" height=15 width=15>' +
  '</a>');

//
// Show the delete button, if this is an optional sprite owned by this page's user.
//
if (tab_name.toLowerCase() != "world" && username==getUsername())
{
  a['append']('<img id="' + self.dom_id + '-x" src="heroes/x.png" height=15 width=15>');
}
li['append'](a);


$('<div role="tabpanel" class="tab-pane active" id="' + self.dom_id + '-container">' +
    '<div class="workspace" id="' + self.dom_id + '"</div>' +
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

var blocklyDiv = document.getElementById(self.dom_id);
var onresize = function(e) {
  var width = window.innerWidth - 620;
  blocklyDiv.style.width = width + 'px';

  // We may have loaded stuff when the canvas was hidden, which corrupts the blocks.
  // We have to clear and reload everything...
  // This sucks but it's expected  https://groups.google.com/forum/#!msg/blockly/XaeaMAMqnLg/yTV0Z1b3DwAJ

  var xml = Blockly.Xml.workspaceToDom(self.workspace);
  self.workspace.clear();
  Blockly.Xml.domToWorkspace(xml, self.workspace);

  Blockly.svgResize(self.workspace);
};
window.addEventListener('resize', onresize);

$('#' + self.dom_id + '-li a')['click'](function (e) {
  e['preventDefault']();
  $(this)['tab']('show');
  onresize();
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
}



//
// HACK! Utility for grabbing all event code and moving it to the front of our code.
// Functions MUST start with a specific string to be moved forward.
// Also we're screwed if there is a random ( or ) in a string.
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
