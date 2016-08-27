// Andrew Heine


// TODO(aheine): is it a good idea to re-instantiate wilddog all over?
// We could expose an option to pass in an existing ref.

//
// Push a blockly message and/or level to a user's object.
//
var push_to_user = function(msg, level, user_name)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + user_name);

  if (msg)
  {
    console.log("Sending ", msg.blkmsg.type, msg, user_name);
    ref.child("events").push(msg);
  }
  else {
    console.log("Clearing messages");
    ref.child("events").set({});
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
var add_user_event_callback = function(user_name, callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + user_name + "/events");
  ref.on("child_added", function(event)
  {
    console.log("received ", event);
    callback(event);
  });
}

//
// Add a callback from when data is removed from a user.
// For now, we should assume this means the user is all cleared.
//
var add_user_remove_callback = function(user_name, callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + user_name + "/events");
  ref.on('child_removed', function(old_snapshot)
  {
    console.log("Child removed", user_name);
    callback(old_snapshot);
  });
}

//
// Add a callback for when a new student arrives.
//
var add_new_student_callback = function(callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/");
  ref.on("child_added", callback);
}

//
// Add a callback for when a student changes levels.
//
var add_user_level_callback = function(user_name, callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + user_name + "/level");
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
