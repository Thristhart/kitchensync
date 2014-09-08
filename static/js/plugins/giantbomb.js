var GiantBombFaucet = {id: "giantbomb"};

Faucets["giantbomb"] = GiantBombFaucet;

GiantBombFaucet.log = debug("giantbombfaucet");
GiantBombFaucet.buildPlayer = function(container) {
  GiantBombFaucet.container = container;
  GiantBombFaucet.log("Building player");
  SyncBase.faucetReady();
  GiantBombFaucet.ready = true;
}

GiantBombFaucet.seek = function(data) {
  this.log("Seeking to %d", data);
  GiantBombFaucet.seeking = true;
  this.player.currentTime = data;
}
GiantBombFaucet.load = function(data) {
  this.log("Loading media: %j", data);
  this.createPlayer(data.id, data.time);
  this.shouldBePaused = data.paused;
  GiantBombFaucet.lastTime = data.time;
}
GiantBombFaucet.pause = function() {
  this.shouldBePaused = true;
  this.player.pause();
}
GiantBombFaucet.play = function() {
  this.shouldBePaused = false;
  this.player.play();
}

GiantBombFaucet.getMediaUrl = function() {
  return GiantBombFaucet.mediaUrl;
}

GiantBombFaucet.createPlayer = function(id, startTime) {
  GiantBombFaucet.log("Creating player for media %o", id);
  var extension_parts = id.split(".");
  var extension = extension_parts[extension_parts.length - 1];
  switch(extension) {
    case "mp4":
      var videoElem;
      if(GiantBombFaucet.player && GiantBombFaucet.player.tagName == "VIDEO") {
        while(GiantBombFaucet.player.lastChild) {
          GiantBombFaucet.player.removeChild(GiantBombFaucet.player.lastChild);
        }
        videoElem = GiantBombFaucet.player;
      }
      else {
        videoElem = document.createElement("video");
        GiantBombFaucet.container.appendChild(videoElem);
        GiantBombFaucet.player = videoElem;
      }
      videoElem.src = id;
      break;
    case "mp3":
      var audioElem;
      if(GiantBombFaucet.player && GiantBombFaucet.player.tagName == "AUDIO") {
        while(GiantBombFaucet.player.lastChild) {
          GiantBombFaucet.player.removeChild(GiantBombFaucet.player.lastChild);
        }
        audioElem = GiantBombFaucet.player;
      }
      else {
        audioElem = document.createElement("audio");
        GiantBombFaucet.container.appendChild(audioElem);
        GiantBombFaucet.player = audioElem;
      }
      audioElem.src = id;
      break;
  }
  if(GiantBombFaucet.player) {
    GiantBombFaucet.mediaUrl = id;
    GiantBombFaucet.player.controls = true;
    if(!GiantBombFaucet.shouldBePaused)
      GiantBombFaucet.player.play();

    GiantBombFaucet.player.addEventListener("seeked", function() {
      GiantBombFaucet.log("Seeked. expected: %s", GiantBombFaucet.seeking);
      if(GiantBombFaucet.seeking)
        return GiantBombFaucet.seeking = false;
      if(GiantBombFaucet.host) {
        SyncBase.seekTo(GiantBombFaucet.player.currentTime);
      }
      else { // we weren't told to go anywhere.. a cry for help?
        SyncBase.poke();
      }
    });
    GiantBombFaucet.player.addEventListener("play", function() {
      if(GiantBombFaucet.shouldBePaused) {
        if(GiantBombFaucet.host) {
          SyncBase.play();
        }
        else {
          SyncBase.poke();
        }
      }
    });
    GiantBombFaucet.player.addEventListener("pause", function() {
      if(!GiantBombFaucet.shouldBePaused) {
        if(GiantBombFaucet.host) {
          SyncBase.pause(GiantBombFaucet.player.currentTime);
        }
        else {
          SyncBase.poke();
        }
      }
    });

    GiantBombFaucet.player.addEventListener("loadedmetadata", function() {
      GiantBombFaucet.seek(startTime);
      SyncBase.poke();
    });
  }
  SyncBase.faucetContentLoaded();
}
GiantBombFaucet.unBuild = function() {
  if(GiantBombFaucet.player) {
    GiantBombFaucet.player.pause();
  }
  var container = GiantBombFaucet.container;

  var parent = container.parentElement;
  parent.removeChild(container);
}
