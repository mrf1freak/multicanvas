var http = require("http");
var express = require('express');
var app = express();
var server = http.createServer(app).listen(process.env.PORT || OPENSHIFT_NODEJS_PORT, process.env.IP || OPENSHIFT_NODEJS_IP);
var id = require("shortid");
var io = require("socket.io").listen(server);
var canvasState = "";




app.use(express.static('client'));


var cursors = [];


io.on('connection', function(socket) {
    socket.id = id.generate();

    socket.emit('updateID', socket.id);
    
    // store nick
    
    socket.on('name', function(name){
       socket.name = name; 
       
    });
    
    // receive & send line data

    socket.on('line', function(data) {
        socket.broadcast.emit('receiveLine', data);
    });

    // get ping

    socket.on('ping', function() {
        socket.emit('pong');
    });

    // clear canvas

    socket.on('clear', function() {
        io.emit('clear');
    });


    // save canvas state

    socket.on('saveCanvasState', function(state) {
        canvasState = state;
    });

    // put canvas data on new connection
    if (!canvasState == "") {
        socket.emit('canvasState', canvasState);
    }

    // update mouse positions

    socket.on('mouse', function(cursorPos) {
        cursorPos.push(socket.id);
        cursorPos.push(socket.name);
        socket.broadcast.emit('updateCursor', cursorPos);
    });






    socket.on('disconnect', function() {
        io.emit('deleteCursor', socket.id);
    });

});
