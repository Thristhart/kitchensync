module.exports = function() {
  var express = require('express');
  var lobbies = {};
  var route = express.Router();
  var log = require('debug')("kitchensync:lobby");
  route.get('/create', function(request, resource) {
    var io = module.exports.io;
    var new_id = Math.floor(Math.random() * 1000);
    var namespace = io.of("/lobby/" + new_id);
    
    var lobby = {};
    lobby.namespace = namespace;
    lobby.id = new_id;
    lobbies[new_id] = lobby;
    lobby.faucet = "youtube";
    lobby.contentID = "lTx3G6h2xyA";
    lobby.lastKnownTime = 0;
    lobby.lastUpdateTime = Date.now();
    lobby.paused = true;
    lobby.host = null;
    
    
    namespace.on('connection', function(socket) {
      log("Client connected");
      if(!lobby.host) {
        lobby.host = socket;
        log("No lobby host, so making first connection host: %o", lobby.host);
      }
      socket.emit('setFaucet', lobby.faucet);
      socket.on('faucet ready', function(data) {
        log("New faucet ready for sync");
        var diff = Date.now() - lobby.lastUpdateTime;
        if(lobby.paused)
          diff = 0;
        socket.emit('host', lobby.host == socket);
        log("Sending time to new faucet: %d", lobby.lastKnownTime + diff/1000)
        socket.emit('load', {id:lobby.contentID, time: lobby.lastKnownTime + diff/1000, paused: lobby.paused});
      });
      socket.on('changeMedia', function(data) {
        if(lobby.host != socket || !data.contentId || !data.faucet) {
          log("Attempt to changeMedia from non-host, or changeMedia with invalid data: %o", data);
          return;
        }
        lobby.lastUpdateTime = Date.now();
        lobby.lastKnownTime = 0;
        lobby.contentID = data.contentId;
        lobby.faucet = data.faucet;
        namespace.emit('setFaucet', lobby.faucet);
        namespace.emit('load', {id:lobby.contentID, time: 0, paused: lobby.paused});
      });
      socket.on('poke', function() {
        var diff = Date.now() - lobby.lastUpdateTime;
        if(lobby.paused)
          diff = 0;
        socket.emit('seek', lobby.lastKnownTime + diff/1000);
        if(lobby.paused)
          socket.emit('pause'); 
        else
          socket.emit('play');
      });
      socket.on('setseek', function(data) {
        if(lobby.host == socket) {
          lobby.lastUpdateTime = Date.now();
          lobby.lastKnownTime = data;
          log("Seeking to new time %d", data);
          for(var clientID in namespace.connected) {
            var other = namespace.connected[clientID];
            if(other != socket)
              other.emit('seek', data);
          }
        }
      });
      socket.on('pause', function(data) {
        if(lobby.host == socket) {
          namespace.emit('pause');
          log("Paused faucet at %d", data);
          lobby.lastKnownTime = data;
          lobby.lastUpdateTime = Date.now();
          lobby.paused = true;
        }
      });
      socket.on('play', function() {
        if(lobby.host == socket) {
          namespace.emit('play');
          log("Playing faucet");
          lobby.lastUpdateTime = Date.now();
          lobby.paused = false;
        }
      });
      socket.on('disconnect', function() {
        if(socket == lobby.host) {
          var remaining_clients = Object.keys(namespace.connected);
          log("Host disconnected, leaving %d sockets remaining", remaining_clients.length);
          lobby.host = namespace.connected[remaining_clients[0]];
          if(!lobby.host) {
            delete lobbies[lobby.id];
            log("Lobby emptied, deleting it");
          }
          else {
            log("Assigned new lobby host: %s", lobby.host.id);
            for(var i = 0; i < remaining_clients.length; i++) {
              var sockID = remaining_clients[i];
              var sock = namespace.connected[sockID];
              sock.emit('host', lobby.host == sock);
            }
          }
        }
      });
    });

    return resource.redirect(new_id);
  });
  route.get('/list', function(request, resource) {
    resource.render('lobbyList', {names: Object.keys(lobbies)});
  });
  route.get('/:id', function(request, resource) {
    var id = request.param("id");
    var lobby = lobbies[id];
    resource.render('sync', {title: "Kitchen Syncing " + id, id:id, plugin: lobby.faucet});
  });

  return route;
}();

module.exports.startSocketIO = function(http) {
  var io = require('socket.io')(http, {
    path: "/kitchen/socket/"
  });
  console.log("Starting socket.io, serving on " + io.path());
  module.exports.io = io;
}
