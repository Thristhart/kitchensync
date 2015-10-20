var express = require('express');
var app = express();
var http = require('http').Server(app);

// controllers
var site = require('./site');
var lobby = require('./lobby');

lobby.startSocketIO(http);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use('/kitchen/asset/', express.static(__dirname + '/static'));
app.get('/kitchen', site.index);

app.use('/kitchen/sync', lobby);

var http_target = process.env.PORT || 5000;
if(process.env.LISTEN_FDS) {
  http_target = {fd: 3};
}
http.listen(http_target, function() {
});

console.log("Started everything and the kitchen sync");
