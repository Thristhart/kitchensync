"use strict";
const Koa = require('koa');

const app = new Koa();
const http = require('http');
const server = http.Server(app.callback());

const socket_io = require('socket.io');
const io = socket_io(server, {serveClient: false});

app.use(require('koa-static')("./public"));


const Lobby = require('./server/model/lobby');
Lobby.listen(io);

server.listen(process.env.PORT);