import { io, Socket } from 'socket.io-client';
import { getAuth } from 'firebase/auth';

const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(true); // Force refresh the token
};

const createSocket = async (): Promise<Socket | null> => {
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
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 60000,
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

let socket: Socket | null = null;

const initializeSocket = async (): Promise<Socket | null> => {
  try {
    socket = await createSocket();
    if (!socket) return null;

    // Add error handling
    socket.on('connect_error', async (error) => {
      console.error('Socket connection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // If token expired, try to refresh and reconnect
      if (error.message.includes('token expired')) {
        console.log('Token expired, attempting to refresh...');
        const newToken = await getAuthToken();
        if (newToken && socket) {
          console.log('Token refreshed, reconnecting...');
          socket.auth = { token: newToken };
          socket.connect();
        }
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully:', {
        id: socket?.id,
        connected: socket?.connected,
        disconnected: socket?.disconnected
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', {
        reason,
        id: socket?.id,
        connected: socket?.connected,
        disconnected: socket?.disconnected
      });
      
      // If disconnected due to token expiration, try to refresh and reconnect
      if (reason === 'io server disconnect' && socket) {
        console.log('Server disconnected, attempting to refresh token and reconnect...');
        getAuthToken().then(newToken => {
          if (newToken && socket) {
            socket.auth = { token: newToken };
            socket.connect();
          }
        });
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', {
        attempt: attemptNumber,
        id: socket?.id,
        connected: socket?.connected,
        disconnected: socket?.disconnected
      });
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', {
        attempts: attemptNumber,
        id: socket?.id,
        connected: socket?.connected,
        disconnected: socket?.disconnected
      });
    });

    return socket;
  } catch (error) {
    console.error('Error initializing socket:', error);
    return null;
  }
};

export { initializeSocket };
export default socket; 