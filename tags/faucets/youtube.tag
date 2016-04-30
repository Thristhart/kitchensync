<youtube>
     <div class="player"></div>
     <script>
          this.on('mount', () => {
               const Youtube = require('youtube-iframe');
               Youtube.load(YT => {
                    this.YT = YT;
                    this.player = new YT.Player(this.root.querySelector(".player"), {
                       videoId: this.opts.media_id,
                       events: {
                            onReady: this.onYoutubeReady,
                            onStateChange: this.onYoutubeStateChange
                       },
                       playerVars: {
                            start: this.opts.current_time,
                            autoplay: true,
                       }
                    });
               });
          });
          
          this.onYoutubeReady = () => {
               console.log("Youtube ready");
               this.ready = true;
          };
          this.onYoutubeStateChange = (event) => {
               const state = event.data;
               console.log("Youtube state change", state);
               if(state === -1) {
                    console.log("unstarted");
                    console.log(this.player.getVideoData().video_id);
                    if(!this.opts.faucet.playing) {
                         this.pauseVideo();    
                    }
               }
               if(state === this.YT.PlayerState.PLAYING) {
                    this.trigger('play');
               }
               if(state === this.YT.PlayerState.PAUSED) {
                    this.trigger('pause');
               }
               this.trigger('updateCurrentTime', this.currentTime);
          };
          
          this.play = function() {
               this.player.playVideo();
          };
          this.pause = function() {
               this.player.pauseVideo();
          };
          
          Object.defineProperty(this, 'currentTime', {
               get: () => this.player.getCurrentTime(),
               set: time => this.player.seekTo(time, true)
          });
     </script>
</youtube>