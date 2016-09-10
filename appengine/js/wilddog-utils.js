
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

var received_snapshots = {};
var sent_snapshots = {};
var connectSubscriber = function(username, workspace, saved_game)
{
  add_snapshot_callback(username, function(code) {
    //
    // Ignore updates from our own transmission..
    //
    if (code == sent_snapshots[username])
    {
      return;
    }
    workspace.clear();

    received_snapshots[username] = code;
    var xml = Blockly.Xml.textToDom(code);
    Blockly.Xml.domToWorkspace(xml, workspace);
    workspace.clearUndo();
  }, saved_game);
}

var connectPublisher = function(username, workspace, saved_game)
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
    if (current_code === received_snapshots[username])
    {
      return;
    }
    if (current_code === sent_snapshots[username])
    {
      return;
    }
    sent_snapshots[username] = current_code;
    update_snapshot(username, current_code, saved_game);
    return;
  });
}

var initStudentWilddog = function(game, level, workspace, saved_game){
  //
  // Give us a fresh start.
  //
  clear_error(getUsername());

  //
  // Send current level.
  //
  update_level(getUsername(), game + "-" + level);

  //
  // Send all our blockly changes.
  //
  connectPublisher(getUsername(), workspace, saved_game);

  //
  // Subscribe to all our/teacher blockly changes.
  //
  connectSubscriber(getUsername(), workspace, saved_game);
}
