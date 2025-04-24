import { io } from 'socket.io-client';
import { getAuthToken } from './auth';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

export const initializeSocket = async () => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Close existing socket if it exists
    if (socket) {
      socket.close();
    }

    // Initialize new socket with authentication
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: RECONNECT_DELAY
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      reconnectAttempts = 0;
    });

    socket.on('connect_error', async (error) => {
      console.error('Socket connection error:', error);
      
      if (error.message.includes('Authentication error')) {
        try {
          // Try to refresh the token
          const newToken = await getAuthToken();
          if (newToken) {
            socket.auth.token = newToken;
            socket.connect();
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socket.connect();
      }
    });

    return socket;
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    throw error;
  }
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
}; 