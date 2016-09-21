
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
  var username = (getQueryParam("username") || "unknown");
  username = username.toLowerCase();
  return username.charAt(0).toUpperCase() + username.slice(1);
}

var getSavedGame = function()
{
  return getQueryParam("saved");
}

///
/// If we're using wilddog, we should send our errors to the teacher.
///
var last_err_string = 0;
window.onerror = function(errorMsg, url, lineNumber)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + getUsername());

  var err_string = errorMsg + " - " + url + " - " + lineNumber;
  if (err_string != last_err_string)
  {
    ref['update']({"error" : err_string});
    last_err_string = err_string;
  }
}

var received_snapshots = {};
var sent_snapshots = {};


var connectSubscriberWorkspace = function(username, game_ref, workspace, hero_name)
{
  console.log(hero_name, username);
  var workspace_ref = game_ref['child'](hero_name)['child']("workspace");

  workspace_ref['on']("value", function(code) {
    code = code['val']();
    if (!code)
    {
      return;
    }

    //
    // Ignore updates from our own transmission..
    //
    if (code == sent_snapshots[username + hero_name])
    {
      return;
    }
    workspace.clear();

    received_snapshots[username + hero_name] = code;
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
var connectSubscriber = function(username, game, saved_game)
{

  var snapshot_key = saved_game || "Untitled Heroes"
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/games/" + snapshot_key);

  //
  // First listen for new workspaces.
  //

  ref['on']("child_added", function(child)
  {

    //
    // New workspace! Add a world/hero for it, and connect the new workspace.
    //
    var name = child['key']();
    var workspace;
    if (name.toLowerCase() == "world")
    {
      workspace = game.game_world.workspace;
    }
    else
    {
      var hero = game.addHero(name, child['val']()['type']);
      if (!hero)
      {
        hero = game.heroes[name]
      }
      workspace = hero.workspace;
    }
    connectSubscriberWorkspace(username, ref, workspace, name);
  });

}

var connectPublisher = function(username, game, saved_game)
{
  var snapshot_key = saved_game || "Untitled Heroes"
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/games/" + snapshot_key);

  game.register_new_hero_callback(function(hero_name, hero_type, workspace)
  {
    // Update the type of the hero.

    ref['child'](hero_name)["update"]({type: hero_type});
    connectPublisherWorkspace(username, ref, hero_name, workspace)
  });
}

var connectPublisherWorkspace = function(username, game_ref, hero_name, workspace)
{
  workspace.addChangeListener(function(change) {
    //
    // Ignore UI events.
    // Also ignore CREATE events, since they'll be automatically followed by a MOVE event.
    //
    if (change.type == Blockly.Events.UI) {
      return;
    }

    //
    // Get the current code.
    //
    var current_code = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));

    //
    // If we just sent or received this code, we can ignore it.
    //
    if (current_code === received_snapshots[username + hero_name])
    {
      return;
    }
    if (current_code === sent_snapshots[username + hero_name])
    {
      return;
    }
    sent_snapshots[username + hero_name] = current_code;

    //
    // Send the code to wilddog.
    //
    game_ref['child'](hero_name)['update']({workspace : current_code});

    return;
  });
}

var initStudentWilddog = function(game_name, level, game_object, saved_game){
  //
  // Give us a fresh start.
  //
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + getUsername());
  ref['update']({error: ""});

  //
  // Send current level.
  //
  ref['update']({"level": game_name + "-" + level});

  //
  // Send all our blockly changes.
  //
  connectPublisher(getUsername(), game_object, saved_game);

  //
  // Subscribe to all our/teacher blockly changes.
  //
  connectSubscriber(getUsername(), game_object, saved_game);
}
