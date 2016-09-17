
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
var connectSubscriber = function(username, workspace, saved_game)
{

  var snapshot_key = saved_game || "Untitled Heroes"
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/snapshots");

  ref['child'](snapshot_key)['on']("value", function(code) {
    code = code['val']();
    if (!code)
    {
      return;
    }

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

    //
    // Someone changed some blocks. Make sure they're visible.
    //

    workspace.zoomToFit();
    workspace.zoomCenter(-1);
  });

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

    snapshot_key = saved_game || "Untitled Heroes";
    var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/snapshots");

    var snapshot_obj = {};
    snapshot_obj[snapshot_key] = current_code;
    ref['update'](snapshot_obj);

    return;
  });
}

var initStudentWilddog = function(game, level, workspace, saved_game){
  //
  // Give us a fresh start.
  //
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + getUsername());
  ref['update']({error: ""});

  //
  // Send current level.
  //
  ref['update']({"level": game + "-" + level});

  //
  // Send all our blockly changes.
  //
  connectPublisher(getUsername(), workspace, saved_game);

  //
  // Subscribe to all our/teacher blockly changes.
  //
  connectSubscriber(getUsername(), workspace, saved_game);
}
