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
