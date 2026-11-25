
const { Server } = require('socket.io');
const prisma = require('../config/prisma');
const socketAuth = require('./middleware/socketAuth');

let io;

// Кількість активних Socket.io-з'єднань кожного користувача
const onlineUsers = new Map();

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    const user = socket.user;

    socket.join(`user:${user.id}`);

    // Реєструємо підключення користувача
    const connections = onlineUsers.get(user.id) || 0;
    onlineUsers.set(user.id, connections + 1);

    // Повідомляємо про появу Online
    if (connections === 0) {
      io.emit('user:status', {
        userId: user.id,
        status: 'ONLINE'
      });
    }

    // Приєднання адміністратора до кімнати ресторану
    socket.on('join:restaurant', async (restaurantId, callback) => {
      try {
        if (user.role !== 'RESTAURANT_ADMIN') {
          return callback?.({
            success: false,
            message: 'Access denied'
          });
        }

        const restaurant = await prisma.restaurant.findFirst({
          where: {
            id: restaurantId,
            ownerId: user.id
          }
        });

        if (!restaurant) {
          return callback?.({
            success: false,
            message: 'Restaurant not found or access denied'
          });
        }

        socket.join(`restaurant:${restaurantId}`);

        callback?.({
          success: true,
          message: 'Joined restaurant room'
        });
      } catch (error) {
        console.error('Restaurant room error:', error);

        callback?.({
          success: false,
          message: 'Internal server error'
        });
      }
    });

    console.log(
      `Socket connected: ${socket.id}, user: ${user.id}, role: ${user.role}`
    );

    // Отримати список користувачів Online
    socket.on('users:online', (callback) => {
    callback?.({
        success: true,
        users: Array.from(onlineUsers.keys())
    });
    });

    socket.on('disconnect', () => {
      const currentConnections = onlineUsers.get(user.id) || 0;

      if (currentConnections <= 1) {
        onlineUsers.delete(user.id);

        io.emit('user:status', {
          userId: user.id,
          status: 'OFFLINE'
        });
      } else {
        onlineUsers.set(user.id, currentConnections - 1);
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }

  return io;
}

module.exports = {
  initializeSocket,
  getIO
};
