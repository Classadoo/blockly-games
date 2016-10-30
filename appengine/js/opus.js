/*
 *  <script src="../build/recorder.min.js"></script>
 *  Recorder.recorder.start()
 *  Recorder.recorder.stop()
 *
*/


CHUNK_LENGTH_MS = 3000;

var Player = function(user_ref, peer_name)
{
  var audio = document.createElement('audio');
  document.body.appendChild(audio);

  var streams = [];
  var stream = function(reset_stream)
  {
    if (streams.length)
    {
      var dataBlob = new Blob( streams, { type: 'audio/ogg' } );
      var url = URL.createObjectURL(dataBlob);
      
      var pos = audio.currentTime;
      audio.src = url;
      if (!reset_stream)
      {
        audio.currentTime = pos;
      }

      audio.play();
    }
  }
  
  audio.addEventListener("ended",function() {
    $("#talking-" + peer_name).remove();
  });
  audio.addEventListener("error",function() {
    $("#talking-" + peer_name).remove();
  });
  
  var is_new_message = true;
  user_ref.on('value', function(snapshot)
  {
    if (snapshot.val())
    {
      //
      // Buffer the message.
      //
      var b64encoded = snapshot.val().audio;
      var u8 = new Uint8Array(atob(b64encoded).split("").map(function(c)
      {
        return c.charCodeAt(0);
      }));
      streams.push(u8);
      stream(is_new_message);
      if (is_new_message)
      {
        $("#whos_talking").append('<span id="talking-' + peer_name + '">' + peer_name + '</span>');
      }
      
      is_new_message = snapshot.val().end;
      if (is_new_message)
      {
        streams = [];
      }
    }
  })
}

var Opus = function(wilddog_ref, username){
  var self = this;

  var recorder = new Recorder({
    monitorGain: 0,
    numberOfChannels: 1,
    bitRate: 4000,
    encoderSampleRate: 8000,
    encoderPath: "../appengine/js/encoderWorker.min.js",
    leaveStreamOpen: true,
    streamPages: true,
    streamOptions : {
    optional: [],
    mandatory: {
      googEchoCancellation: true,
      googAutoGainControl: true,
      googNoiseSuppression: true,
      googHighpassFilter: true,
      googTypingNoiseDetection: true
    }
  }
  });

  var stop_timeout = null;
  var streaming;
  var last_send = Date.now();
  var start_streaming = function()
  {
    if (!streaming)
    {
      $("#whos_talking").append('<span id="talking-me">ME</span>');
      recorder.start();
    }
  }

  var stop_streaming = function()
  {
    // Delay here. For some reason, the end of the recording is usually chopped off.
    stop_timeout = setTimeout( function()
    {
      $("#talking-me").remove();
      streaming = false;
      recorder.stop();
    }, 500);
  }
  
  self.enableStream = function(enable)
  {
    if (enable)
    {
      clearTimeout(stop_timeout);
      start_streaming();
    }
    else 
    {
      stop_streaming()
    }
  }

  recorder.addEventListener("streamError", function(e){
    console.error('Error encountered: ' + e.error.name );
  });

  recorder.addEventListener("streamReady", function(e){
    console.log('Audio stream is ready.');
  });
  recorder.addEventListener("start", function(e){
    last_send = Date.now();
    streaming = true;
  });

  var pages = [];
  recorder.addEventListener("dataAvailable", function(e){
    pages.push(e.detail);

    //TODO(aheine): !streaming doesn't exactly tell me if it's ended, because this event takes time to fire...
    var end_of_stream = !streaming;
    var now = Date.now();
    if (end_of_stream || (now - last_send > CHUNK_LENGTH_MS))
    {
      len = pages.reduce(function(reducing, next){return reducing + next.length;}, 0);
      var flattened = new Uint8Array(len);
      pages.reduce(function(reducing, next){
        flattened.set(next, reducing);
        return reducing + next.length;
      }, 0);
      pages = [];
      var b64encoded = btoa(String.fromCharCode.apply(null, flattened));
      wilddog_ref.child(username).set({end : end_of_stream, audio : b64encoded});
      last_send = Date.now();
    }
  });

  recorder.initStream();

  wilddog_ref.on("child_added", function(snapshot)
  {
    var peer_name = snapshot.key();
    if (peer_name != username)
    {
       new Player(wilddog_ref.child(peer_name), peer_name)
    }
  });
};

