var apiKey,
    sessionId,
    token;

var MEETING_CENTER_URL = 'https://aqueous-badlands-97819.herokuapp.com';

var connectionCount  = 0;
var pleaseAllowCamera = document.getElementById("pleaseAllowCamera");

//hold the connection with the status
// connection = {conObj: connection, stmObj: stream};

var connections = {

};

var localCam = {
  st: st_unconnected
};

var comStatus = {

};

var st_unconnected = "unconnected";
var st_connected = "connected";
var st_inited = "inited";
var st_published = "published";


function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}

var name = GetURLParameter("name");
if ( name === "undefined" || name == null) {
  var now = new Date(Date.now());
  name = "User:" +  now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
}


var meetingID = GetURLParameter("meetingID");
if ( meetingID === "undefined" || meetingID == null) {
  var now = new Date(Date.now());
  name = "User:" +  now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
}

$(document).ready(function() {

  var meetingID = GetURLParameter("meetingID");
  if ( meetingID === "undefined" || meetingID == null) {
    uiDisplayMessage("Missing meetingID, please add meetingID");
    return;
  } 

  var name = GetURLParameter("name");
  if ( name === "undefined" || name == null) {
    uiDisplayMessage("Missing user name, please add name");
    return;
  }
  $("#camlight").html(name);
  uiChangeStatus("camlight", st_unconnected);

  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  $.ajax({
     url:MEETING_CENTER_URL + '/meeting/' + meetingID + '/' + name,
     dataType: 'json', // Notice! JSONP <-- P (lowercase)
     success:function(res){
         // do stuff with json (in this case an array)
         apiKey = res.apiKey;
          sessionId = res.sessionId;
          token = res.token;
          if (OT.checkSystemRequirements() == 1) {
            initializeSession(function(err){
              if( err != null ){
                console.log("initialSession failed " + err);
              }
              else{
                console.log("initialSession succeed ");
              }
            });
          } else {
            // The client does not support WebRTC.
            // You can display your own message.
          }
     },
     error:function( jqXHR, textStatus, errorThrown){
         console.log(textStatus + "   " + errorThrown)
     }      
  });//ajax

});//document.ready

var session = null;
var publisher = null;

// Listen for exceptions
OT.on("exception", function(event) {
    console.log(event.message);
});

var formatString = function (str, col) {
    col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);

    return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
        if (m == "{{") { return "{"; }
        if (m == "}}") { return "}"; }
        return col[n];
    });
};

var connHtml = "<div id={id} ><div id='light'></div><div id='connid'>{name}</div></div>";
var msgHtml = "<div id='message'>{msg}</div>";

function newConnectionCreated(connection){
  connections[connection.connectionId] = {'conObj':connection};
  var uiHtml = formatString(connHtml, {id:connection.connectionId, name:JSON.parse(connection.data).username});
  $('#connections').append(uiHtml);
}

function connectionDestroyed(connection){
  delete connections[connection.connectionId];
}

function initializeSession(cb) {
  if(session != null){
    //We already have session.
    cb(null);
    return;
  }
  session = OT.initSession(apiKey, sessionId);


  // Subscribe to a newly created stream
  session.on('streamCreated', function(event) {
    session.subscribe(event.stream, 'subscriber', {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    });
  });

  session.on("streamDestroyed", function(event) {
      console.log("Stream " + event.stream.name + " ended. " + event.reason);
  });

  session.on('sessionDisconnected', function(event) {
    console.log('You were disconnected from the session.', event.reason);
    if (event.reason === 'networkDisconnected') {
      console.log('You lost your internet connection.'
        + 'Please check your connection and try connecting again.');
    }    
  });

  session.on('connectionCreated', function (event) {
    connectionCount++;
    if (event.connection.connectionId != session.connection.connectionId) {
      newConnectionCreated(event.connection);

      console.log('Another client connected. ' + event.connection.connectionId + "   " + connectionCount + ' total.');

    }
    else{
      localCam.st = st_connected;
      uiChangeStatus("camlight", st_connected)
    }
  });
  
  session.on('connectionDestroyed', function (event) {
    connectionCount--;
    connectionDestroyed(event.connection);
    console.log('A client disconnected. ' + event.connection.connectionId + "   " + connectionCount + ' total.');
  });
  
  session.on("signal", function(event) {
      console.log("Signal sent from connection " + event.from.id);
      if( event.from.id == session.connection.connectionId){
        console.log("ignore signal from myself");
        return;
      }
      connection = connections[event.from.id]
      var from = JSON.parse(connection.data).username;
      console.log("Signal is " + event.data + "  from " + from);
      uiDisplaySignal( event.data );
      // Process the event.data property, if there is any data.
    });
  
  // Connect to the session
  session.connect(token, function(error) {
    // If the connection is successful, initialize a publisher and publish to the session
    if (error) {
      console.log('There was an error connecting to the session: ', error.code, error.message);
      if (err.code === 1006) {
        console.log('Failed to connect. Please check your connection and try connecting again.');
      } else {
        console.log('An unknown error occurred connecting. Please try again later.');
      }
      cb(error);
    }
    
    cb(null)

  });
}

