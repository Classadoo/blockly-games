// Andrew Heine


// TODO(aheine): is it a good idea to re-instantiate wilddog all over?
// We could expose an option to pass in an existing ref.

//
// Push a blockly message and/or level to a user's object.
//
var push_to_user = function(msg, level, username)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username);

  if (msg)
  {
    console.log("Sending ", msg.blkmsg.type, msg, username);
    ref.child("events").push(msg);
  }

  if (level != null)
  {
    console.log("Sending new level", level);
    ref.update({"level": level});
  }

}

//
// Add a callback for when a new blockly event lands in wilddog.
//
var add_user_event_callback = function(username, callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/events");
  ref.on("child_added", function(event)
  {
    console.log("received ", event);
    callback(event);
  });
}

//
// Add a callback from when a user is deleted or his blocks are removed.
// (For now, we should assume this means the user is all cleared.)
//
var add_user_remove_callback = function(username, callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/");

  // Watch out for the user being deleted.
  ref.on('child_removed', function(old_snapshot)
  {
    if (old_snapshot.key() == username)
    {
      console.log("Child removed", username);
      callback();
    }
  });

  // Watch out for the user's events being removed.
  var blocks_ref = ref.child(username).child("events");
  blocks_ref.on('child_removed', function(old_snapshot)
  {
    console.log("Child removed", username);
    callback();
  });
}

//
// Add a callback for when a new student arrives.
//
var add_new_student_callback = function(callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/");
  ref.on("child_added", function(snapshot)
  {
    console.log("New student ", snapshot.key());
    callback(snapshot);
  });
}

//
// Add a callback for when a student changes levels.
//
var add_user_level_callback = function(username, callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/level");
  ref.on("value", function(snapshot){
    callback(snapshot.val());
  });
}

//
// Send a message to clear all student data from wilddog.
//
var clear_users = function()
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users");
  ref.set({"classadoo_instructor" : []});
}

//
// Clear a single user's workspace.
//
var clear_one_user = function(username)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username);
  console.log("Clearing user", username);
  ref.child("events").set({});
}

//
// Helper function for checking a message is worth reading.
//
var clean_event = function(event, my_id)
{
  var wdmsg = event.val();
  if(!wdmsg){
      console.log("Nothing in database, return");
      return null;
  }
  if (wdmsg.sender == my_id)
  {
    return null;
  }

  var blkmsg = wdmsg.blkmsg;
  return blkmsg;
}

//
// Helper function for generating a globally unique identifier.
//
var guid = function()
{
  var s4 = function()
  {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

/// HACK (aheine): get the user name in a better way
function getUsername() {
    var url = window.location.href;
    var regex = new RegExp("[?&]username(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var initStudentWilddog = function(game, workspace, teacher_workspace){
    var user_id = guid();
    push_to_user(null, game + "-" + BlocklyGames.LEVEL, getUsername());

    var events_in_progress = {};
    workspace.addChangeListener(function(masterEvent) {
      if (masterEvent.type == Blockly.Events.UI) {
        return;  // Don't mirror UI events.
      }

      if (events_in_progress[masterEvent.blockId + masterEvent.type] === true)
      {
        console.log("don't send event triggered by wilddog.", masterEvent);
        events_in_progress[masterEvent.blockId + masterEvent.type] = false;
        return;
      }


      // Convert event to JSON for transmitting across the net.
      var json = masterEvent.toJson();
      var wdmsg = {"sender":user_id, "blkmsg":json};

      console.log("Sending student event", masterEvent);
      push_to_user(wdmsg, null, getUsername());
    });

    var teacher_event_callback = function(snapshot) {
      var blkmsg = clean_event(snapshot, user_id);
      if (!blkmsg)
      {
        return;
      }
      var slaveEvent = Blockly.Events.fromJson(blkmsg, teacher_workspace);

      try {
        if (slaveEvent.type == "ui" && slaveEvent.newValue)
        {
          teacher_workspace.highlightBlock(slaveEvent.newValue);
        }
        else
        {
          var existingGroup = Blockly.Events.getGroup();
          var groupid = existingGroup;
          if (!existingGroup) {
              Blockly.Events.setGroup(true);
              groupid = Blockly.Events.getGroup();
          }
          slaveEvent.run(true);
          if (!existingGroup) {
              Blockly.Events.setGroup(false);
          }
        }
      }
      catch(err) {
        console.log("Error running slave event", err.message);
      }
    }
    add_user_event_callback("classadoo_instructor", teacher_event_callback);
    add_user_remove_callback("classadoo_instructor", function(old_snapshot)
    {
      teacher_workspace.clear();
    });

    var self_event_callback = function(snapshot) {
      var blkmsg = clean_event(snapshot, user_id);
      if (!blkmsg)
      {
        return;
      }
      var slaveEvent = Blockly.Events.fromJson(blkmsg, workspace);

      try {
        if (slaveEvent.type == "ui" && slaveEvent.newValue)
        {
          BlocklyInterface.highlight(slaveEvent.newValue);
        }
        else
        {
          var existingGroup = Blockly.Events.getGroup();
          var groupid = existingGroup;
          if (!existingGroup) {
              Blockly.Events.setGroup(true);
              groupid = Blockly.Events.getGroup();
          }
          events_in_progress[slaveEvent.blockId + slaveEvent.type] = true;
          // Create will automatically trigger a move, so don't send our move command back to the student.
          if (slaveEvent.type == "create")
          {
            events_in_progress[slaveEvent.blockId + "move"] = true;
          }
          slaveEvent.run(true);
          if (!existingGroup) {
              Blockly.Events.setGroup(false);
          }
        }
      }
      catch(err) {
         console.log("Error executing slave event", err.message);
      }
    }
    add_user_event_callback(getUsername(), self_event_callback);
}
