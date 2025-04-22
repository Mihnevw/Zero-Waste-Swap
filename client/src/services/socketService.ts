import { Socket as ClientSocket, io } from 'socket.io-client';
import { getAuth } from 'firebase/auth';

interface ChatHistoryEvent {
  chats: Array<{
    _id: string;
    participants: Array<{
      _id: string;
      username: string;
      email: string;
      photoURL?: string;
      displayName: string;
    }>;
    messages: Array<{
      _id: string;
      text: string;
      sender: {
        _id: string;
        username: string;
        email: string;
        photoURL?: string;
        displayName: string;
      };
      createdAt: string;
      read: boolean;
    }>;
    unreadCount: number;
  }>;
}

const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

const createSocket = async (): Promise<ClientSocket | null> => {
  const token = await getAuthToken();
  if (!token) {
    console.error('No auth token available');
    return null;
  }

  console.log('Creating socket connection with token');

  return io(import.meta.env.VITE_API_URL, {
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

let socket: ClientSocket | null = null;

const initializeSocket = async (): Promise<ClientSocket | null> => {
  try {
    socket = await createSocket();
    if (!socket) return null;

    // Add error handling
    socket.on('connect', () => {
      console.log('Socket connected:', {
        socketId: socket?.id,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('error', (error: Error) => {
      console.error('Socket error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', {
        reason,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('Socket reconnection attempt:', {
        attemptNumber,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('reconnect_error', (error: Error) => {
      console.error('Socket reconnection error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log('Socket reconnected after', {
        attemptNumber,
        timestamp: new Date().toISOString()
      });
    });

    // Listen for chat history
    socket.on('chat_history', (data: ChatHistoryEvent) => {
      console.log('Received chat history:', {
        chatCount: data.chats.length,
        timestamp: new Date().toISOString()
      });
      // You can dispatch this to your state management system here
      if (window.dispatchEvent) {
        const event = new CustomEvent('chat_history', { detail: data });
        window.dispatchEvent(event);
      }
    });

    return socket;
  } catch (error) {
    console.error('Error initializing socket:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return null;
  }
};

export { initializeSocket };
export default socket; 