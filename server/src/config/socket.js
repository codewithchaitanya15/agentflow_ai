let ioInstance = null;

const initSocket = (server, corsOptions) => {
  const { Server } = require('socket.io');
  ioInstance = new Server(server, {
    cors: corsOptions || {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.on('join-execution', (executionId) => {
      socket.join(`execution:${executionId}`);
    });

    socket.on('leave-execution', (executionId) => {
      socket.leave(`execution:${executionId}`);
    });

    socket.on('join-user', (userId) => {
      socket.join(`user:${userId}`);
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

module.exports = { initSocket, getIO };
