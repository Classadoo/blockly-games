/*
 *  <script src="../build/recorder.min.js"></script>
 *  Opus.start()
 *  Opus.stop()
 *
*/


CHUNK_LENGTH_MS = 3000;

var addSpeakerIcon = function(name)
{
  // Add the speaker icon.
  if ($("#talking-" + name).length === 0)
  {
    $("#whos_talking").append('<span class="talking" id="talking-' + name + '">' + name + '</span>');
  }
}
var removeSpeakerIcon = function(name)
{
  $("#talking-" + name).remove();
}

var Player = function(user_ref, peer_name)
{
  var audio = $('<audio></audio>');
  $("body").append(audio);

  var streams = [];
  var stream = function(continued_message, is_end)
  {
    if (streams.length)
    {
      // Wait for playing audio to finish.
      if (!continued_message && $(".talking").length > 0)
      {
        setTimeout(function(){stream(continued_message, is_end), 200});
        return;
      }
      addSpeakerIcon(peer_name);

      var dataBlob = new Blob(streams, { type: 'audio/ogg' });
      var url = URL.createObjectURL(dataBlob);
      
      var playhead = continued_message ? audio[0].currentTime : 0;
      audio.attr('src', url);

      audio[0].currentTime = playhead;
      audio[0].play();
      if (is_end)
      {
        streams = [];
      }
    }
  }
  
  audio.on("ended",function() {
    removeSpeakerIcon(peer_name);
  });
  audio.on("error",function() {
    removeSpeakerIcon(peer_name);
  });
  
  var continued_message = false;
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

      stream(continued_message, snapshot.val().end);
      continued_message = !snapshot.val().end;
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
      addSpeakerIcon("ME");
      recorder.start();
      var already_talking = $("audio");
      already_talking.each(function(i, el)
      {
        if (!el.paused)
        {
          el.pause();
          $(el).addClass("paused");
        }
      })    
    }
  }

  var stop_streaming = function()
  {
    // Delay here. For some reason, the end of the recording is usually chopped off.
    stop_timeout = setTimeout( function()
    {
      removeSpeakerIcon("ME");
      streaming = false;
      recorder.stop();
      var were_talking = $(".paused");
      were_talking.each(function(i, el)
      {
        el.play();
        $(el).removeClass("paused");
      })
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

