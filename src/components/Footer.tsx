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

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const quickLinks = [
    { title: 'Home', path: '/' },
    { title: 'About Us', path: '/about' },
    { title: 'How It Works', path: '/how-it-works' },
    { title: 'Create Listing', path: '/create-listing' },
    { title: 'Search', path: '/search' },
    { title: 'Contact', path: '/contact' },
  ];

  const categories = [
    'Clothing',
    'Electronics',
    'Books',
    'Furniture',
    'Sports Equipment',
    'Kitchen',
    'Tools',
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
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                component={RouterLink}
                to={link.path}
                color="inherit"
                sx={{
                  display: 'block',
                  mb: 1,
                  '&:hover': {
                    color: 'secondary.light',
                  },
                }}
              >
                {link.title}
              </Link>
            ))}
          </Grid>

          {/* Categories */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            {categories.map((category) => (
              <Link
                key={category}
                component={RouterLink}
                to={`/search?category=${category}`}
                color="inherit"
                sx={{
                  display: 'block',
                  mb: 1,
                  '&:hover': {
                    color: 'secondary.light',
                  },
                }}
              >
                {category}
              </Link>
            ))}
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1 }} />
              <Link href="mailto:stilianmihnev@gmail.com" color="inherit">
                stilianmihnev@gmail.com
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1 }} />
              <Link href="tel:+359888123456" color="inherit">
                +359 888 123 456
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                Sliven, Bulgaria
              </Typography>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Follow Us
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="Facebook" href="https://www.facebook.com/stilian.mihnev">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn" href='https://www.linkedin.com/in/stilian-mihnev/'>
                <LinkedInIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Join our community for updates and eco-friendly tips!
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="inherit">
            © {new Date().getFullYear()} Zero-Waste Swap. All rights reserved.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Link color="inherit" sx={{ mx: 1 }} component={RouterLink} to="/privacy">
              Privacy Policy
            </Link>
            |
            <Link color="inherit" sx={{ mx: 1 }} component={RouterLink} to="/terms">
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 