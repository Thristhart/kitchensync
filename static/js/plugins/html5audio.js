var HTML5AudioFaucet = {id: "html5audio"};

Faucets["html5audio"] = HTML5AudioFaucet;

HTML5AudioFaucet.log = debug("html5audiofaucet");
HTML5AudioFaucet.buildPlayer = function(container) {
  HTML5AudioFaucet.container = container;
  HTML5AudioFaucet.log("Building player");
  SyncBase.faucetReady();
  HTML5AudioFaucet.ready = true;
}

HTML5AudioFaucet.seek = function(data) {
  this.log("Seeking to %d", data);
  HTML5AudioFaucet.seeking = true;
  this.player.currentTime = data;
}
HTML5AudioFaucet.load = function(data) {
  this.log("Loading media: %j", data);
  this.createPlayer(data.id, data.time);
  this.shouldBePaused = data.paused;
  HTML5AudioFaucet.lastTime = data.time;
}
HTML5AudioFaucet.pause = function() {
  this.shouldBePaused = true;
  this.player.pause();
}
HTML5AudioFaucet.play = function() {
  this.shouldBePaused = false;
  this.player.play();
}

HTML5AudioFaucet.getMediaUrl = function() {
  return HTML5AudioFaucet.mediaUrl;
}

HTML5AudioFaucet.createPlayer = function(id, startTime) {
  HTML5AudioFaucet.log("Creating player for media %o", id);
  var extension_parts = id.split(".");
  var extension = extension_parts[extension_parts.length - 1];
  var audioElem;
  var playerAlreadyExisted = false;
  if(HTML5AudioFaucet.player) {
    while(HTML5AudioFaucet.player.lastChild) {
      HTML5AudioFaucet.player.removeChild(HTML5AudioFaucet.player.lastChild);
    }
    audioElem = HTML5AudioFaucet.player;
    playerAlreadyExisted = true;
  }
  else {
    audioElem = document.createElement("audio");
    HTML5AudioFaucet.container.appendChild(audioElem);
    HTML5AudioFaucet.player = audioElem;
  }
  audioElem.src = id;
  HTML5AudioFaucet.mediaUrl = id;
  HTML5AudioFaucet.player.controls = true;
  if(!HTML5AudioFaucet.shouldBePaused)
    HTML5AudioFaucet.player.play();
  HTML5AudioFaucet.player.volume = SyncBase.getVolume();

  if(!playerAlreadyExisted) {
    HTML5AudioFaucet.player.addEventListener("seeked", function() {
      HTML5AudioFaucet.log("Seeked. expected: %s", HTML5AudioFaucet.seeking);
      if(HTML5AudioFaucet.seeking)
        return HTML5AudioFaucet.seeking = false;
      if(HTML5AudioFaucet.host) {
        SyncBase.seekTo(HTML5AudioFaucet.player.currentTime);
      }
      else { // we weren't told to go anywhere.. a cry for help?
        SyncBase.poke();
      }
    });
    HTML5AudioFaucet.player.addEventListener("play", function() {
      if(HTML5AudioFaucet.shouldBePaused) {
        if(HTML5AudioFaucet.host) {
          SyncBase.play();
        }
        else {
          SyncBase.poke();
        }
      }
    });
    HTML5AudioFaucet.player.addEventListener("pause", function() {
      if(!HTML5AudioFaucet.shouldBePaused) {
        if(HTML5AudioFaucet.host) {
          SyncBase.pause(HTML5AudioFaucet.player.currentTime);
        }
        else {
          SyncBase.poke();
        }
      }
    });

    HTML5AudioFaucet.player.addEventListener("ended", function() {
      if(HTML5AudioFaucet.host)
        SyncBase.contentEnded();
    });

    HTML5AudioFaucet.player.addEventListener("loadedmetadata", function() {
      HTML5AudioFaucet.seek(startTime);
      SyncBase.poke();
    });
  }
  SyncBase.faucetContentLoaded();
}
HTML5AudioFaucet.unBuild = function() {
  if(HTML5AudioFaucet.player) {
    HTML5AudioFaucet.player.pause();
  }
  var container = HTML5AudioFaucet.container;

  var parent = container.parentElement;
  if(parent)
    parent.removeChild(container);
}
