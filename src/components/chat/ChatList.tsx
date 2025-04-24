import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  TextField,
  List,
  InputAdornment,
  CircularProgress,
  Paper,
  useTheme,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChatListItem from './ChatListItem';
import { Chat } from '../../types/chat';
import { User } from '../../types/user';

interface ChatListProps {
  onChatSelect?: (chat: Chat) => void;
  selectedChatId?: string;
}

// Helper function to convert Chat to ChatListItem format
const convertChatToListItem = (chat: Chat) => {
  // Ensure we have valid participants
  const participants = chat.participants?.map(p => {
    // Log the raw participant data
    console.log('Raw participant data:', p);

    // Ensure all required fields are present with proper type checking
    const participant = {
      uid: typeof p === 'object' && p ? p.uid || 'unknown' : 'unknown',
      username: typeof p === 'object' && p ? p.username || 'user' : 'user',
      displayName: typeof p === 'object' && p ? p.displayName || 'Unknown User' : 'Unknown User',
      email: typeof p === 'object' && p ? p.email || '' : '',
      photoURL: typeof p === 'object' && p ? p.photoURL || undefined : undefined,
      online: typeof p === 'object' && p ? p.online || false : false
    };

    // Log the processed participant data
    console.log('Processed participant data:', participant);

    return participant;
  }) || [];

  // Log the final participants array
  console.log('Final participants array:', participants);

  // Handle lastMessage safely
  const lastMessage = chat.lastMessage ? {
    text: chat.lastMessage.text || '',
    createdAt: typeof chat.lastMessage.createdAt === 'string'
      ? chat.lastMessage.createdAt
      : chat.lastMessage.createdAt instanceof Date
        ? chat.lastMessage.createdAt.toISOString()
        : new Date().toISOString()
  } : undefined;

  const chatListItem = {
    _id: chat._id,
    participants,
    lastMessage,
    updatedAt: chat.updatedAt || new Date().toISOString()
  };

  // Log the final chat list item
  console.log('Final chat list item:', chatListItem);

  return chatListItem;
};

const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const { chats, currentChat, setCurrentChat, fetchChats, loading, error } = useChat();
  const { user } = useAuth();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  const filteredChats = chats.filter((chat: Chat) => {
    const otherParticipant = chat.participants.find((p: User) => p.uid !== user?.uid);
    const searchString = [
      otherParticipant?.username,
      otherParticipant?.displayName,
      otherParticipant?.email
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleChatSelect = (chat: Chat) => {
    setCurrentChat(chat);
    if (onChatSelect) {
      onChatSelect(chat);
    }
  };

  if (!user) {
    return (
      <Paper
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          textAlign: 'center',
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Welcome to Chat
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Please log in to start chatting with other users.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href="/login"
          startIcon={<PersonAddIcon />}
        >
          Sign In
        </Button>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search conversations..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: theme.palette.grey[50],
              transition: theme.transitions.create(['box-shadow', 'background-color']),
              '&:hover': {
                backgroundColor: theme.palette.grey[100],
              },
              '&.Mui-focused': {
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
              },
            },
          }}
        />
      </Paper>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 1,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => fetchChats()}
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          </Box>
        ) : filteredChats.length > 0 ? (
          <List disablePadding>
            {filteredChats.map((chat: Chat) => (
              <ChatListItem
                key={chat._id}
                chat={convertChatToListItem(chat)}
                currentUserId={user.uid}
                selected={chat._id === (selectedChatId || currentChat?._id)}
                onClick={() => handleChatSelect(chat)}
                unreadCount={chat.unreadCount}
              />
            ))}
          </List>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3,
              textAlign: 'center',
            }}
          >
            <ChatBubbleOutlineIcon
              sx={{
                fontSize: 48,
                color: theme.palette.text.secondary,
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {searchQuery
                ? 'Try a different search term'
                : 'Start a new conversation to connect with others'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatList; 