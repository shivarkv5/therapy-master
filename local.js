const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const conversation = require('./conversation');

app.get('/', function(req, res) {
    res.render('index.ejs');
});

io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
        socket.username = username || "user1";
        io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', async function(message) {
        socket.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
        let responseMsg = await conversation.handleMessage({uuid: socket.username, phone: "8312220167"}, message,message);
        console.log('---', responseMsg)
        Promise.resolve(responseMsg).then(msg=>{
            socket.emit('chat_message', '<strong>' + 'Bot' + '</strong>: ' + msg);
        });
    });

});

// const server = http.listen(8000, function() {
//     console.log('listening on *:8000');
// });
