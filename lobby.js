// bog standard in-place fisher-yates shuffle
Array.prototype.shuffle = function() {
  for(var i = this.length - 1; i > 0; i--) {
    var randIndex = Math.floor(Math.random() * (i+1));
    var copy = this[i];
    this[i] = this[randIndex];
    this[randIndex] = copy;
  }
  return this;
};
var lobbyIdAdjectives = "large small big giant good bad high low large long right wrong early late major minor little top bottom best worst dark light heavy wide thin serious silly general specific certain main central clear difficult uncertain red orange yellow blue indigo violet white black silver gray grey navy cerulean turquoise azure cyan teal lime gold amber brown maroon pink magenta purple indigo violet short deep flat thick near far fast quick slow bright warm cool cold loud quiet dry wet hard soft strong weak clean dirty thirsty hungry fat old fresh dead healthy sweet sour bitter salty great important useful expensive cheap free rich afraid brave sad happy proud comfortable clever interesting exciting funny famous kind polite fair lazy lucky careful safe dangerous nuclear industrial casual iron aluminum cast sharp pointy measuring paper cardboard plastic fake real rolling slow fast spicy steel metallic zesty radiant dire comforting scary unpleasant frightening wonderful uncomfortable pleasing".split(" ").map(function(a){return a[0].toUpperCase() + a.slice(1);}).shuffle();
var lobbyIdNouns = "kitchen sink faucet apron foil dish basket batter beater blender bottle bowl bread broom cabinet caddy cake can carafe casserole china chopsticks coffee colander cook cookbook cooker cookie corn counter cream creamer crockpot cup cupboard custard cutlery board decanter towel soap rack dishwasher dough egg timer espresso flatware flour sifter fondue food processor fork freezer fryer fries fruit pan garbage bag compactor disposal garlic glass grater gravy griddle grill grinder honey ice icecream skillet jar jug juice juicer kettle knife leftovers ladle lid marinade masher cup spoon meat grinder tenderizer thermometer oven microwave mixer mop mortar pestle muffin mug napkin nut opener pepper pie plate pitcher pizza wheel placemat platter popcorn pot potholder potato poultry shears quiche range reamer recipe refrigerator fridge rice roast roaster pin salad salt shaker sauce saucer server shelf shelves sieve sift sifter silverware skewer slice slicer soup spatula sponge spices steak steam steamer stew stove sugar table tablecloth tablespoon tea teaspoon tin toaster toast tongs trash tray tumbler utensils vegetable veggie peeler waffle whip whisk wok yogurt hamburger cereal milk bread butter".split(" ").map(function(a){return a[0].toUpperCase() + a.slice(1);}).shuffle();
var maxIdCount = lobbyIdAdjectives.length * lobbyIdAdjectives.length * lobbyIdNouns.length;
console.log("Maximum unique ids: %d", maxIdCount);
function generateLobbyIdFromInteger(base) {
  var indexOne = base % lobbyIdAdjectives.length;
  var indexTwo = (base * indexOne) % lobbyIdAdjectives.length;
  var indexThree = (indexOne * indexTwo) % lobbyIdNouns.length;
  return lobbyIdAdjectives[indexOne] + lobbyIdAdjectives[indexTwo] + lobbyIdNouns[indexThree];
}
module.exports = function() {
  var express = require('express');
  var validator = require('validator');
  var lobbies = {};
  var route = express.Router();
  var log = require('debug')("kitchensync:lobby");
  var faucets = require('./faucets');
  var currentID = Math.floor(Math.random() * maxIdCount); // TODO: store and reload (via redis?) to ensure actual permanence
  
  route.get('/create', function(request, resource) {
    var io = module.exports.io;
    var new_id = generateLobbyIdFromInteger(currentID++);
    var namespace = io.of("/lobby/" + new_id);
    
    var lobby = {};
    lobby.namespace = namespace;
    lobby.id = new_id;
    lobby.faucet = "youtube";
    lobby.contentID = "lTx3G6h2xyA";
    lobby.lastKnownTime = 0;
    lobby.lastUpdateTime = Date.now();
    lobby.paused = true;
    lobby.host = null;
    lobby.chatlog = [];
    lobby.queue = [];

    lobbies[new_id] = lobby;
    
    io.of('/lobby/' + new_id).use(function(socket, next) {
      socket.emit("ident");
      next();
    });
    
    namespace.on('connection', function(socket) {
      function broadcast(ev, data, except) {
        if(!except)
          except = [];
        for(var clientID in namespace.connected) {
          if(except.indexOf(namespace.connected[clientID]) == -1)
            namespace.connected[clientID].emit(ev, data);
        }
      }
      socket.once('ident', function(name) {
        name = validator.toString(name);
        name = validator.stripLow(name);
        if(validator.isAlphanumeric(name)) {
          name = validator.escape(name);
          socket.nick = name;
        }
        else {
          socket.emit("badnick");
          return;
        }
        log("Client connected");
        if(!lobby.host) {
          lobby.host = socket;
          log("No lobby host, so making first connection host: %o", lobby.host);
        }
        socket.emit('setFaucet', lobby.faucet);
        socket.emit('updateQueue', lobby.queue);
        for(var  i = 0; i < lobby.chatlog.length; i++) {
          socket.emit('message', lobby.chatlog[i]);
        }
        emitSay("<system>", socket.nick + " has joined the sync");

        socket.on('detect plugin by url', function(inputURL) {
          if(lobby.host != socket)
            return;
          log("Detecting plugin for url %s", inputURL);

          faucets.parseURL(inputURL, function(data) {
            if(data && data.faucet && data.contentId)
              changeMedia(data);
          });

        });
        socket.on('nick', function(name) {
          name = validator.toString(name);
          name = validator.stripLow(name);
          if(validator.isAlphanumeric(name) && name.length < 50) {
            name = validator.escape(name);
            emitSay("<system>", socket.nick + " is know known as " + name);
            socket.nick = name;
          }
          else {
            socket.emit("badnick");
          }
        });
        socket.on('faucet ready', function(data) {
          log("New faucet ready for sync");
          var diff = Date.now() - lobby.lastUpdateTime;
          if(lobby.paused)
            diff = 0;
          socket.emit('host', lobby.host == socket);
          log("Sending time to new faucet: %d", lobby.lastKnownTime + diff/1000);
          socket.emit('load', {id:lobby.contentID, time: lobby.lastKnownTime + diff/1000, paused: lobby.paused});
        });
        socket.on('say', function(message) {
          var cleanMessage;
          if(message) {
            cleanMessage = validator.toString(message);
            cleanMessage = validator.stripLow(cleanMessage);
            cleanMessage = validator.escape(cleanMessage);
          }
          if(cleanMessage) {
            var senderName = socket.nick;
            if(socket == lobby.host)
              senderName = "[host] " + senderName;
            emitSay(senderName, cleanMessage);
          }
        });
        function emitSay(sender, message) {
          var msg = {sender: sender, message: message};
          msg.sender = validator.escape(sender);
          broadcast('message', msg);
          lobby.chatlog.push(msg);
        }
        function changeMedia(data) {
          if(lobby.host != socket || !data || !data.contentId || !data.faucet) {
            log("Attempt to changeMedia from non-host, or changeMedia with invalid data: %o", data);
            return;
          }
          emitSay("<system>", "Changing sync to " + data.faucet + " " + data.contentId);
          lobby.lastUpdateTime = Date.now();
          lobby.lastKnownTime = 0;
          lobby.contentID = data.contentId;
          lobby.faucet = data.faucet;
          if(data.play)
            lobby.paused = false;
          namespace.emit('setFaucet', lobby.faucet);
          namespace.emit('load', {id:lobby.contentID, time: 0, paused: lobby.paused});
        }
        socket.on('addToQueue', function(data) {
          if(lobby.host != socket)
            return;
          faucets.parseURL(data, function(data) {
            if(lobby.host != socket || !data || !data.contentId || !data.faucet) {
              log("Attempt to addToQueue from non-host, or addToQueue with invalid data: %o", data);
              return;
            }
            lobby.queue.push({contentId:data.contentId, faucet:data.faucet, play:true});
            broadcast('updateQueue', lobby.queue);
          });
        });
        socket.on('nextInQueue', function(data) {
          if(lobby.host != socket) {
            log("Attempt to nextInQueue from non-host");
            return;
          }
          if(lobby.queue.length > 0) {
            changeMedia(lobby.queue.shift());
            broadcast('updateQueue', lobby.queue);
          }
        });
        socket.on('ended', function() {
          if(lobby.host == socket) {
            if(lobby.queue.length > 0) {
              emitSay("<system>", "Media ended, advancing to next in queue");
              changeMedia(lobby.queue.shift());
              broadcast('updateQueue', lobby.queue);
            }
          }
        });
        socket.on('changeMedia', changeMedia);
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
              broadcast('seek', data, [socket]);
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
          emitSay("<system>", socket.nick + " has left the sync");
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
              emitSay("<system>", lobby.host.nick + " is the new host!");
              for(var i = 0; i < remaining_clients.length; i++) {
                var sockID = remaining_clients[i];
                var sock = namespace.connected[sockID];
                sock.emit('host', lobby.host == sock);
              }
            }
          }
        });
      });
    });

    return resource.redirect(new_id);
  });
  var list = function(request, resource) {
    resource.render('lobbyList', {names: Object.keys(lobbies), title: "Kitchen Sync: List"});
  };
  route.get('/', list);
  route.get('/list', list);
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
};
