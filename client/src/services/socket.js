import { io } from 'socket.io-client';

const getBaseApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:5000`;
    }
    return `${protocol}//${hostname}${port && port !== '80' && port !== '443' && port !== '5173' ? ':' + port : ''}`;
  }
  return 'http://localhost:5000';
};

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(getBaseApiUrl(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Realtime Socket] Connected to backend server:', socket.id);

      // Join admin room if logged in as admin
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        socket.emit('join_admin_room');
      }

      // Join customer room if logged in as user
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?._id || user?.id) {
            socket.emit('join_user_room', user._id || user.id);
          }
        } catch (e) {}
      }
    });
  }

  return socket;
};

export const listenToRealtimeEvents = (callback) => {
  const s = getSocket();
  const events = [
    'deposit_created',
    'deposit_updated',
    'payout_created',
    'payout_updated',
    'user_updated',
    'balance_updated',
    'plan_updated',
    'gateway_updated',
  ];

  events.forEach((ev) => {
    s.on(ev, (data) => {
      console.log(`⚡ [Realtime Socket Event Received] ${ev}:`, data);
      callback(ev, data);
    });
  });

  return () => {
    events.forEach((ev) => s.off(ev));
  };
};
