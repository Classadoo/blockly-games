// Copyright 2016 Classadoo
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview PUSH TO TALK
 * @author drewheine@gmail.com
 *
 * A wrapper that combines simple-peer.js, wilddog/firebase, and Push-to-talk
 * capability for WebRTC audio streaming.
 *
 * Requires simple-peer.js and wilddog.js version < 1.
 *
 * Example Usage:
 *
 *  var ptt = new pushToTalk("https://classadoo-prod.wilddogio.com", getUsername(), 10000);
 *  document.addEventListener("keydown", function(e) {
 *    if(e.keyCode == 13) {
 *      ptt.enableStream(true);
 *    }
 *  });
 *  document.addEventListener("keyup", function(e) {
 *    if(e.keyCode == 13) {
 *      ptt.enableStream(false);
 *    }
 * });
 *
 */


var RTC_HEARTBEAT_INTERVAL_MS = 2000;
var WATCHDOG_TIMEOUT = RTC_HEARTBEAT_INTERVAL_MS * 5;
var AUDIO_TIMEOUT = 10000;

// TODO(aheine): this is not actually a GUID at all.
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function addAudioToDom(stream)
{
  var a = new Audio();
  a.src = window.URL.createObjectURL(stream);
  document.body.appendChild(a);
  a.play();
}

//
// Class that uses wilddog to negotiate an arbitrary number of peer connections.
function pushToTalk(wilddog_base_url, username)
{
  var self = this;

  //
  // Setup basic connection info.
  //

  var my_id = guid();
  var peers_ref = new Wilddog(wilddog_base_url + "/peers");
  var peer_list = {};
  var stream_enabled = false;
  
  // Placeholder until we get the actual media stream.
  self.enableStream = function(enable)
  {
    stream_enabled = enable;
  }

  function gotMedia(stream)
  {

    //
    // Push-to-talk logic.
    //

    self.enableStream = function(enable)
    {
      stream_enabled = enable;
      for (var i = 0; i < stream.getTracks().length; i++)
      {
        stream.getTracks()[i].enabled = enable;
      }
    }
    self.enableStream(stream_enabled);

    //
    // Turn off audio if the user leaves for a long time.
    //

    if (AUDIO_TIMEOUT !== null)
    {
      var cancel_audio;
      window.onblur = function(e)
      {
        cancel_audio = setTimeout(function()
        {
          self.enableStream(false)
        }, AUDIO_TIMEOUT);
      };
      window.onfocus = function(e){ clearTimeout(cancel_audio); }
    }

    //
    // Listen for incoming RTC messages.
    // First, broadcast your existence with a null message.
    //

    var my_data = peers_ref.child(my_id);
    my_data.set({username: username});
    my_data.child("messages").on('child_added', function(snapshot)
    {
      var msg = snapshot.val();
      if (msg && peer_list[msg.sender])
      {
        peer_list[msg.sender].signal(msg.data);
      }
    });

    //
    // Connect to peers as they a-peer.
    //

    peers_ref.on('child_added', function(snapshot)
    {
      var peer_id = snapshot.key();
      if (peer_id == my_id)
      {
        return;
      }

      //
      // Clean up stale versions of ourselves.
      //

      if (snapshot.val().username == username)
      {
        peers_ref.child(peer_id).remove();
        return;
      }

      //
      // Setup the peer object.
      //

      var peer = new SimplePeer({ initiator: peer_id < my_id, stream: stream});
      var peer_messages = peers_ref.child(peer_id).child('messages');
      peer_list[peer_id] = peer;

      peer.on('signal', function (data) {
        peer_messages.push({sender: my_id, data : data});
      });

      peer.on('stream', function (stream) {
        addAudioToDom(stream);
        console.log("added audio stream for", peer_id);
      });

      //
      // Heartbeats
      //
      
      var last_heartbeat = Date.now();
      var watchdog = function()
      {
        var now = Date.now();
        if (now - last_heartbeat > WATCHDOG_TIMEOUT)
        {
          console.error("We lost a peer", peer_id);
        }
      }

      var watchdog_interval;
      peer.on('connect', function()
      {
        watchdog_interval = setInterval(function()
        {
          peer.send('beat');
          watchdog();
        }, RTC_HEARTBEAT_INTERVAL_MS);
      });
      
      peer.on('close', function()
      {
        clearInterval(watchdog_interval);
        delete peer_list.peer_id;
        console.warn("A peer disconnected", peer_id);
      });
      
      peer.on('data', function(data)
      {
        last_heartbeat = Date.now();
      });
      
      peer.on('error', function (err) 
      {
        console.error("We received some bad signals. TODO, handle this intelligently", peer_id);
      });
      
    });

  }

  function error(e)
  {
    console.log("Error getting stream", e);
  }
    
  // get video/voice stream
  navigator.mediaDevices.getUserMedia({ video: false, audio: {
          echoCancellation: true,
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          channelCount: 1
  } }).then(gotMedia).catch(error);
}
