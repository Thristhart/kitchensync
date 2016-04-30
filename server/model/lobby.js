"use strict";
let lobbies = [];
class Lobby {
     constructor(id) {
          this.id = id;
          
          this.sockets = [];
          this.leader = null;
          
          this.faucetState = {
               playing: false,
               currentTime: 0,
               type: "youtube",
               mediaId: "lTx3G6h2xyA"
          };
     }
     rebroadcastIfLeader(socket, event, andAlso) {
          socket.on(event, data => {
               if(socket === this.leader) {
                    this.room.emit(event, data);
                    console.log("emitting", event, data);
                    if(andAlso) {
                         andAlso(data);
                    }
               }
          });
     }
     addSocket(socket) {
          this.sockets.push(socket);
          
          socket.latency = 0;
          socket.ping = () => {
               socket.lastPing = process.hrtime();
               socket.emit('Ping');
          };
          socket.pingInterval = setInterval(socket.ping, 5000);
          socket.on('Pong', () => {
               // the difference is in milliseconds, but we need seconds
               socket.latency = process.hrtime(socket.lastPing)[1] / 1000000000.0;
          });
          
          socket.ping();
          
          socket.join(this.id);
          socket.on('disconnect', () => {
               console.log("Disconnect!");
               this.sockets.splice(this.sockets.indexOf(socket), 1);
               clearInterval(socket.pingInterval);
          });
          this.rebroadcastIfLeader(socket, 'play', () => {
               this.faucetState.playing = true;
          });
          this.rebroadcastIfLeader(socket, 'pause', () => {
               this.faucetState.playing = false;
          });
          this.rebroadcastIfLeader(socket, 'seek', time => {
               this.faucetState.currentTime = time;
          });
          
          socket.on('updateCurrentTime', (playerCurrentTime, localTime) => {
               if(socket === this.leader) {
                    this.faucetState.currentTime = playerCurrentTime;
                    if(this.faucetState.playing) {
                         this.faucetState.currentTime += socket.latency;
                    }
                    this.room.emit("seek", this.faucetState.currentTime);
               }
          })
          
          socket.emit('faucet', this.faucetState);
          
          if(!this.leader) {
               console.log("no leader");
               this.promote(socket);
          }
     }
     demote() {
          this.leader.emit('demote', this.leader.client.id);
          this.leader = null;
     }
     promote(socket) {
          console.log("Promoted!");
          this.room.emit('promote', socket.client.id);
          if(this.leader) {
               this.demote();
          }
          this.leader = socket;
          this.leader.once('disconnect', () => this.onLeaderDisconnect());
     }
     onLeaderDisconnect() {
          this.demote();
          console.log("disconnect");
          console.log(this.sockets.length);
          if(this.sockets.length > 0) {
               this.promote(this.sockets[0]);
          }
     }
     get room() {
          return Lobby.io.in(this.id);
     }
     static find(id) {
          return new Promise(resolve => {
               resolve(lobbies.find(lobby => lobby.id === id));
          });
     }
     static list(amount) {
          return new Promise(resolve => {
               resolve(lobbies.slice(0, amount));
          });
     }
     static create(id) {
          var lobby = new Lobby(id);
          lobbies.push(lobby);
          return lobby;
     }
     static listen(io) {
          this.io = io;
          io.on('connection', socket => {
               this.onConnection(socket)
          });
     }
     static onConnection(socket) {
          console.log(`Socket with ID ${socket.id} connected`);
          
          
          socket.on('enter', lobbyId => {
               console.log(`Socket with ID ${socket.id} entering ${lobbyId}`);
               Lobby.find(lobbyId).then(lobby => {
                    lobby.addSocket(socket);
               });
          });
          
          socket.on('getLobbies', () => {
               console.log("getLobbies");
               Lobby.list(10).then(list => {
                    socket.emit('lobbies', list);
                    console.log("sent lobbies");
               }).catch(console.error);
          });
     }
}

Lobby.create("TestLobbyYay");
module.exports = Lobby;