let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

// Emit a live-parking update to all connected clients (call after any slot/booking mutation)
const emitParkingUpdate = (payload) => {
  if (ioInstance) ioInstance.emit('parking:update', payload);
};

const emitNotification = (userId, notification) => {
  if (ioInstance) ioInstance.emit(`notification:${userId}`, notification);
};

module.exports = { initSocket, emitParkingUpdate, emitNotification };
