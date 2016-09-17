var apiKey,
    sessionId,
    token;

var MEETING_CENTER_URL = 'https://aqueous-badlands-97819.herokuapp.com';

var connectionCount  = 0;
var pleaseAllowCamera = document.getElementById("pleaseAllowCamera");

//hold the connection with the status
// connection = {conObj: connection, stmObj: stream, status: st};

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

var st_calling = "calling";
var st_notcalling = "notcalling"

var cmd_inited = "cmd_inited"; //this is really a status update, telling everyone that my camera is ready.
var cmd_publish = "cmd_pub";
var cmd_unpublish = "cmd_unpub"
var cmd_callhelp = "cmd_callhelp"
var cmd_callcancel = "cmd_callcancel";
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

function get_browser(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 }

var pageName = document.location.pathname.match(/[^\/]+$/)[0];

console.log(pageName);

var isTeacherPage = (pageName.toLowerCase().indexOf('teacher') != -1 );

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

var connHtml = "<div id={id} class='subscriber'><div id='{id}-ctrl' class='camctrl'>" +
                "<a href='#' id='{id}-camlight' class='camButton'>{name}</a>" +
               "</div><div id='{id}-video' ></div></div>";
var msgHtml = "<div id='message'>{msg}</div>";

var compmsg_en = "You browser {name}, version {version} does not support our video conference system. In order to use our video conference system, "
                + "please click following icon to install the latest version Chrome or Firefox. </p> "
                + "您的浏览器（{name} 版本{version}）不支持我们的视频会议系统。请点击下载安装谷歌浏览器或者火狐浏览器。"

var compmsg_en_too_old = "You browser {name}, version {version} does not support our video conference system. In order to use our video conference system, "
                + "please click following icon to install the latest version Chrome or Firefox. </p> "
                + "您的浏览器（{name} 版本{version}）版本太旧，不支持我们的视频会议系统。请点击下载安装最新版的谷歌浏览器或者火狐浏览器。"

