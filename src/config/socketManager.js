// socketManager.js
const { Server } = require("socket.io");

// This function now just initializes and returns the io instance.
const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Your React frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-editorial-room', (videoId) => {
      const roomName = `editorial-room-${videoId}`;
      socket.join(roomName);
      console.log(`User ${socket.id} joined room ${roomName}`);
    });

    socket.on('leave-editorial-room', (videoId) => {
       const roomName = `editorial-room-${videoId}`;
       socket.leave(roomName);
       console.log(`User ${socket.id} left room ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = { initSocket };