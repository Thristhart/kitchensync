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
};

SyncBase.connect = function(id) {
  var socket = io("/lobby/" + id, {path: '/kitchen/socket'});
  
  socket.on('connect', function() {
    log("connect");
    
    socket.on('seek', function(data) {
      log("seek to time: %d", data);
      SyncBase.faucet.seek(data);
    });
    socket.on('load', function(data) {
      if(SyncBase.faucet.player && typeof(SyncBase.faucet.player.volume) != "undefined") {
        localStorage.kitchenSyncVolume = SyncBase.faucet.player.volume;
      }
      log("Load content: %j", data);
      SyncBase.faucet.load(data);
    });
    socket.on('ident', function() {
      var name = localStorage.nickname;
      if(!name) {
        name = "anon" + Math.floor(Math.random() * 10000);
      }
      socket.emit('ident', name);
      SyncBase.displayMessage("Using nickname " + name + " - /nick MyNewNick to change");
      localStorage.nickname = name;
      nickname.innerHTML = localStorage.nickname;
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
    socket.on('updateQueue', function(data) {
      var queue = document.getElementById("queueList");
      queue.innerHTML = ""; // clear the insides

      for(var i = 0; i < data.length; i++) {
        log("Queue item: %o", data[i]);
        var listElem = document.createElement("li");
        listElem.className = data[i].faucet + "queue";
        listElem.innerHTML = "<img src='/kitchen/asset/images/" + data[i].faucet + "queueIcon.svg\' />";
        listElem.title = data[i].contentId;
        queue.appendChild(listElem);
      }
    });
    socket.on('host', function(data) {
      log("Are we the host? %s", data);
      SyncBase.faucet.host = data;
      if(SyncBase.faucet.host) {
        document.body.className = "as_host";
        SyncBase.setTitleString("Kitchen Sync: Hosting " + SyncBase.lobbyId);
        SyncBase.displayMessage("You are the host!");
      }
      else {
        document.body.className = "";
        SyncBase.setTitleString("Kitchen Sync: Watching " + SyncBase.lobbyId);
      }
    });
    socket.on('message', function(msg) {
      log("Message: %j", msg);
      if(msg.sender)
        SyncBase.displayMessage("<span class='from'>" + msg.sender + "</span> " + "<span class='message'>" + msg.message + "</span>");
      else
        SyncBase.displayMessage("<span class='message'>" + msg.message + "</span><br />");
    });
    socket.on('badnick', function() {
      SyncBase.displayMessage("Invalid nick name!");
    });
    socket.on('userlist', function(msg) {
      SyncBase.rebuildUserList(msg);
    });
  });

  SyncBase.socket = socket;
  SyncBase.lobbyId = id;
};

SyncBase.faucetReady = function() {
  this.socket.emit("faucet ready");
};
SyncBase.setTitleString = function(newTitle) {
  document.getElementById("title").innerHTML = newTitle;
};
SyncBase.poke = function() {
  this.socket.emit("poke");
};
SyncBase.displayMessage = function(message) {
  var chatlog = document.getElementById("chatlog");
  var message_elem = document.createElement("span");
  message_elem.className = "logMessage";
  message_elem.innerHTML = message;
  chatlog.appendChild(message_elem);
  if(chatlog.scrollHeight - chatlog.offsetHeight - 100 < chatlog.scrollTop) {
    chatlog.scrollTop = chatlog.scrollHeight;
  }
};
SyncBase.play = function() {
  this.socket.emit("play");
};
SyncBase.pause = function(pausedAt) {
  this.socket.emit("pause", pausedAt);
};
SyncBase.changeMedia = function(newMediaData) {
  this.socket.emit('changeMedia', newMediaData);
};
SyncBase.contentEnded = function() {
  this.socket.emit("ended");
};
SyncBase.addToQueue = function(newQueue) {
  this.socket.emit("addToQueue", newQueue);
};
SyncBase.skip = function() {
  this.socket.emit("nextInQueue");
};
SyncBase.seekTo = function(time) {
  this.socket.emit("setseek", time);
};
SyncBase.detectUrlPlugin = function(url) {
  this.socket.emit("detect plugin by url", url);
};
// faucets must ONLY call this once per media, and only once the faucet is 100% loaded and ready to play
SyncBase.faucetContentLoaded = function() {
  var sourceDisplay = document.getElementById("sourceDisplay");
  var url = SyncBase.faucet.getMediaUrl();
  sourceDisplay.href = url;

  SyncBase.poke(); // This is risky... if a faucet doesn't obey the once-per-media rule, this will cause problems
};
SyncBase.filesDragged = function(files) {
  if(files.length === 0 || !SyncBase.faucet.host) {
    log("Couldn't upload dragged file because no file or not host");
    return;
  }
  log("Uploading file to mediacrush");
  document.documentElement.className = "uploading";
  MediaCrush.upload(files[0], function(media) {
    media.wait(function() { // waiting for processing to finish
      document.documentElement.className = "";
      SyncBase.linkDragged(media.url);
    });
  });
};
SyncBase.linkDragged = function(link) {
  if(SyncBase.faucet.host) {
    log("Drag-drop of link by host: %o", link);
    SyncBase.detectUrlPlugin(link);
  }
};
SyncBase.getVolume = function() {
  return localStorage.kitchenSyncVolume || 1;
};
SyncBase.sendChatMessage = function(message) {
  if(message.length > 0) {
    var parts = message.split(" ");
    if(parts[0] == "/nick" && parts[1].length > 0) {
      SyncBase.socket.emit("nick", parts[1]);
      localStorage.nickname = parts[1];
    }
    else {
      SyncBase.socket.emit("say", message);
    }
  }
};
SyncBase.promote = function(nick) {
  SyncBase.socket.emit("promote", nick);
};
SyncBase.rebuildUserList = function(userlist) {
  var listElement = document.getElementById("memberList");
  listElement.innerHTML = ""; // clear it
  function onUsernameClick(event) {
    var nick = event.target.innerHTML;
    if(confirm("Are you sure you want to promote " + nick + " to host?")) {
      SyncBase.promote(nick);
    }
  }

  for(var i = 0; i < userlist.length; i++) {
    var user = userlist[i];
    var itemElement = document.createElement("li");
    if(SyncBase.faucet && SyncBase.faucet.host && user.nick != localStorage.nickname) {
      var linkElement = document.createElement("a");
      linkElement.addEventListener("click", onUsernameClick);
      linkElement.innerHTML = user.nick;
      itemElement.appendChild(linkElement);
    }
    else {
      itemElement.innerHTML = user.nick;
    }
    if(user.host)
      itemElement.className = "host";
    listElement.appendChild(itemElement);
  }
  return listElement;
};

var hostControls = document.getElementById("hostControls");

hostControls.onsubmit = function(event) {
  var link = hostControls.elements.contentId.value;
  SyncBase.detectUrlPlugin(link);
  hostControls.elements.contentId.value = "";
  return false;
};

var chatInput = document.getElementById("chatInput");

chatInput.onsubmit = function(event) {
  var message = chatInput.elements.chatMessage.value;
  SyncBase.sendChatMessage(message);
  chatInput.elements.chatMessage.value = "";
  return false;
};

var nickname = document.getElementById("nickname");

nickname.addEventListener("click", function(event) {
  var parentElement = nickname.parentElement;
  var nicknameForm = document.createElement("form");
  var nicknameInput = document.createElement("input");
  nicknameForm.appendChild(nicknameInput);
  nicknameInput.value = nickname.innerHTML;
  nicknameInput.focus();
  var submitNewNick = function(formEvent) {
    nickname.innerHTML = nicknameInput.value;
    parentElement.insertBefore(nickname, nicknameForm);
    parentElement.removeChild(nicknameForm);
    SyncBase.sendChatMessage("/nick " + nicknameInput.value);
    formEvent.preventDefault();
    return false;
  };

  nicknameForm.addEventListener("submit", submitNewNick);
  nicknameForm.addEventListener("blur", submitNewNick);
  parentElement.insertBefore(nicknameForm, nickname);
  parentElement.removeChild(nickname);
  event.preventDefault();
  return false;
});

var queueControls = document.getElementById("queueControls");

queueControls.onsubmit = function(event) {
  var link = queueControls.elements.queueAddition.value;
  SyncBase.addToQueue(link);
  queueControls.elements.queueAddition.value = "";
  return false;
};

queueControls.elements.skip.addEventListener("click", function(event) {
  SyncBase.skip();
  return false;
});

// enable file drag-n-drop
document.documentElement.addEventListener("dragover", function(event) {
  if(SyncBase.faucet.host) {
    this.className = "dragHover";
    event.preventDefault();
    event.effectAllowed = "copy";
    event.dropEffect = "copy";
  }
  return false;
});
document.documentElement.addEventListener("dragend", function(event) {
  this.className = "";
  return false;
});
document.documentElement.addEventListener("drop", function(event) {
  this.className = "";

  event.preventDefault();
  log(event);
  var types = event.dataTransfer.types;
  for(var i = 0; i < types.length; i++) {
    if(types[i] == "text/uri-list") {
      SyncBase.linkDragged(event.dataTransfer.getData("URL"));
      break;
    }
  }

  if(event.dataTransfer.files.length > 0) {
    SyncBase.filesDragged(event.dataTransfer.files);
  }

  return false;
});
