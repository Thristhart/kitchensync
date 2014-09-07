var Faucets = {};
var log = debug("kitchensync:base");

var SyncBase = {};

SyncBase.setFaucet = function(faucetId) {
  if(SyncBase.faucet) {
    if(SyncBase.faucet.id == faucetId)
      return; // nothing for us to do here
    // we need to get rid of the old faucet
    SyncBase.faucet.unBuild();
  }
  var script = document.createElement("script");
  script.src = "/kitchen/asset/js/plugins/" + faucetId + ".js";

  var style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "/kitchen/asset/css/plugins/" + faucetId + ".css";
  
  document.body.appendChild(script);
  document.head.appendChild(style);
  script.addEventListener("load", function() {
    var container = document.createElement("div");
    container.className = "faucetContainer";
    document.getElementById("player").appendChild(container);

    SyncBase.faucet = Faucets[faucetId];
    SyncBase.faucet.buildPlayer(container);
    log("Loaded new faucet %s", faucetId);
  });
}

SyncBase.connect = function(id) {
  var socket = io("/lobby/" + id, {path: '/kitchen/socket'});
  socket.on('seek', function(data) {
    log("seek to time: %d", data)
    SyncBase.faucet.seek(data);
  });
  socket.on('load', function(data) {
    log("Load content: %j", data);
    SyncBase.faucet.load(data);
  });
  socket.on('pause', function() {
    log("Pause faucet");
    SyncBase.faucet.pause();
  });
  socket.on('play', function() {
    log("Play faucet");
    SyncBase.faucet.play();
  });
  socket.on('setFaucet', function(data) {
    log("Setting socket to: %s", data);
    SyncBase.setFaucet(data);
  });
  socket.on('host', function(data) {
    log("Are we the host? %s", data);
    SyncBase.faucet.host = data;
    if(SyncBase.faucet.host) {
      hostControls.style.display = "block";
    }
    else {
      hostControls.style.display = "none";
    }
  });


  SyncBase.socket = socket;
  SyncBase.lobbyId = id;
}

SyncBase.faucetReady = function() {
  this.socket.emit("faucet ready");
}
SyncBase.poke = function() {
  this.socket.emit("poke");
}

SyncBase.play = function() {
  this.socket.emit("play");
}
SyncBase.pause = function(pausedAt) {
  this.socket.emit("pause", pausedAt);
}
SyncBase.changeMedia = function(newMediaData) {
  this.socket.emit('changeMedia', newMediaData);
}
SyncBase.contentEnded = function() {
  this.socket.emit("ended");
}
SyncBase.seekTo = function(time) {
  this.socket.emit("setseek", time);
}
SyncBase.faucetContentLoaded = function() {
  var sourceDisplay = document.getElementById("sourceDisplay");
  var url = SyncBase.faucet.getMediaUrl();
  sourceDisplay.href = url;
}

var hostControls = document.getElementById("hostControls");

hostControls.onsubmit = function(event) {
  var data = {};
  data.faucet = hostControls.elements.faucet.value;
  switch(data.faucet) {
    case "youtube":
      data.contentId = getYouTubeID(hostControls.elements.contentId.value);
      log("Parsing youtube URL for submission: %s => %s", hostControls.elements.contentId.value, data.contentId)
      break;
    case "mediacrush":
      data.contentId = hostControls.elements.contentId.value;
      break;
  }
  SyncBase.changeMedia(data);
  return false;
};
