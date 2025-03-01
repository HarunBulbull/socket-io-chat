// Dependincies
const { Server } = require('socket.io');
const express = require('express');
const http = require('http');
const cors = require('cors');
const PORT = 3000;


// Create Express App
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS options
const corsOptions = {
    origin: '*',
    credentials: true,
};
app.use(cors(corsOptions));

// Create server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join', async ({ username, room }) => {
    socket.join(room);
    console.log(`User with id ${socket.id} connected to room ${room} with name ${username}.`);
    socket.to(room).emit('message', {
      username: 'System',
      message: `${username} connected.`,
      time: new Date(),
      id: -1
    });
  });

  // Send message
  socket.on('sendMessage', async ({ message, username, room }) => {
    const newMessage = {
      username,
      message,
      time: new Date(),
      id: socket.id
    };
    io.to(room).emit('message', newMessage);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User left:', socket.id);
  });
});

// Host server
server.listen(PORT, () => {
  console.log(`Socket server is running at port ${PORT} `);
  console.log('Coded by HarunBulbul');
});