import { io } from 'socket.io-client';
import { getAuth } from 'firebase/auth';

const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

const createSocket = async () => {
  const token = await getAuthToken();
  if (!token) {
    console.error('No auth token available');
    return null;
  }

  const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  console.log('Creating socket connection to:', socketUrl);

  return io(socketUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
    forceNew: true,
    path: '/socket.io/',
    withCredentials: true,
    auth: { token },
    extraHeaders: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
};

let socket = null;

const initializeSocket = async () => {
  try {
    socket = await createSocket();
    if (!socket) return;

    // Add error handling
    socket.on('connect', () => {
      console.log('Socket connected:', {
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', {
        reason,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', {
        attemptNumber,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', {
        attemptNumber,
        timestamp: new Date().toISOString()
      });
    });

    // Listen for chat history
    socket.on('chat_history', (data) => {
      console.log('Received chat history:', {
        chatCount: data.chats.length,
        timestamp: new Date().toISOString()
      });
      // You can dispatch this to your state management system here
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('chat_history', { detail: data }));
      }
    });

    return socket;
  } catch (error) {
    console.error('Error initializing socket:', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return null;
  }
};

export { initializeSocket };
export default socket; 