function _initPublisher(cb){
      if(publisher != null){
        if(cb != null){
          cb(null);
        }
        return;
      }
      publisher = OT.initPublisher(
      'publisher', 
      {
        insertMode: 'append',
        width: '100%',
        height: '100%',
        "name": name
      },
      function(error) {
        if (error) {
          console.log('Publisher can not be initialized.',  error.code, error.message);
          if(cb != null){
            cb(error);
          }
        } else {
          localCam.st = st_inited;
          uiChangeStatus("camlight", st_inited);
          console.log('Publisher initialized.');
          if(cb != null){
            cb(null);
          }
        }
      }
    );
      
    publisher.on({
      accessAllowed: function (event) {
        // The user has granted access to the camera and mic.
        console.log("The user has granted access to the camera and mic.");
      },
      accessDenied: function accessDeniedHandler(event) {
        // The user has denied access to the camera and mic.
        console.log("The user has denied access to the camera and mic.");
      }
    });
      
    publisher.on({
      accessDialogOpened: function (event) {
        // The Allow/Deny dialog box is opened.
        pleaseAllowCamera.style.display = 'block';
        console.log("The Allow/Deny dialog box is opened.");
      },
      accessDialogClosed: function (event) {
        // The Allow/Deny dialog box is closed.
        pleaseAllowCamera.style.display = 'none';
        console.log("The Allow/Deny dialog box is closed.");
      }
    });

        
    publisher.on('streamCreated', function (event) {
        localCam['stmObj']=event.stream;
        localCam.st = st_published;
        uiChangeStatus("camlight", st_published);
        console.log('The publisher started streaming.');

    });

    publisher.on('streamDestroyed', function (event) {
        delete localCam['stmObj'];
        localCam.st = st_inited;
        event.preventDefault();
        uiChangeStatus("camlight", st_inited);
        console.log('Publisher stopped streaming.');

    });
}

function _publish(cb ){
    session.publish(publisher, function(error) {
      if (error) {
        console.log(error);
        cb(error)

      } else {
        console.log('Publishing a stream.');
        cb(null)
      }
    });
}


function _unPublish(cb){
    session.unpublish(publisher, function(error) {
      if (error) {
        console.log(error);
        if(cb != null){
          cb(error)
        }
      } else {
        console.log('unpublishing a stream.');
        if(cb != null){
          cb(null);
        }
      }
    });
}


function _sendSignal(text, cb){

  session.signal(
  {
    data:text
  },
  function(error) {
    if (error) {
      console.log("signal error ("
                   + error.code
                   + "): " + error.message);
      cb(error);
    } else {
      console.log("signal sent.");
      cb(null)
    }
  }
);
}


function publishStream(){

  async.series([
        initializeSession,
        _initPublisher,
        _publish
      ],
      function(err, results) {
          // results is now equal to ['one', 'two']
      }
  );
}

function sendSignal(text){
  console.log("sending signal " + text )
  async.series([
        initializeSession,
        function(cb){
          _sendSignal(text, cb);
        }
      ],
      function(err, results) {
          // results is now equal to ['one', 'two']
      }
  );
}

function sendCommand(cmd){
  console.log("sending command " + cmd )
  async.series([
        initializeSession,
        function(cb){
          _sendSignal(text, cb);
        }
      ],
      function(err, results) {
          // results is now equal to ['one', 'two']
      }
  );

}

$("#mytext").keyup(function(event){
    if(event.keyCode == 13){
        $("#btnSend").click();
    }
});

function uiSendSignal(){
   var text = $('#mytext').val();
   sendSignal(text);
}

function uiDisplaySignal(text){

 $('#mysignal').text( text );
}

function uiDisplayMessage(msg){
  var uiHtml = formatString(msgHtml, {"msg":msg});
  $('#messagebox').append(uiHtml);
  //$('#messagebox').text( msg );
  incHeight("messagebox", 20)
}
var st_unconnected = "unconnected";
var st_connected = "connected";
var st_pub_local = "pub_local";
var st_pub_remote = "pub_remote";

function uiChangeStatus(id, status){
  var uiid = "#" + id;

  //console.log($(uiid).style)

  switch(status){
    case st_unconnected:
      $(uiid).css('color', '#B6B6B4');
      
    break;
    case st_connected:
      $(uiid).css('color', '#736F6E');
    break;
    case st_inited:
      $(uiid).css('color', '#008015');
    break;
    case st_published:
      $(uiid).css('color', '#FF4500');
    break;
  }
  
}

function getConnectionStatus(connection){

}

function uiFlipStatus(){
  switch(localCam.st){
    case st_unconnected:
      console.log("uiFlipStatus " + st_unconnected)
    break;
    case st_connected:
      console.log("uiFlipStatus " + st_connected)
      _initPublisher(null);
    break;
    case st_inited:
      publishStream();
    break;
    case st_published:
      _unPublish(null);
    break;
  }
};
  

function incHeight(id, delta) {
    var el = document.getElementById(id);
    var height = el.offsetHeight;
    var newHeight = height + delta;
    el.style.height = newHeight + 'px';
}