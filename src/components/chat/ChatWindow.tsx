import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { Message } from '../../types/message';
import { User } from '../../types/user';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Paper,
  Badge,
  useTheme,
  List,
  ListItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ImageIcon from '@mui/icons-material/Image';

const TYPING_TIMER_LENGTH = 3000;

// Type guard for User type
const isUser = (sender: string | User): sender is User => {
  return typeof sender !== 'string' && sender !== null;
};

interface ChatWindowProps {
  chatId: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onClose }) => {
  const { currentChat, messages, sendMessage, socket } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const theme = useTheme();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleMessage = (message: Message) => {
      if (message.chat === chatId) {
        // Messages are managed by the ChatContext
        console.log('New message received:', message);
      }
    };

    const handleTyping = (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.chatId === chatId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    socket.on('message', handleMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('message', handleMessage);
      socket.off('typing', handleTyping);
    };
  }, [socket, chatId]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !chatId || !user) return;

    setIsTyping(true);
    socket.emit('typing', { chatId, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { chatId, isTyping: false });
    }, TYPING_TIMER_LENGTH);
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      await sendMessage(chatId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'MMM d');
    }
  };

  const renderMessageGroup = (message: Message, isLastInGroup: boolean) => {
    const sender = message.sender;
    const isCurrentUser = isUser(sender) ? sender._id === user?.uid : sender === user?.uid;
    
    // Safely get sender name with fallbacks
    const getSenderName = () => {
      if (!sender) return 'Unknown User';
      if (isUser(sender)) {
        return sender.username || sender.displayName || sender.email?.split('@')[0] || 'Unknown User';
      }
      return 'Unknown User';
    };
    
    const senderName = getSenderName();
    
    return (
      <ListItem
        key={message._id}
        sx={{
          display: 'flex',
          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
          alignItems: 'flex-start',
          mb: isLastInGroup ? 1.5 : 0.5,
          px: 2,
          '&:hover': {
            bgcolor: 'transparent',
          },
          position: 'relative',
        }}
        disableGutters
      >
        {!isCurrentUser && isLastInGroup && isUser(message.sender) && (
          <Avatar
            src={message.sender.photoURL || undefined}
            sx={{
              width: 28,
              height: 28,
              mr: 1,
              bgcolor: theme.palette.grey[400],
              position: 'absolute',
              left: theme.spacing(2),
              top: 0,
            }}
          >
            {senderName[0]?.toUpperCase()}
          </Avatar>
        )}
        <Box
          sx={{
            maxWidth: '65%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
            ml: !isCurrentUser ? 5 : 0,
          }}
        >
          {!isCurrentUser && isLastInGroup && (
            <Typography
              variant="caption"
              sx={{
                mb: 0.5,
                ml: 0.5,
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
              }}
            >
              {senderName}
            </Typography>
          )}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: isCurrentUser 
                ? theme.palette.primary.main 
                : theme.palette.grey[100],
              color: isCurrentUser 
                ? theme.palette.primary.contrastText 
                : theme.palette.text.primary,
              borderRadius: 2.5,
              borderTopRightRadius: isCurrentUser && isLastInGroup ? 0 : 2.5,
              borderTopLeftRadius: !isCurrentUser && isLastInGroup ? 0 : 2.5,
              position: 'relative',
              wordBreak: 'break-word',
              maxWidth: '100%',
              boxShadow: `0 1px 2px ${theme.palette.mode === 'dark' 
                ? 'rgba(0,0,0,0.15)' 
                : 'rgba(0,0,0,0.1)'}`,
              '&::before': isLastInGroup ? {
                content: '""',
                position: 'absolute',
                top: 0,
                [isCurrentUser ? 'right' : 'left']: -8,
                borderStyle: 'solid',
                borderWidth: '8px 8px 0 0',
                borderColor: `${isCurrentUser 
                  ? theme.palette.primary.main 
                  : theme.palette.grey[100]} transparent transparent transparent`,
                transform: isCurrentUser ? 'none' : 'scaleX(-1)',
              } : {},
            }}
          >
            <Typography
              variant="body1" 
              sx={{ 
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.4,
              }}
            >
              {message.text}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
                mt: 0.5,
                opacity: 0.7,
                minHeight: 15,
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.7rem',
                  color: isCurrentUser 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.text.secondary,
                  opacity: 0.8,
                }}
              >
                {formatMessageDate(typeof message.createdAt === 'string' 
                  ? message.createdAt 
                  : message.createdAt.toISOString())}
              </Typography>
              {isCurrentUser && (
                <DoneAllIcon 
                  sx={{ 
                    fontSize: 14,
                    color: message.read 
                      ? theme.palette.primary.contrastText 
                      : 'rgba(255,255,255,0.7)',
                    opacity: message.read ? 1 : 0.5,
                  }} 
                />
              )}
            </Box>
          </Paper>
        </Box>
      </ListItem>
    );
  };

  // Render empty state if no chat is selected
  if (!chatId || !currentChat) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 3,
        }}
      >
        <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Select a Chat
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Choose a conversation from the list to start messaging
        </Typography>
      </Box>
    );
  }

  const typingUsersCount = typingUsers.size;
  const otherParticipant = currentChat.participants.find(p => p._id !== user?.uid);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: theme.palette.background.default,
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              color="success"
            >
              <Avatar
                src={otherParticipant?.photoURL}
                alt={otherParticipant?.username}
                sx={{ 
                  width: 45, 
                  height: 45,
                  border: `2px solid ${theme.palette.primary.main}` 
                }}
              >
                {otherParticipant?.username?.[0]?.toUpperCase()}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {otherParticipant?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isTyping ? 'typing...' : 'online'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          bgcolor: theme.palette.background.default,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.95), rgba(255,255,255,.95))',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List sx={{ width: '100%', pt: 2, pb: 2 }}>
          {messages.length > 0 ? (
            messages.map((message, index) => {
              const nextMessage = messages[index + 1];
              const currentSenderId = isUser(message.sender) ? message.sender._id : message.sender;
              const nextSenderId = nextMessage && isUser(nextMessage.sender) 
                ? nextMessage.sender._id 
                : nextMessage?.sender;
              
              const isLastInGroup = !nextMessage || 
                !nextSenderId || 
                !currentSenderId ||
                nextSenderId !== currentSenderId ||
                new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > 300000;

              return renderMessageGroup(message, isLastInGroup);
            })
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          )}
          {typingUsersCount > 0 && (
            <ListItem sx={{ justifyContent: 'flex-start' }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1 }}>U</Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  bgcolor: 'grey.100',
                  borderRadius: 2
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {typingUsersCount === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
                </Typography>
              </Paper>
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Input Area */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <IconButton size="small" color="primary">
          <EmojiEmotionsIcon />
        </IconButton>
        <IconButton size="small" color="primary">
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: theme.palette.grey[50],
            },
          }}
          multiline
          maxRows={4}
        />
        <IconButton 
          type="submit" 
          color="primary" 
          disabled={!newMessage.trim()}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            '&.Mui-disabled': {
              bgcolor: theme.palette.action.disabledBackground,
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default ChatWindow; 