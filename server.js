const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);
let players = [];

// server.get('/', (req, res) => {
//     res.sendFile(__dirname + '/client/index.html');
// });

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    players.push(socket.id);

    // Server sends to first player that connects
    if (players.length === 1) {
        io.emit('isPlayerA');
    }
    
    if (players.length === 2) {
        io.emit('startGame');
        console.log('startGame two players')
    }
    
    socket.on('addCups', (cups) => {
        io.emit('addCups', cups);
        console.log('addCups');
    });

    socket.on('drawCard', (isPlayerA) => {
        io.emit('drawCard', isPlayerA);
    });

    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
        players = players.filter(player => player !== socket.id);
    });
    

});

http.listen(3000, () => {
    console.log('Server Started!');
});
