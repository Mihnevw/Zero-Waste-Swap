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
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [chatId: string]: number }>({});
  const socket = useRef<Socket | null>(null);
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef<{ chats: number; unread: number }>({ chats: 0, unread: 0 });
  const isFetching = useRef<{ chats: boolean; unread: boolean }>({ chats: false, unread: false });

  const apiUrl = process.env.VITE_API_URL || 'http://localhost:3001';

  // Calculate total unread count
  const unreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const refreshUnreadCounts = useCallback(async () => {
    try {
      if (!token || !user) {
        console.log('Skipping unread counts fetch: No token or user');
        return;
      }

      // Clear any existing timeout
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }

      // Check if we're already fetching or if it's too soon to fetch again
      const now = Date.now();
      if (isFetching.current.unread || now - lastFetchTime.current.unread < 5000) {
        return;
      }

      isFetching.current.unread = true;
      lastFetchTime.current.unread = now;

      const response = await fetch(`${apiUrl}/api/chats/unread`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const counts = await response.json();
      console.log('Fetched unread counts:', counts);
      setUnreadCounts(counts.reduce((acc: { [key: string]: number }, item: { chatId: string, unreadCount: number }) => {
        acc[item.chatId] = item.unreadCount;
        return acc;
      }, {}));
    } catch (err) {
      console.error('Error fetching unread counts:', err);
      setUnreadCounts({});
    } finally {
      isFetching.current.unread = false;
    }
  }, [token, user, apiUrl]);

  const fetchChats = useCallback(async () => {
    if (!token || !user) {
      console.log('Skipping chats fetch: No token or user');
      return;
    }

    // Check if we're already fetching or if it's too soon to fetch again
    const now = Date.now();
    if (isFetching.current.chats || now - lastFetchTime.current.chats < 5000) {
      return;
    }

    setLoading(true);
    setError(null);
    isFetching.current.chats = true;
    lastFetchTime.current.chats = now;

    try {
      const response = await fetch(`${apiUrl}/api/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched chats:', data);
      setChats(data);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
      setChats([]);
    } finally {
      setLoading(false);
      isFetching.current.chats = false;
    }
  }, [token, user, apiUrl]);

  const fetchMessages = useCallback(async (chatId: string) => {
    if (!token || !user) {
      console.log('Skipping messages fetch: No token or user');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching messages for chat:', chatId);
      const response = await fetch(`${apiUrl}/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched messages:', data);
      
      // Ensure messages are properly formatted
      const formattedMessages = (data || []).map((msg: any) => ({
        _id: msg._id,
        chat: msg.chat,
        sender: {
          _id: msg.sender._id || msg.sender,
          username: msg.sender.name || msg.sender.email?.split('@')[0] || 'Unknown User',
          email: msg.sender.email,
          displayName: msg.sender.name,
          photoURL: msg.sender.photoURL
        },
        text: msg.text,
        createdAt: msg.createdAt,
        read: msg.read
      }));
      
      console.log('Formatted messages:', formattedMessages);
      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [token, user, apiUrl]);

  // Update setCurrentChat to automatically fetch messages
  const handleSetCurrentChat = useCallback((chat: Chat | null) => {
    setCurrentChat(chat);
    if (chat?._id) {
      fetchMessages(chat._id);
    } else {
      setMessages([]);
    }
  }, [fetchMessages]);

  const sendMessage = async (chatId: string, text: string) => {
    if (!token || !user) {
      throw new Error('Cannot send message: Not authenticated');
    }

    try {
      const response = await fetch(`${apiUrl}/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newMessage = await response.json();
      
      // Format the new message to match the expected structure
      const formattedMessage = {
        _id: newMessage._id,
        chat: newMessage.chat,
        sender: {
          _id: newMessage.sender._id || newMessage.sender,
          username: newMessage.sender.username,
          email: newMessage.sender.email,
          displayName: newMessage.sender.displayName,
          photoURL: newMessage.sender.photoURL
        },
        text: newMessage.text,
        createdAt: newMessage.createdAt,
        read: newMessage.read
      };
      
      setMessages(prev => [...prev, formattedMessage]);
      await refreshUnreadCounts();
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const startChat = async (participantId: string) => {
    if (!token || !user) {
      throw new Error('Cannot start chat: Not authenticated');
    }

    try {
      const response = await fetch(`${apiUrl}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          participantId,
        }),
      });

      if (!response.ok) throw new Error('Failed to start chat');
      const newChat = await response.json();
      
      setChats(prev => {
        // Check if chat already exists
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

  // Update the useEffect for currentChat changes
  useEffect(() => {
    if (currentChat?._id) {
      console.log('Current chat changed, fetching messages:', currentChat._id);
      fetchMessages(currentChat._id);
    } else {
      setMessages([]);
    }
  }, [currentChat?._id, fetchMessages]);

  // Set up socket connection with cleanup
  useEffect(() => {
    if (!token || !user) {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      return;
    }

    const newSocket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      // Initial fetch after socket connection
      fetchChats();
      refreshUnreadCounts();
    });

    newSocket.on('newMessage', async (message: Message) => {
      if (currentChat && message.chat === currentChat._id) {
        setMessages(prev => [...prev, message]);
      }
      // Debounce unread count refresh
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
      refreshTimeout.current = setTimeout(refreshUnreadCounts, 1000);
    });

    socket.current = newSocket;

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    };
  }, [token, user, apiUrl, currentChat, refreshUnreadCounts, fetchChats]);

  // Initial fetch of chats and unread counts with cleanup
  useEffect(() => {
    if (token && user) {
      // Only fetch if we have a socket connection
      if (socket.current?.connected) {
        fetchChats();
        refreshUnreadCounts();
      }
    } else {
      setChats([]);
      setUnreadCounts({});
      setCurrentChat(null);
      setMessages([]);
    }

    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    };
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
    socket: socket.current,
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