var YoutubeFaucet = {id: "youtube"};

Faucets["youtube"] = YoutubeFaucet;

YoutubeFaucet.log = debug("youtubefaucet");
YoutubeFaucet.buildPlayer = function(container) {
  YoutubeFaucet.container = container;
  YoutubeFaucet.log("Building player");

  if(typeof(YT) === "undefined") {
    var ytLoader = document.createElement("script");
    ytLoader.src = "http://www.youtube.com/iframe_api";
    document.body.appendChild(ytLoader);
    ytLoader.onload = function() {
      YT.ready(YoutubeFaucet.onYTAPIReady);
    }
  }
  else {
    YT.ready(YoutubeFaucet.onYTAPIReady);
  }
}

YoutubeFaucet.seek = function(data) {
  this.log("Seeking to %d", data);
  this.player.seekTo(data, true);
}
YoutubeFaucet.load = function(data) {
  this.log("Loading media: %j", data);
  var target = {videoId: data.id, startSeconds: data.time}
  if(YoutubeFaucet.ignoreNextMediaChange) {
    YoutubeFaucet.ignoreNextMediaChange = false;
    return;
  }
  this.player.loadVideoById(target);
  if(data.paused)
    this.shouldBePaused = true;
  YoutubeFaucet.lastTime = target.startSeconds || 0;
}
YoutubeFaucet.pause = function() {
  this.player.pauseVideo();
  this.shouldBePaused = true;
}
YoutubeFaucet.play = function() {
  this.player.playVideo();
  this.shouldBePaused = false;
}

YoutubeFaucet.getMediaUrl = function() {
  return YoutubeFaucet.player.getVideoUrl();
}

YoutubeFaucet.onPlayerReady = function(event) {
  YoutubeFaucet.log("PlayerReady event");
  SyncBase.faucetReady();
  YoutubeFaucet.ready = true;
  YoutubeFaucet.firstLoad = true;
  YoutubeFaucet.updateInterval = setInterval(function() {
    YoutubeFaucet.update();
  }, 100);
}
YoutubeFaucet.update = function() {
  var time = this.player.getCurrentTime();
  if(!document.hidden && Math.abs(time - this.lastTime) > 1.5) {
    this.log("Noticed time disparity, seeking from %f to %f", this.lastTime, time);
    if(this.host) {
      SyncBase.seekTo(time);
    }
    else { // we weren't told to go anywhere.. a cry for help?
      SyncBase.poke();
    }
  }
  this.lastTime = time;
}
YoutubeFaucet.onPlayerStateChange = function(event) {
  switch(event.data) {
    case YT.PlayerState.ENDED:
      YoutubeFaucet.log("PlayerState is ENDED");
      SyncBase.contentEnded();
      YoutubeFaucet.wasEnded = true;
      break;
    case YT.PlayerState.PLAYING:
      YoutubeFaucet.log("PlayerState is PLAYING");
      if(YoutubeFaucet.wasBuffering) {
        if(YoutubeFaucet.shouldBePaused) {
          YoutubeFaucet.log("was buffering and shouldBePaused, pausing");
          YoutubeFaucet.player.pauseVideo();
        }
        if(YoutubeFaucet.wasEnded) {
          YoutubeFaucet.log("Detected video change, pushing change");
          SyncBase.changeMedia({"contentId": YoutubeFaucet.player.getVideoData().video_id, faucet: "youtube"});
          YoutubeFaucet.ignoreNextMediaChange = true; // skip next load because we just did it
        }
        YoutubeFaucet.wasBuffering = false;
      }
      else if(YoutubeFaucet.host)
        SyncBase.play();
      else if(YoutubeFaucet.shouldBePaused) {
        // we haven't been told to play.. a cry for help?
        SyncBase.poke();
      }
      YoutubeFaucet.wasEnded = false;
      break;
    case YT.PlayerState.PAUSED:
      YoutubeFaucet.log("PlayerState is PAUSED");
      if(YoutubeFaucet.host)
        SyncBase.pause(YoutubeFaucet.player.getCurrentTime());
      else if(!YoutubeFaucet.shouldBePaused) {
        // we haven't been told to pause.. a cry for help?
        SyncBase.poke();
      }
      break;
    case YT.PlayerState.BUFFERING:
      YoutubeFaucet.log("PlayerState is BUFFERING");
      YoutubeFaucet.wasBuffering = true;
      SyncBase.faucetContentLoaded();
      break;
    case YT.PlayerState.CUED:
      YoutubeFaucet.log("PlayerState is CUED");
      break;
  }
}
YoutubeFaucet.onYTAPIReady = function() {
  YoutubeFaucet.player = new YT.Player(YoutubeFaucet.container, {
    height: '480',
    width: '640',
    playerVars: {
    },
    events: {
      'onReady': YoutubeFaucet.onPlayerReady,
      'onStateChange': YoutubeFaucet.onPlayerStateChange
    }
  });
}
YoutubeFaucet.unBuild = function() {
  YoutubeFaucet.player.stopVideo();
 
  var container = YoutubeFaucet.player.getIframe();

  var parent = container.parentElement;
  parent.removeChild(container);
  
  clearInterval(YoutubeFaucet.updateInterval);
}
