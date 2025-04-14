import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  Button,
  Fade,
  Badge,
} from '@mui/material';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import { useChat } from '../contexts/ChatContext';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentChat, setCurrentChat, unreadCount } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    // Hide main navbar and set body background
    const navbar = document.querySelector('nav');
    const body = document.body;
    if (navbar) navbar.style.display = 'none';
    body.style.backgroundColor = theme.palette.background.default;
    
    return () => {
      if (navbar) navbar.style.display = 'flex';
      body.style.backgroundColor = '';
    };
  }, [theme.palette.background.default]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleChatSelect = (chat: any) => {
    setCurrentChat(chat);
    if (isMobile) setMobileOpen(false);
  };

  const handleBack = () => {
    if (currentChat && isMobile) {
      setCurrentChat(null);
      setMobileOpen(true);
    } else {
      navigate('/');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'background.paper',
              boxShadow: theme.shadows[3],
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight="500" color="primary">
              Welcome to Chat
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Please sign in to start connecting with other users in real-time.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                mt: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              Sign In
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  const chatList = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" fontWeight="500">
          Messages
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small">
            <Badge badgeContent={unreadCount} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton size="small">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <ChatList
          onChatSelect={handleChatSelect}
          selectedChatId={currentChat?._id}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            edge="start"
            onClick={handleBack}
            sx={{
              mr: 2,
              color: theme.palette.text.primary,
              '&:hover': { bgcolor: theme.palette.action.hover },
            }}
          >
            {currentChat && isMobile ? <ArrowBackIcon /> : <ArrowBackIcon />}
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            {currentChat && isMobile
              ? currentChat.participants.find(p => p._id !== user.uid)?.username
              : 'Messages'}
          </Typography>
          {isMobile && !currentChat && (
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          bgcolor: theme.palette.background.default,
        }}
      >
        {/* Chat List - Responsive */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: { xs: '100%', sm: 320 },
                bgcolor: theme.palette.background.paper,
              },
            }}
          >
            {chatList}
          </Drawer>
        ) : (
          <Box
            sx={{
              width: 320,
              flexShrink: 0,
              bgcolor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {chatList}
          </Box>
        )}

        {/* Chat Window */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme.palette.background.default,
            ...(isMobile && !currentChat && { display: 'none' }),
          }}
        >
          <ChatWindow 
            chatId={currentChat?._id || ''} 
            onClose={handleBack}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage; 