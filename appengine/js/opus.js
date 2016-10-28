/*
 *  <script src="../build/recorder.min.js"></script>
 *  Recorder.recorder.start()
 *  Recorder.recorder.stop()
 *
*/


CHUNK_LENGTH_MS = 3000;
BUFFER_LENGTH_MS = 1000;

var Player = function(user_ref)
{
  var audio = document.createElement('audio');
  document.body.appendChild(audio);

  var streams = [];
  var play_streams = function()
  {
    if (streams.length)
    {
      var url = URL.createObjectURL(streams.shift());
      audio.src = url;
      audio.play();
    }
  }
  
  var end_of_message = true;
  audio.addEventListener("ended", function()
  {
      play_streams();
  });
  
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
      var dataBlob = new Blob( [u8], { type: 'audio/ogg' } );
      streams.push(dataBlob);

      //
      // Trigger play.
      //
      var beginning_of_message = end_of_message;
      end_of_message = snapshot.val().end;
      if (beginning_of_message)
      {
        var buffer = end_of_message ? 0 : BUFFER_LENGTH_MS;
        setTimeout(play_streams, buffer);
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
    leaveStreamOpen: true
  });


  var recording_loop = null;
  var streaming;
  var start_streaming = function()
  {
    streaming = true;
    recorder.start();
    recording_loop = setTimeout(function(){
      recorder.stop();
    }, CHUNK_LENGTH_MS);
  }

  var stop_streaming = function()
  {
    // Delay here. For some reason, the end of the recording is usually chopped off.
    setTimeout( function()
    {
      clearTimeout(recording_loop);
      recording_loop = null;
      recorder.stop();
    }, 400);
  }
  
  self.enableStream = function(enable)
  {
    console.log(enable);
    if (enable)
    {
      if (!recording_loop)
      {
        start_streaming();
      }
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

  recorder.addEventListener("dataAvailable", function(e){
    var b64encoded = btoa(String.fromCharCode.apply(null, e.detail));
    var end = true;
    console.log(b64encoded);
    if (recording_loop)
    {
      end = false;
      start_streaming();
    }
    wilddog_ref.child(username).set({end : end, audio : b64encoded});
  });

  recorder.initStream();

  wilddog_ref.on("child_added", function(snapshot)
  {
    var peer_name = snapshot.key();
    if (peer_name != username)
    {
      console.log(peer_name, username);
       new Player(wilddog_ref.child(peer_name))
     }
  });
};

