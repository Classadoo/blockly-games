
goog.provide('WilddogUtils');

goog.require('BlocklyGames');

var getQueryParam = function(param)
{
  var url = window.location.href;
  var regex = new RegExp("[?&]" + param + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return null;
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var getUsername = function()
{
  if (window.location.pathname.indexOf("teacher_dash") > -1)
  {
    return "Teacher";
  }
  var username = (getQueryParam("username") || "unknown");
  username = username.toLowerCase();
  return username.charAt(0).toUpperCase() + username.slice(1);
}

var getSavedGame = function()
{
  // Fall back to the name of this classroom.
  return getQueryParam("saved");
}

var getClassroom = function()
{
  return getQueryParam("classroom") || "none";
}

//
// Helper functions for connecting wilddog with a local IDE.
//
function WilddogInterface(classroom)
{
var self = this;
self.ref = new Wilddog("https://classadoo-heroes.wilddogio.com");

var classroom_ref = self.ref['child']("classrooms")['child'](classroom);

self.setError = function(username, err_string)
{
  var user_ref = self.ref['child']("users")['child'](username);
  user_ref['update']({"error" : err_string});
  last_err_string = err_string;
}

self.publishNewGame = function(username)
{
  var key = self.ref['child']("games").push()['key']();
  game_object = {"game_id": key};

  var user_ref = self.ref['child']("users")['child'](username);
  user_ref['child']("games")['child'](classroom)['update'](game_object);
  classroom_ref['child']("games")['child'](username)['update'](game_object);
  return key;
}

self.publishHero = function(game_id, name, type, index, x, y, images, hero_id)
{
  var hero_ref;
  if (!hero_id)
  {
    hero_ref = self.ref['child']("heroes").push();
    var hero_id = hero_ref['key']();

    hero_object = {"index": index};
    self.ref['child']("games")['child'](game_id)['child']("heroes")['child'](hero_id)['update'](hero_object);
  }
  else
  {
    hero_ref = self.ref['child']("heroes")['child'](hero_id);
  }
  
  //
  // Update whatever qualities were provided.
  //
  if (x && y)
  {
    hero_ref['update']({"x" : x, "y" : y});
  }
  if (images)
  {
    hero_ref['update']({"images": images});
  }
  if (name && type)
  {
    hero_ref['update']({"name": name, "type": type});
  }
}

var received_snapshots = {};
var sent_snapshots = {};
self.connectSubscriberWorkspace = function(hero_id, workspace)
{
  var workspace_ref = self.ref['child']("heroes")['child'](hero_id)['child']("workspace");
  workspace_ref['on']("value", function(code) {
    code = code['val']();
    if (!code)
    {
      return;
    }

    //
    // Ignore updates from our own transmission..
    //
    if (code == sent_snapshots[hero_id])
    {
      return;
    }
    workspace.clear();

    received_snapshots[hero_id] = code;
    var xml = Blockly.Xml.textToDom(code);
    Blockly.Xml.domToWorkspace(xml, workspace);
    workspace.clearUndo();

    //
    // Someone changed some blocks. Make sure they're visible.
    //

    workspace.zoomToFit();
    workspace.zoomCenter(-1);
  });
}


//
// Connect to a remote game and apply all wilddog updates to our replica.
//
self.connectSubscriberGame = function(game_id, ide)
{

  var game_heroes_ref = self.ref['child']("games")['child'](game_id)['child']("heroes");

  //
  // First listen for new heroes.
  //

  game_heroes_ref["orderByChild"]("index")['on']("child_added", function(child)
  {
    //
    // New workspace! Add a world/hero for it, and connect the new workspace.
    //
    var id = child['key']();

    //
    // Subscribe to changes to this hero metadata.
    //
    var first_call = true;
    var hero_ref = self.ref['child']("heroes")['child'](id);
    hero_ref['on']('value', function(hero)
    {
      hero = hero['val']();
      if (hero)
      {
        var name = hero.name;
        var type = hero.type || "human";
        var images = hero.images || [];
        if (first_call)
        {
          var tab;
          if (name.toLowerCase() == "world")
          {
            tab = ide.new_world_tab(id, images);
          }
          else
          {
            tab = ide.new_hero_tab(name, type, id, images);
          }
          self.connectSubscriberWorkspace(id, tab.workspace);
        }
        first_call = false;

        if (hero.x && hero.y && (name.toLowerCase() != "world"))
        {
          ide.update_hero(name, hero.x, hero.y, images);
        }
      }
    })
  });
}

self.publishDeleteTab = function(hero_id, game_id)
{
  var heroes_ref = self.ref['child']("heroes");
  var game_heroes_ref = self.ref['child']("games")['child'](game_id)['child']("heroes");
  game_heroes_ref['child'](hero_id)['remove']();
  heroes_ref['child'](hero_id)['remove']();
}


self.publishWorkspace = function(hero_id, hero_type, workspace)
{
  var hero_ref = self.ref['child']("heroes")['child'](hero_id);

  if (workspace)
  {
    //
    // Get the current code.
    //
    var current_code = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));

    //
    // If we just sent or received this code, we can ignore it.
    //
    if (current_code === received_snapshots[hero_id])
    {
      return;
    }
    if (current_code === sent_snapshots[hero_id])
    {
      return;
    }
    sent_snapshots[hero_id] = current_code;

    //
    // Send the code to wilddog.
    //
    hero_ref['update']({"workspace" : current_code, "type": hero_type});
  }

  // Update the type, regardless.
  hero_ref['update']({"type": hero_type});
}

self.connectPublisherWorkspace = function(hero_id, hero_type, workspace)
{
  workspace.addChangeListener(function(change)
  {
    //
    // Ignore UI events.
    // Also ignore CREATE events, since they'll be automatically followed by a MOVE event.
    //
    if (change.type == Blockly.Events.UI) {
      return;
    }
    self.publishWorkspace(hero_id, hero_type, workspace);
  });
  self.publishWorkspace(hero_id, hero_type, null);
}

self.setLevel = function(username, level)
{
  var user_ref = self.ref['child']("users")['child'](username);
  user_ref['update']({"level": "" + level});
}

self.removeGame = function(username, game_id, ide_tabs)
{
  var game_ref = self.ref['child']('games')['child'](game_id);
  var user_ref = self.ref['child']('users')['child'](username);
  var heroes_ref = self.ref['child']('heroes');


  game_ref['remove']();
  user_ref['child']("games")['child'](classroom)['remove']();
  classroom_ref['child']("games")['child'](username)['remove']();

  for (var tab in ide_tabs)
  {
    heroes_ref['child'](ide_tabs[tab].hero_id)['remove']();
  }
}

self.connectSubscriberClassroom = function(new_game_callback, max_level_callback)
{
  //
  // Register callback for the max level of this classroom.
  //
  if (max_level_callback)
  {
    classroom_ref['child']('level')["on"]("value", function(level)
    {
      if (level['val']())
      {
        var level_allowed = level['val']() || 999;
        max_level_callback(level_allowed);
      }
    });
  }

  //
  // Register callback for new students.
  //
  classroom_ref['child']("games")['on']("child_added", function(game)
  {
    var username = game['key']();
    var game_id = game['val']()['game_id'];
    new_game_callback(username, game_id);
  });
}

self.setIDE = function(username, ide_username)
{
  var user_ref = self.ref['child']('users')['child'](username);
  user_ref['update']({"ide_username" : ide_username});
}

self.subscribeToIDE = function(username, ide_callback)
{
  var ide_ref = self.ref['child']('users')['child'](username)['child']("ide_username");
  ide_ref['on']("value", function(ide_ref)
  {
    if (ide_ref['val']())
    {
      ide_callback(ide_ref['val']());
    }
  });
}

self.set_running = function(username, game_name, running)
{
  var user_ref = self.ref['child']("users")['child'](username);
  var code_obj = {};
  code_obj[game_name] = running;
  user_ref['update']({"code_running" : code_obj});
}
}
