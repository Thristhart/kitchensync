require('./faucet.tag');
<sync>
     <div if={leader}> I'm the leader!</div>
     <div if={!leader}> I'm not the leader.</div>
     <faucet></faucet>
     <script>
          this.on('update', () => {
               if(this.lobbyId !== this.opts.lobby_id) {
                    this.lobbyId = this.opts.lobby_id;
                    this.enter(this.lobbyId);
               }
               if(this.socket !== this.opts.socket) {
                    this.socket = this.opts.socket;
                    this.socket.on('promote', newLeaderId => {
                         if(this.socket.id === newLeaderId) {
                              this.leader = true;
                         }
                         this.update();
                    });
                    this.socket.on('demote', demotedLeaderId => {
                         if(this.socket.id === demotedLeaderId) {
                              this.leader = false;
                         }
                         this.update();
                    });
                    
                    this.socket.on('reconnect', () => {
                         this.enter(this.lobbyId);
                    });
                    
                    this.socket.on('faucet', data => {
                         let faucet = this.tags.faucet;
                         faucet.opts.tag = data.type;
                         faucet.opts.data = {
                              media_id: data.mediaId,
                              current_time: data.currentTime,
                              playing: data.playing
                         };
                         faucet.render();
                         
                         faucet.player.on("play", () => {
                              this.socket.emit("play");
                         });
                         faucet.player.on("pause", () => {
                              this.socket.emit("pause");
                         });
                         faucet.player.on("updateCurrentTime", time => {
                              this.socket.emit("updateCurrentTime", time, Date.now());
                         });
                         
                    });
                    this.socket.on('Ping', () => {
                         this.socket.emit('Pong');
                    });
                    this.socket.on('play', () => {
                         this.tags.faucet.player.play();
                    });
                    this.socket.on('pause', () => {
                         this.tags.faucet.player.pause();
                    });
                    this.socket.on('seek', time => {
                         let player = this.tags.faucet.player;
                         if(Math.abs(player.currentTime - time) > 0.3) { 
                              player.currentTime = time;
                         }
                    });
               }
          });
          
          this.on('mount', () => {
               requestAnimationFrame(this.animationFrame);
          });
          
          this.animationFrame = time => {
               if(!this.isMounted) {
                    return;
               }
               if(this.tags.faucet && this.tags.faucet.ready) {
               }
               requestAnimationFrame(this.animationFrame);
          };
          
          this.enter = function(id) {
               console.log("enter", id);
               this.socket.emit("enter", id);
          };
          
          
     </script>
</sync>