// Andrew Heine


// TODO(aheine): is it a good idea to re-instantiate wilddog all over?
// We could expose an option to pass in an existing ref.

//
// Interface to wilddog events. The basic structure in wilddog is:
//   {username : {snapshots : {"current" : "", "foo-etc" : ""}, level : 9}}
//

///
/// If we're using wilddog, we should send our errors to the teacher.
///
window.onerror = function(errorMsg, url, lineNumber)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + getUsername());
  ref.update({"error" : errorMsg + " - " + url + " - " + lineNumber});
}

var add_error_callback = function(username, callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/error");
  ref.on("value", function(err)
  {
    callback(err.val());
  });
}

var clear_error = function(username)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username);
  ref.update({error: ""});
}

///
/// PUSH DATA
///

var update_level = function(username, level)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username);
  ref.update({"level": level});
}


var update_snapshot = function(username, xml, snapshot_key)
{
  snapshot_key = snapshot_key || "current"
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/snapshots");

  var snapshot_obj = {};
  snapshot_obj[snapshot_key] = xml;
  ref.update(snapshot_obj);
}

///
/// ADD CALLBACKS.
///

var add_snapshot_callback = function(username, callback, snapshot_key)
{
  snapshot_key = snapshot_key || "current"
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/snapshots");

  ref.child(snapshot_key).on("value", function(snapshot)
  {
    if (snapshot.val())
    {
      callback(snapshot.val());
    }
  });
}


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
}


var add_new_student_callback = function(callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/");
  ref.on("child_added", function(snapshot)
  {
    console.log("New student ", snapshot.key());
    callback(snapshot);
  });
}


var add_user_level_callback = function(username, callback)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username + "/level");
  ref.on("value", function(snapshot){
    callback(snapshot.val());
  });
}

///
/// REMOVE DATA.
///

var clear_users = function()
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users");
  ref.set({"classadoo_instructor" : {}});
}


var clear_one_user = function(username)
{
  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + username);
  console.log("Clearing user", username);
  ref.remove();
}
