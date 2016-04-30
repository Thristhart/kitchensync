<lobbyList>
     <ul>
          <li each={lobbies}><a href="#/sync/{id}">{id}</a></li>
     </ul>
     <script>
          const socket = this.opts.socket;
          
          this.on('update', () => {
               if(this.opts.if) {
                    this.getLobbies();
               }
          });
          socket.on('lobbies', lobbies => {
               console.log("got lobbies");
               this.lobbies = lobbies;
               this.update();
               this.lastListTime = null;
          });
          
          this.getLobbies = function() {
               if(!socket.connected || this.lastListTime && Date.now() - this.lastListTime < 3000) {
                    return;
               }
               this.lastListTime =  Date.now();
               console.log("get lobbies");
               console.log(socket.connected);
               socket.emit('getLobbies');
          }
     </script>
</lobbyList>