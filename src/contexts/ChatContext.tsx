import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Chat } from '../types/chat';
import { Message } from '../types/message';
import { io, Socket } from 'socket.io-client';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  unreadCounts: { [chatId: string]: number };
  unreadCount: number;
  setCurrentChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  startChat: (participantId: string) => Promise<void>;
  refreshUnreadCounts: () => Promise<void>;
  fetchChats: () => Promise<void>;
  socket: Socket | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [chatId: string]: number }>({});

  const apiUrl = process.env.VITE_API_URL || 'http://localhost:3001';

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user) return;

    const initializeSocket = async () => {
      try {
        // Get a fresh token before connecting
        const freshToken = await user.getIdToken(true);
        
        const socket = io(apiUrl, {
          auth: {
            token: freshToken
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 30000,
          forceNew: true,
          autoConnect: true
        });

        socket.on('connect', () => {
          console.log('Socket connected successfully');
          setError(null);
        });

        socket.on('connect_error', async (error) => {
          console.error('Socket connection error:', error);
          
          // If token expired, try to refresh and reconnect
          if (error.message.includes('id-token-expired')) {
            try {
              const newToken = await user.getIdToken(true);
              socket.auth = { token: newToken };
              socket.connect();
            } catch (refreshError) {
              console.error('Error refreshing token:', refreshError);
              setError('Failed to refresh authentication. Please log in again.');
            }
          } else {
            setError('Failed to connect to chat server. Retrying...');
            
            // Try to reconnect after a delay
            setTimeout(() => {
              if (socket.disconnected) {
                console.log('Attempting to reconnect...');
                socket.connect();
              }
            }, 5000);
          }
        });

        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'io server disconnect' || reason === 'io client disconnect') {
            // the disconnection was initiated by the server or client, reconnect manually
            socket.connect();
          }
        });

        socket.on('error', (error) => {
          console.error('Socket error:', error);
          setError('Chat server error. Attempting to reconnect...');
        });

        socket.on('reconnect', (attemptNumber) => {
          console.log('Socket reconnected after', attemptNumber, 'attempts');
          setError(null);
        });

        socket.on('reconnect_error', (error) => {
          console.error('Socket reconnection error:', error);
          setError('Failed to reconnect to chat server');
        });

        socket.on('reconnect_failed', () => {
          console.error('Socket reconnection failed');
          setError('Unable to reconnect to chat server. Please refresh the page.');
        });

        socketRef.current = socket;

        return () => {
          if (socket.connected) {
            socket.disconnect();
          }
          socketRef.current = null;
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
        setError('Failed to initialize chat connection');
      }
    };

    initializeSocket();
  }, [token, user, apiUrl]);

  // Calculate total unread count
  const unreadCount = Object.values(unreadCounts).reduce((sum, count) => {
    const numCount = Number(count);
    return sum + (isNaN(numCount) ? 0 : numCount);
  }, 0);

  const refreshUnreadCounts = useCallback(async () => {
    if (!token || !user) return;

    try {
      const response = await fetch(`${apiUrl}/api/chats/unread`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch unread counts:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Failed to fetch unread counts: ${response.status} ${response.statusText}`);
      }

      const counts = await response.json();
      if (!Array.isArray(counts)) {
        console.error('Invalid response format for unread counts:', counts);
        throw new Error('Invalid response format for unread counts');
      }

      const newUnreadCounts = counts.reduce((acc: { [key: string]: number }, item: { chatId: string, unreadCount: number }) => {
        const count = Number(item.unreadCount);
        acc[item.chatId] = isNaN(count) ? 0 : count;
        return acc;
      }, {});

      setUnreadCounts(newUnreadCounts);
    } catch (err) {
      console.error('Error fetching unread counts:', err);
      setUnreadCounts({});
      setError('Failed to fetch unread counts');
    }
  }, [token, user, apiUrl]);

  const fetchChats = useCallback(async () => {
    if (!token || !user) return;

    setLoading(true);
    try {
      // Get a fresh token
      const freshToken = await user.getIdToken(true);
      console.log('Fetching chats with token:', freshToken.substring(0, 10) + '...');
      
      const response = await fetch(`${apiUrl}/api/chats`, {
        headers: {
          'Authorization': `Bearer ${freshToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch chats:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Failed to fetch chats: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Invalid response format for chats:', data);
        throw new Error('Invalid response format for chats');
      }

      // Debug log
      console.log('Chats fetched:', {
        count: data.length,
        currentUser: {
          uid: user.uid,
          email: user.email
        },
        firstChat: data[0] ? {
          _id: data[0]._id,
          participants: data[0].participants.map((p: { uid: string; username?: string; email?: string; displayName?: string }) => ({
            uid: p.uid,
            username: p.username,
            email: p.email,
            displayName: p.displayName
          }))
        } : null
      });

      // Ensure participants have the correct structure
      const processedData = data.map(chat => ({
        ...chat,
        participants: chat.participants.map((p: any) => ({
          uid: p.uid,
          username: p.username,
          email: p.email,
          displayName: p.displayName,
          photoURL: p.photoURL
        }))
      }));

      setChats(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setChats([]);
      setError('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [token, user, apiUrl]);

  const fetchMessages = useCallback(async (chatId: string) => {
    if (!token || !user) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [token, user, apiUrl]);

  const handleSetCurrentChat = useCallback(async (chat: Chat | null) => {
    setCurrentChat(chat);
    if (chat?._id) {
      // Mark messages as read when opening chat
      try {
        const response = await fetch(`${apiUrl}/api/chats/${chat._id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const { unreadCount } = await response.json();
          // Update unread counts in the UI
          setUnreadCounts(prev => ({
            ...prev,
            [chat._id]: unreadCount
          }));
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }

      fetchMessages(chat._id);
    } else {
      setMessages([]);
    }
  }, [fetchMessages, token, apiUrl]);

  const sendMessage = async (chatId: string, text: string) => {
    if (!token || !user) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${apiUrl}/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      await refreshUnreadCounts();
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const startChat = async (participantId: string) => {
    if (!token || !user) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${apiUrl}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId }),
      });

      if (!response.ok) throw new Error('Failed to start chat');
      const newChat = await response.json();
      setChats(prev => {
        const exists = prev.some(chat => chat._id === newChat._id);
        return exists ? prev : [...prev, newChat];
      });
      setCurrentChat(newChat);
      return newChat;
    } catch (err) {
      console.error('Error starting chat:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchChats();
      refreshUnreadCounts();
    }
  }, [token, user, fetchChats, refreshUnreadCounts]);

  const value: ChatContextType = {
    chats,
    currentChat,
    messages,
    loading,
    error,
    unreadCounts,
    unreadCount,
    setCurrentChat: handleSetCurrentChat,
    sendMessage,
    startChat,
    refreshUnreadCounts,
    fetchChats,
    socket: socketRef.current,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 