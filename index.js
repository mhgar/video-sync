'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 7777;

app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile('public/html/room.html' , { root : __dirname}));

io.on('connection', function(client) {
    console.log('someone connected');
    
    client.on('disconnect', function() {
        console.log('disconnected');
    });
    
    client.on('pause', function(payload) {
        console.log('pausing at ' + payload.time);
        client.broadcast.emit('pause', payload);
    });

    client.on('play', function(payload) {
        console.log('playing at ' + payload.time);
        client.broadcast.emit('play', payload);
    });
    
    client.on('seek', function(payload) {
        console.log('seeking to ' + payload.time);
        client.broadcast.emit('seek', payload);
    });
});


server.listen(port);
console.log('OK');
