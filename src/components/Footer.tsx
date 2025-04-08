import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Link as RouterLink } from 'react-router-dom';

interface Category {
  name: string;
  icon: string;
}

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const quickLinks = [
    { title: 'Начало', path: '/' },
    { title: 'За нас', path: '/about' },
    { title: 'Как работи', path: '/how-it-works' },
    { title: 'Създай обява', path: '/create-listing' },
    { title: 'Търсене', path: '/search' },
    { title: 'Контакти', path: '/contact' },
  ];

  const legalLinks = [
    { title: 'Политика за поверителност', path: '/privacy' },
    { title: 'Условия за ползване', path: '/terms' },
  ];

  const categories: Category[] = [
    { name: 'Дрехи', icon: '' },
    { name: 'Електроника', icon: '' },
    { name: 'Книги', icon: '' },
    { name: 'Мебели', icon: '' },
    { name: 'Спортни стоки', icon: '' },
    { name: 'Кухненски принадлежности', icon: '' },
    { name: 'Инструменти', icon: '' },
    { name: 'Други', icon: '' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: { xs: 4, md: 6 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Бързи връзки
            </Typography>
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                component={RouterLink}
                to={link.path}
                color="inherit"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'secondary.light',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                {link.title}
              </Link>
            ))}
          </Grid>

          {/* Categories */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Категории
            </Typography>
            {categories.map((category) => (
              <Link
                key={category.name}
                component={RouterLink}
                to={`/search?category=${encodeURIComponent(category.name)}`}
                color="inherit"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'secondary.light',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                {category.name}
              </Link>
            ))}
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Контакти
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Link
                href="mailto:stilianmihnev@gmail.com"
                color="inherit"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  textDecoration: 'none',
                  '&:hover': { color: 'secondary.light' },
                }}
              >
                <EmailIcon sx={{ mr: 1 }} />
                stilianmihnev@gmail.com
              </Link>
              <Link
                href="tel:+359888123456"
                color="inherit"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  textDecoration: 'none',
                  '&:hover': { color: 'secondary.light' },
                }}
              >
                <PhoneIcon sx={{ mr: 1 }} />
                +359 888 123 456
              </Link>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'secondary.light',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <LocationOnIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Сливен, България
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Правна информация
            </Typography>
            {legalLinks.map((link) => (
              <Link
                key={link.title}
                component={RouterLink}
                to={link.path}
                color="inherit"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'secondary.light',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                {link.title}
              </Link>
            ))}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
          © {new Date().getFullYear()} Zero-Waste Swap Platform. Всички права запазени.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 