import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  useTheme,
  Badge,
} from '@mui/material';
import { format, isToday, isYesterday, isValid } from 'date-fns';

interface ChatListItemProps {
  chat: {
    _id: string;
    participants: Array<{
      uid: string;
      username?: string;
      email?: string;
      displayName?: string;
      photoURL?: string;
      online?: boolean;
    }>;
    lastMessage?: {
      text: string;
      createdAt: string;
    };
    updatedAt: string;
  };
  currentUserId: string;
  selected: boolean;
  onClick: () => void;
  unreadCount?: number;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  currentUserId,
  selected,
  onClick,
  unreadCount = 0,
}) => {
  const theme = useTheme();
  
  // Debug log for all participants
  console.log('ChatListItem participants:', {
    chatId: chat._id,
    allParticipants: chat.participants.map(p => ({
      uid: p.uid,
      username: p.username,
      email: p.email,
      displayName: p.displayName
    })),
    currentUserId
  });

  const otherParticipant = chat.participants.find(p => p.uid !== currentUserId);

  // Debug log for other participant
  console.log('ChatListItem otherParticipant:', {
    chatId: chat._id,
    currentUserId,
    otherParticipant: otherParticipant ? {
      uid: otherParticipant.uid,
      username: otherParticipant.username,
      email: otherParticipant.email,
      displayName: otherParticipant.displayName
    } : null
  });

  // Get display name from available fields
  const getDisplayName = () => {
    if (!otherParticipant) return 'Unknown User';
    if (otherParticipant.username) return otherParticipant.username;
    if (otherParticipant.displayName) return otherParticipant.displayName;
    if (otherParticipant.email) return otherParticipant.email.split('@')[0];
    return 'Unknown User';
  };

  // Get avatar text from name
  const getAvatarText = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!isValid(date)) return '';

    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <ListItem
      button
      selected={selected}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        transition: 'all 0.2s ease',
        '&.Mui-selected': {
          backgroundColor: `${theme.palette.primary.main}15`,
          '&:hover': {
            backgroundColor: `${theme.palette.primary.main}25`,
          },
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <ListItemAvatar>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          color="success"
          invisible={!otherParticipant?.online}
        >
          <Avatar
            src={otherParticipant?.photoURL}
            sx={{
              width: 48,
              height: 48,
              bgcolor: theme.palette.primary.main,
              fontSize: '1.2rem',
              fontWeight: 500,
            }}
          >
            {getAvatarText()}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primaryTypographyProps={{
          component: 'div',
          sx: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }}
        primary={
          <>
            <Typography variant="subtitle1" fontWeight={500}>
              {getDisplayName()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(chat.updatedAt)}
            </Typography>
          </>
        }
        secondaryTypographyProps={{
          component: 'div',
          sx: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 0.5
          }
        }}
        secondary={
          <>
            <Typography
              variant="body2"
              color={unreadCount > 0 ? 'text.primary' : 'text.secondary'}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '70%',
                fontWeight: unreadCount > 0 ? 500 : 400,
              }}
            >
              {chat.lastMessage?.text || 'No messages yet'}
            </Typography>
            {unreadCount > 0 && (
              <Badge
                badgeContent={unreadCount}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    right: -3,
                    top: 3,
                  },
                }}
              />
            )}
          </>
        }
      />
    </ListItem>
  );
};

export default ChatListItem; 