var express = require('express');
var app = express();
var http = require('http').Server(app);

// controllers
var site = require('./site')
var lobby = require('./lobby')

lobby.startSocketIO(http);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use('/kitchen/asset/', express.static(__dirname + '/static'));
app.get('/kitchen', site.index);

app.use('/kitchen/sync', lobby);

http.listen(process.env.PORT | 5000);

console.log("Started everything and the kitchen sync");

// http://developer.vimeo.com/player/js-api
// http://developer.vimeo.com/player/embedding

// https://github.com/justintv/Twitch-API/blob/master/embedding.md
// http://discuss.dev.twitch.tv/t/scrub-to-time-on-embedded-player/120/4
// http://discuss.dev.twitch.tv/t/player-md-is-there-something-like-gettime-or-isended-would-be-nice-with-list-of-functions-available-that-can-be-accessed-with-js/875/7
