var MediaCrushFaucet = {id: "mediacrush"};

Faucets["mediacrush"] = MediaCrushFaucet;

MediaCrushFaucet.log = debug("mediacrushfaucet");
MediaCrushFaucet.buildPlayer = function(container) {
  MediaCrushFaucet.container = container;
  MediaCrushFaucet.log("Building player");

  if(typeof(MediaCrush) === "undefined") {
    var mcLoader = document.createElement("script");
    mcLoader.src = "https://mediacru.sh/static/mediacrush.js";
    document.body.appendChild(mcLoader);
    mcLoader.onload = function() {
      MediaCrushFaucet.onMediaCrushAPIReady();
    }
  }
  else {
    MediaCrushFaucet.onMediaCrushAPIReady();
  }
}

MediaCrushFaucet.seek = function(data) {
  this.log("Seeking to %d", data);
  MediaCrushFaucet.seeking = true;
  this.player.currentTime = data;
}
MediaCrushFaucet.load = function(data) {
  this.log("Loading media: %j", data);
  this.createPlayer(data.id, data.time);
  this.shouldBePaused = data.paused;
  MediaCrushFaucet.lastTime = data.time;
}
MediaCrushFaucet.pause = function() {
  this.shouldBePaused = true;
  this.player.pause();
}
MediaCrushFaucet.play = function() {
  this.shouldBePaused = false;
  this.player.play();
}

MediaCrushFaucet.getMediaUrl = function() {
  return MediaCrushFaucet.media.url;
}

MediaCrushFaucet.createPlayer = function(id, startTime) {
  MediaCrush.get(id, function(media) {
    MediaCrushFaucet.log("Creating player for media %o", media);
    MediaCrushFaucet.media = media;
    switch(media.blob_type) {
      case "video":
        var videoElem;
        if(MediaCrushFaucet.player && MediaCrushFaucet.player.tagName == "VIDEO") {
          while(MediaCrushFaucet.player.lastChild) {
            MediaCrushFaucet.player.removeChild(MediaCrushFaucet.player.lastChild);
          }
          videoElem = MediaCrushFaucet.player;
        }
        else {
          videoElem = document.createElement("video");
          MediaCrushFaucet.container.appendChild(videoElem);
          MediaCrushFaucet.player = videoElem;
        }
        for(var i = 0; i < media.files.length; i++) {
          var sourceElem = document.createElement("source");
          sourceElem.src = "https://mediacru.sh/" + media.files[i].file;
          sourceElem.type = media.files[i].type;
          videoElem.appendChild(sourceElem);
        }
        break;
      case "audio":
        var audioElem;
        if(MediaCrushFaucet.player && MediaCrushFaucet.player.tagName == "AUDIO") {
          while(MediaCrushFaucet.player.lastChild) {
            MediaCrushFaucet.player.removeChild(MediaCrushFaucet.player.lastChild);
          }
          audioElem = MediaCrushFaucet.player;
        }
        else {
          audioElem = document.createElement("audio");
          MediaCrushFaucet.container.appendChild(audioElem);
          MediaCrushFaucet.player = audioElem;
        }
        for(var i = 0; i < media.files.length; i++) {
          var sourceElem = document.createElement("source");
          sourceElem.src = "https://mediacru.sh/" + media.files[i].file;
          sourceElem.type = media.files[i].type;
          audioElem.appendChild(sourceElem);
        }
        break;
    }
    if(MediaCrushFaucet.player) {
      MediaCrushFaucet.player.controls = true;
      if(!MediaCrushFaucet.shouldBePaused)
        MediaCrushFaucet.player.play();

      MediaCrushFaucet.player.addEventListener("seeked", function() {
        MediaCrushFaucet.log("Seeked. expected: %s", MediaCrushFaucet.seeking);
        if(MediaCrushFaucet.seeking)
          return MediaCrushFaucet.seeking = false;
        if(MediaCrushFaucet.host) {
          SyncBase.seekTo(MediaCrushFaucet.player.currentTime);
        }
        else { // we weren't told to go anywhere.. a cry for help?
          SyncBase.poke();
        }
      });
      MediaCrushFaucet.player.addEventListener("play", function() {
        if(MediaCrushFaucet.shouldBePaused) {
          if(MediaCrushFaucet.host) {
            SyncBase.play();
          }
          else {
            SyncBase.poke();
          }
        }
      });
      MediaCrushFaucet.player.addEventListener("pause", function() {
        if(!MediaCrushFaucet.shouldBePaused) {
          if(MediaCrushFaucet.host) {
            SyncBase.pause(MediaCrushFaucet.player.currentTime);
          }
          else {
            SyncBase.poke();
          }
        }
      });

      MediaCrushFaucet.player.addEventListener("loadedmetadata", function() {
        MediaCrushFaucet.seek(startTime);
        SyncBase.poke();
      });
    }
    SyncBase.faucetContentLoaded();
  });
}
MediaCrushFaucet.onMediaCrushAPIReady = function() {
  MediaCrushFaucet.log("PlayerReady event");
  SyncBase.faucetReady();
  MediaCrushFaucet.ready = true;
}
MediaCrushFaucet.unBuild = function() {
  if(MediaCrushFaucet.player) {
    MediaCrushFaucet.player.pause();

  }
  var container = MediaCrushFaucet.container;

  var parent = container.parentElement;
  parent.removeChild(container);
}
