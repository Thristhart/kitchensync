var HTML5VideoFaucet = {id: "html5video"};

Faucets["html5video"] = HTML5VideoFaucet;

HTML5VideoFaucet.log = debug("html5videofaucet");
HTML5VideoFaucet.buildPlayer = function(container) {
  HTML5VideoFaucet.container = container;
  HTML5VideoFaucet.log("Building player");
  SyncBase.faucetReady();
  HTML5VideoFaucet.ready = true;
}

HTML5VideoFaucet.seek = function(data) {
  this.log("Seeking to %d", data);
  HTML5VideoFaucet.seeking = true;
  this.player.currentTime = data;
}
HTML5VideoFaucet.load = function(data) {
  this.log("Loading media: %j", data);
  this.createPlayer(data.id, data.time);
  this.shouldBePaused = data.paused;
  HTML5VideoFaucet.lastTime = data.time;
}
HTML5VideoFaucet.pause = function() {
  this.shouldBePaused = true;
  this.player.pause();
}
HTML5VideoFaucet.play = function() {
  this.shouldBePaused = false;
  this.player.play();
}

HTML5VideoFaucet.getMediaUrl = function() {
  return HTML5VideoFaucet.mediaUrl;
}

HTML5VideoFaucet.createPlayer = function(id, startTime) {
  HTML5VideoFaucet.log("Creating player for media %o", id);
  var extension_parts = id.split(".");
  var extension = extension_parts[extension_parts.length - 1];
  var videoElem;
  var playerAlreadyExisted = false;
  if(HTML5VideoFaucet.player) {
    while(HTML5VideoFaucet.player.lastChild) {
      HTML5VideoFaucet.player.removeChild(HTML5VideoFaucet.player.lastChild);
    }
    videoElem = HTML5VideoFaucet.player;
    playerAlreadyExisted = true;
  }
  else {
    videoElem = document.createElement("video");
    HTML5VideoFaucet.container.appendChild(videoElem);
    HTML5VideoFaucet.player = videoElem;
  }
  videoElem.src = id;
  HTML5VideoFaucet.mediaUrl = id;
  HTML5VideoFaucet.player.controls = true;
  if(!HTML5VideoFaucet.shouldBePaused)
    HTML5VideoFaucet.player.play();
  HTML5VideoFaucet.player.volume = SyncBase.getVolume();

  if(!playerAlreadyExisted) {
    HTML5VideoFaucet.player.addEventListener("seeked", function() {
      HTML5VideoFaucet.log("Seeked. expected: %s", HTML5VideoFaucet.seeking);
      if(HTML5VideoFaucet.seeking)
        return HTML5VideoFaucet.seeking = false;
      if(HTML5VideoFaucet.host) {
        SyncBase.seekTo(HTML5VideoFaucet.player.currentTime);
      }
      else { // we weren't told to go anywhere.. a cry for help?
        SyncBase.poke();
      }
    });
    HTML5VideoFaucet.player.addEventListener("play", function() {
      if(HTML5VideoFaucet.shouldBePaused) {
        if(HTML5VideoFaucet.host) {
          SyncBase.play();
        }
        else {
          SyncBase.poke();
        }
      }
    });
    HTML5VideoFaucet.player.addEventListener("pause", function() {
      if(!HTML5VideoFaucet.shouldBePaused) {
        if(HTML5VideoFaucet.host) {
          SyncBase.pause(HTML5VideoFaucet.player.currentTime);
        }
        else {
          SyncBase.poke();
        }
      }
    });
    HTML5VideoFaucet.player.addEventListener("ended", function() {
      if(HTML5VideoFaucet.host)
        SyncBase.contentEnded();
    });

    HTML5VideoFaucet.player.addEventListener("loadedmetadata", function() {
      HTML5VideoFaucet.seek(startTime);
      SyncBase.poke();
    });
  }
  SyncBase.faucetContentLoaded();
}
HTML5VideoFaucet.unBuild = function() {
  if(HTML5VideoFaucet.player) {
    HTML5VideoFaucet.player.pause();
  }
  var container = HTML5VideoFaucet.container;

  var parent = container.parentElement;
  if(parent)
    parent.removeChild(container);
}
