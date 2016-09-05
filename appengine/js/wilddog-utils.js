
goog.provide('WilddogUtils');
goog.require('BlocklyGames');

/// HACK (aheine): get the user name in a better way
function getUsername() {
  var url = window.location.href;
  var regex = new RegExp("[?&]username(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return "unknown";
  if (!results[2]) return 'unknown2';
  return decodeURIComponent(results[2].replace(/\+/g, " ")) + "_heroes";
}

var received_snapshots = {};
var sent_snapshots = {};
var connectSubscriber = function(username, workspace)
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
  });
}

var connectPublisher = function(username, workspace)
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
    var current_code = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(  workspace));


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
    update_snapshot(username, current_code);
    return;
  });
}

var initStudentWilddog = function(game, level, workspace, teacher_workspace){
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
  connectPublisher(getUsername(), workspace);

  //
  // Subscribe to all our/teacher blockly changes.
  //
  connectSubscriber("classadoo_instructor", teacher_workspace);
  connectSubscriber(getUsername(), workspace);
}
