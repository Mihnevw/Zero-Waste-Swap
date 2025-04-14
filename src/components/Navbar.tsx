import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Recycling as RecyclingIcon,
  Add as AddIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../contexts/ChatContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const pages = [
    { title: 'Начало', path: '/' },
    { title: 'Търсене', path: '/search' },
    { title: 'Как работи', path: '/how-it-works' },
    { title: 'За нас', path: '/about' },
    { title: 'Контакти', path: '/contact' },
  ];

  const userMenuItems = user ? [
    { title: 'Профил', path: '/profile' },
    { title: 'Моите обяви', path: '/my-listings' },
    { title: 'Любими', path: '/favorites' },
    { title: 'Настройки', path: '/settings' },
    { title: 'Изход', action: logout },
  ] : [
    { title: 'Вход', path: '/login' },
    { title: 'Регистрация', path: '/register' },
  ];

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuItemClick = (path?: string, action?: () => void) => {
    if (action) {
      action();
    } else if (path) {
      navigate(path);
    }
    handleCloseNavMenu();
    handleCloseUserMenu();
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo - visible on desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
            <IconButton
              onClick={() => navigate('/')}
              sx={{ p: 0, color: 'primary.main' }}
            >
              <RecyclingIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.title}
                  onClick={() => handleMenuItemClick(page.path)}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo - visible on mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
            <IconButton
              onClick={() => navigate('/')}
              sx={{ p: 0, color: 'primary.main' }}
            >
              <RecyclingIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                onClick={() => handleMenuItemClick(page.path)}
                sx={{
                  my: 2,
                  color: 'text.primary',
                  display: 'block',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Chat Icon */}
          {user && (
            <Tooltip title="Съобщения">
              <IconButton
                onClick={() => navigate('/chat')}
                sx={{ mr: 2, color: 'text.primary' }}
              >
                <Badge 
                  badgeContent={unreadCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#ff1744',
                      color: '#fff',
                      fontWeight: 'bold',
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '10px',
                    }
                  }}
                >
                  <ChatIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Create Listing Button */}
          {user && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={() => navigate('/create-listing')}
              sx={{ mr: 2 }}
            >
              {isMobile ? 'Добави' : 'Създай обява'}
            </Button>
          )}

          {/* User Menu */}
          <Box sx={{ flexShrink: 0 }}>
            <Tooltip title={user ? 'Настройки на профила' : 'Вход'}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt={user?.displayName || 'User'}
                  src={user?.photoURL || undefined}
                  sx={{
                    bgcolor: user ? 'primary.main' : 'grey.400',
                    width: 40,
                    height: 40,
                  }}
                >
                  {user?.displayName?.[0] || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {userMenuItems.map((item) => (
                <MenuItem
                  key={item.title}
                  onClick={() => handleMenuItemClick(item.path, item.action)}
                >
                  <Typography textAlign="center">{item.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 