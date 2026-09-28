import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join customer room for targeted real-time balance & deposit updates
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined user_${userId}`);
      }
    });

    // Join admin room for real-time deposit & payout notifications
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`[Socket.io] Socket ${socket.id} joined admin_room`);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const emitRealtimeEvent = (eventName, data) => {
  if (io) {
    // Broadcast event globally and to rooms
    io.emit(eventName, data);
    if (data?.userId) {
      io.to(`user_${data.userId}`).emit(eventName, data);
    }
    io.to('admin_room').emit(eventName, data);
    console.log(`[Socket.io Broadcast] Event: ${eventName}`, data?._id || data?.transactionId || '');
  }
};
