import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Chat, Message } from '../types/chat';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  socket: Socket | null;
  setCurrentChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  markMessagesAsRead: (chatId: string) => Promise<void>;
  fetchChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const apiUrl = process.env.VITE_API_URL || 'http://localhost:3001';

  // Function to test server availability
  const testServerConnection = async (url: string): Promise<boolean> => {
    try {
      await axios.get(`${url}/health`);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Function to find available server
  const findAvailableServer = async (): Promise<string> => {
    const baseUrl = 'http://localhost';
    const startPort = 3001;
    const maxPort = 3010;

    for (let port = startPort; port <= maxPort; port++) {
      const serverUrl = `${baseUrl}:${port}`;
      if (await testServerConnection(serverUrl)) {
        console.log(`Found available server at ${serverUrl}`);
        return serverUrl;
      }
    }
    return apiUrl; // Fallback to default
  };

  // Socket connection
  useEffect(() => {
    if (!user || !token) {
      console.log('No user or token, skipping socket connection');
      return;
    }

    let isSubscribed = true;

    const initializeSocket = async () => {
      try {
        const serverUrl = await findAvailableServer();
        console.log('Initializing socket connection...', {
          serverUrl,
          hasToken: !!token,
          userEmail: user.email
        });

        const socketOptions = {
          auth: { token },
          transports: ['websocket', 'polling'],
          withCredentials: true,
          path: '/socket.io/',
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          autoConnect: true,
          forceNew: true
        };

        if (!isSubscribed) return;

        const newSocket = io(serverUrl, socketOptions);

        const handleConnect = () => {
          console.log('Socket connected successfully', {
            id: newSocket.id,
            transport: newSocket.io.engine.transport.name
          });
          setError(null);
        };

        const handleConnectError = (error: Error) => {
          console.error('Socket connection error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          setError('Failed to connect to chat server');
        };

        const handleDisconnect = (reason: string) => {
          console.log('Socket disconnected:', {
            reason,
            wasConnected: newSocket.connected,
            attempts: newSocket.io.reconnectionAttempts
          });
        };

        const handleError = (error: Error) => {
          console.error('Socket error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          setError('Chat server error occurred');
        };

        // Attach event listeners
        newSocket.on('connect', handleConnect);
        newSocket.on('connect_error', handleConnectError);
        newSocket.on('disconnect', handleDisconnect);
        newSocket.on('error', handleError);

        // Handle reconnection events
        newSocket.io.on('reconnect', (attempt: number) => {
          console.log('Socket reconnected after attempts:', attempt);
          setError(null);
        });

        newSocket.io.on('reconnect_attempt', (attempt: number) => {
          console.log('Socket reconnection attempt:', attempt);
        });

        newSocket.io.on('reconnect_error', (error: Error) => {
          console.error('Socket reconnection error:', error);
        });

        newSocket.io.on('reconnect_failed', () => {
          console.error('Socket reconnection failed');
          setError('Failed to reconnect to chat server');
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setError('Failed to connect to chat server');
      }
    };

    initializeSocket();

    return () => {
      isSubscribed = false;
      if (socket) {
        console.log('Cleaning up socket connection');
        socket.removeAllListeners();
        socket.close();
      }
    };
  }, [user, token, apiUrl]);

  // Message handling
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      console.log('New message received:', message);
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(m => m._id === message._id)) {
          console.log('Message already exists, skipping');
          return prev;
        }
        return [...prev, {
          ...message,
          createdAt: new Date(message.createdAt).toISOString() // Ensure consistent date format
        }];
      });

      // Update unread count if message is not from current user
      if (message.sender._id !== user?.uid && (!currentChat || message.chat !== currentChat._id)) {
        setUnreadCount(prev => prev + 1);
      }
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, currentChat, user]);

  // Fetch chats
  const fetchChats = useCallback(async () => {
    if (!user || !token) {
      console.log('No user or token, skipping fetch chats');
      return;
    }

    try {
      console.log('Fetching chats...');
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiUrl}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Chats fetched successfully:', response.data);
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [user, token, apiUrl]);

  // Fetch messages when current chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat || !token) {
        console.log('No current chat or token, skipping fetch messages');
        return;
      }

      try {
        console.log(`Fetching messages for chat ${currentChat._id}...`);
        setLoading(true);
        setError(null);

        const response = await axios.get(`${apiUrl}/api/chats/${currentChat._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Messages fetched successfully:', response.data);
        // Ensure consistent date format for all messages
        const formattedMessages = response.data.map((message: Message) => ({
          ...message,
          createdAt: new Date(message.createdAt).toISOString()
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentChat, token, apiUrl]);

  // Send message
  const sendMessage = async (chatId: string, text: string) => {
    if (!socket || !token || !user) {
      console.error('Cannot send message: missing socket, token, or user');
      throw new Error('Cannot send message');
    }

    try {
      console.log(`Sending message to chat ${chatId}:`, { text, sender: user.uid });
      const response = await axios.post(
        `${apiUrl}/api/chats/${chatId}/messages`,
        { 
          text,
          sender: user.uid, // Include the sender's uid
          chat: chatId // Include the chat ID
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Message sent successfully:', response.data);
      const newMessage = {
        ...response.data,
        sender: {
          _id: user.uid,
          email: user.email,
          displayName: user.displayName || user.email
        },
        createdAt: new Date(response.data.createdAt).toISOString()
      };

      setMessages(prev => [...prev, newMessage]);
      socket.emit('message:send', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatId: string) => {
    if (!token) {
      console.error('Cannot mark messages as read: missing token');
      return;
    }

    try {
      console.log(`Marking messages as read for chat ${chatId}`);
      await axios.post(
        `${apiUrl}/api/chats/${chatId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev =>
        prev.map(message => ({
          ...message,
          read: true
        }))
      );

      // Update unread count
      const updatedUnreadCount = chats.reduce((count, chat) => {
        if (chat._id === chatId) return count;
        return count + (chat.unreadCount || 0);
      }, 0);
      setUnreadCount(updatedUnreadCount);

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Update unread count when chats change
  useEffect(() => {
    const totalUnread = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
    setUnreadCount(totalUnread);
  }, [chats]);

  // Initial fetch
  useEffect(() => {
    if (user && token) {
      console.log('Initial fetch of chats');
      fetchChats();
    }
  }, [user, token, fetchChats]);

  const value: ChatContextType = {
    chats,
    currentChat,
    messages,
    unreadCount,
    loading,
    error,
    socket,
    setCurrentChat,
    sendMessage,
    markMessagesAsRead,
    fetchChats
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext; 