$(document).ready(function() {

  var meetingID = GetURLParameter("meetingID");
  if ( meetingID === "undefined" || meetingID == null) {
    uiDisplayMessage("Missing meetingID in your url, please add meetingID in the url. Please ask your teacher for help.");
    return;
  } 

  var name = GetURLParameter("name");
  if ( name === "undefined" || name == null) {
    uiDisplayMessage("Missing user name in your url, please add name in the url. Please ask your teacher for help.");
    return;
  }
  $("#camlight").html(name);
  uiChangeStatus("camlight", st_unconnected);

  $("#videos").draggable();

  var meetingurl = MEETING_CENTER_URL + '/meeting/' + meetingID + '/' + name;
  if(isTeacherPage){
    meetingurl += "?role=teacher";
  }

//Make button flash
  setInterval(function() {
    var box = $('.flashbtn');
    if (box.css('color') == 'rgb(0, 128, 21)') {
        box.css({'color':'rgb(255,69,00)'});
    }
    else {
        box.css({'color':'rgb(0, 128, 21)'});
    }
  }, 500);


  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  $.ajax({
     url:meetingurl,
     dataType: 'json', // Notice! JSONP <-- P (lowercase)
     success:function(res){
         // do stuff with json (in this case an array)
         apiKey = res.apiKey;
          sessionId = res.sessionId;
          token = res.token;
          if (OT.checkSystemRequirements() == 1) {
            $('#videos').show();
            initializeSession(function(err){
              if( err != null ){
                console.log("initialSession failed " + err);
              }
              else{
                console.log("initialSession succeed ");

                publishStream();
              }
            });
          } else {
            // The client does not support WebRTC.
            // You can display your own message.
            //OT.upgradeSystemRequirements();
            var browser=get_browser();

            var uiMsgHtml = "";
            if(browser.name == "Chrome" || browser.name == "Firefox"){
              uiMsgHtml = formatString(compmsg_en_too_old, {name:browser.name, version:browser.version});
            }
            else{
              uiMsgHtml = formatString(compmsg_en, {name:browser.name, version:browser.version});
            }

            $('#compmsg').append(uiMsgHtml);
            $('#compability').show();
            $('#videos').hide();
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



function newConnectionCreated(connection){
  console.log("new connection created")
  connections[connection.connectionId] = {'conObj':connection, 'status': st_connected};
  var connData = JSON.parse(connection.data);
  // if(!isTeacherPage && connData.role != 'teacher'){
  //   return;
  // }
  var dispName = connData.username;
  if(connData.role == 'teacher'){
    dispName = dispName +"(T)";
  }
  var uiHtml = formatString(connHtml, {id:connection.connectionId, name:dispName});
  $('#connections').append(uiHtml);
  if(connData.role != 'teacher'){
    if(isTeacherPage){ //Only teacher can send remote command
      $('#' + connection.connectionId +'-camlight').click(evtSendCmdRemote);
    }
    else
    {

    }
  }
  else{
    $('#' + connection.connectionId +'-camlight').click(evtCallForHelp)
  }
  
  updateUIStatus(connection.connectionId);
}

function connectionDestroyed(connection){
  delete connections[connection.connectionId];
  $( "#"+connection.connectionId ).remove();
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
    console.log("one stream is created")
    var connId = event.stream.connection.connectionId;
    var conn = connections[connId]['conObj'];
    var connData = JSON.parse(conn.data);
    connections[connId]['status'] = st_published;
    // if(!isTeacherPage && connData.role != 'teacher'){
    //   return;
    // }

    session.subscribe(event.stream, connId + '-video', {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    });
    
    updateUIStatus(connId);
    $("#" + connId + '-video').addClass('camvideo');
  });

  session.on("streamDestroyed", function(event) {
      console.log("Stream " + event.stream.name + " ended. " + event.reason);
      var connId = event.stream.connection.connectionId;
      connections[connId]['status'] = st_inited;
      var conn = connections[connId]['conObj'];
      var connData = JSON.parse(conn.data);
      // if(!isTeacherPage && connData.role != 'teacher'){
      //       return;
      //     }      
      updateUIStatus(connId);
      $("#" + connId + '-video').removeClass('camvideo');
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
  
  session.on("signal:cmd", function(event) {
      console.log("Signal sent from connection " + event.from.id);
      if( event.from.id == session.connection.connectionId){
        console.log("ignore signal from myself");
        return;
      }
      connection = connections[event.from.id]['conObj'];
      var from = JSON.parse(connection.data).username;
      console.log("Signal is " + event.data + "  from " + from);
      executeCmd(event.data, connection);
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
      var nameOnCam = name;
      if(isTeacherPage){
        nameOnCam = name+"("+"teacher" + ")";
      }
      publisher = OT.initPublisher(
      'publisher', 
      {
        insertMode: 'append',
        width: '100%',
        height: '100%',
        "name": name,
        style: { nameDisplayMode: "on", buttonDisplayMode: 'on' }
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
          sendCmdToAll(cmd_inited);
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


function _sendCmd(connection, text, cb){
  console.log("send command " + connection.connectionId + "  " + text)
  session.signal(
  {
    to: connection['conObj'],
    data:text,
    type:"cmd"
  },
  function(error) {
    if (error) {
      console.log("signal error ("
                   + error.code
                   + "): " + error.message);
      if(cb != null){
        cb(error);
      }
    } else {
      console.log("signal sent.");
      if(cb != null){
        cb(null);
      }
    }
  }
);
}

function _sendCmdToAll(text, cb){

  session.signal(
  {
    data:text,
    type:"cmd"
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

function sendCmdToAll(text){
  console.log("sending command " + text )
  async.series([
        initializeSession,
        function(cb){
          _sendCmdToAll(text, cb);
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

function uiSendCmd(){
   var text = $('#mytext').val();
   sendCmdToAll(text);
}

function uiDisplayMessage(msg){
  $('#messagebox').show();
  var uiHtml = formatString(msgHtml, {"msg":msg});
  $('#messagebox').append(uiHtml);
  //$('#messagebox').text( msg );
  incHeight("messagebox", 20)
}
var st_unconnected = "unconnected";
var st_connected = "connected";
var st_pub_local = "pub_local";
var st_pub_remote = "pub_remote";

function updateUIStatus(id){
  uiChangeStatus(id + "-camlight", connections[id].status, connections[id].callstatus)
}

function uiChangeStatus(id, status, callstatus){
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
      //$(uiid).fadeIn(1000).fadeOut(1000).fadeIn(1000).fadeOut(1000).fadeIn(1000);
    break;
    case st_published:
      $(uiid).css('color', '#FF4500');
      //$(uiid).addClass('flashbtn')
    break;
    break;
  }
  if(callstatus == st_calling){
    $(uiid).addClass('flashbtn');
  }
  else{
    $(uiid).removeClass('flashbtn');
  }
}

function getConnectionStatus(connection){

}

function executeCmd(cmd, fromConn){
  var id = fromConn.connectionId;
  switch(cmd){
    case cmd_publish:
      publishStream();
    break;
    case cmd_unpublish:
      _unPublish(null);
    break;
    case cmd_inited:
      
      connections[id].status = st_inited;
      updateUIStatus(id);
    break;
    case cmd_callhelp:
      connections[id].callstatus = st_calling;
      updateUIStatus(id);
    break;
    case cmd_callcancel:
      connections[id].callstatus = st_notcalling;
      updateUIStatus(id);
    break;
  }
  
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
  
function evtCallForHelp(event){
  var uiid = event.target.id;
  //we are from id-camlight, get the id from it.
  var id = uiid.replace('-camlight', '');
  conn = connections[id];
  if(conn.callstatus == st_calling){
    _sendCmd(conn, cmd_callcancel);
    conn['callstatus'] = st_notcalling;
  }
  else{
    conn['callstatus'] = st_calling;
    _sendCmd(conn, cmd_callhelp);
  }
  updateUIStatus(id);
}

function evtSendCmdRemote(event){
  var uiid = event.target.id;
  //we are from id-camlight, get the id from it.
  var id = uiid.replace('-camlight', '');
  conn = connections[id];
  if(conn.callstatus== st_calling){
    if( conn.status != st_published){
      _sendCmd(conn, cmd_publish);

    }
    _sendCmd(conn, cmd_callcancel);
    conn.callstatus = st_notcalling;
    updateUIStatus(id);

  }
  else{
    switch (conn.status ){
      case st_unconnected:
        console.log("evtSendCmdRemote " + st_unconnected)
      break;
      case st_connected:
        _sendCmd(conn, cmd_publish)
      break;
      case st_inited:
        _sendCmd(conn, cmd_publish)
      break;
      case st_published:
        _sendCmd(conn, cmd_unpublish)
      break;
    }

  }
}

function incHeight(id, delta) {
    var el = document.getElementById(id);
    var height = el.offsetHeight;
    var newHeight = height + delta;
    el.style.height = newHeight + 'px';
}