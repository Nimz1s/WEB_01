
const { io } = require('socket.io-client');

const token = process.env.JWT_TOKEN;

const socket = io('http://localhost:3000', {
  auth: {
    token
  }
});

socket.on('connect', () => {
  console.log('Connected successfully:', socket.id);
  socket.disconnect();
});

socket.on('connect_error', (error) => {
  console.log('Connection error:', error.message);
});
