import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import { useAnalytics } from '../components/AnalyticsProvider';
import { heroImage, vegetablesImage, shoppingBagsImage, bambooImage } from '../assets/placeholders';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { logPageView } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    logPageView('home');
  }, [logPageView]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const featuredListings = [
    {
      id: 1,
      title: 'Organic Vegetables',
      description: 'Fresh organic vegetables from our garden',
      image: vegetablesImage,
      location: 'Sofia, Bulgaria',
      category: 'Food',
    },
    {
      id: 2,
      title: 'Reusable Shopping Bags',
      description: 'Eco-friendly shopping bags made from recycled materials',
      image: shoppingBagsImage,
      location: 'Plovdiv, Bulgaria',
      category: 'Accessories',
    },
    {
      id: 3,
      title: 'Bamboo Utensils Set',
      description: 'Complete set of bamboo kitchen utensils',
      image: bambooImage,
      location: 'Varna, Bulgaria',
      category: 'Kitchen',
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Section */}
      <Box
        sx={{
          width: '100%',
          minHeight: { xs: '50vh', sm: '60vh', md: '70vh' },
          background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          mb: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
          }}
        />
        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              textAlign: 'center',
              color: 'white',
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Typography
              variant={isMobile ? 'h3' : 'h2'}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: { xs: 2, sm: 3 },
              }}
            >
              Welcome to Zero-Waste Swap
            </Typography>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{ 
                mb: { xs: 3, sm: 4 },
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                px: { xs: 2, sm: 0 },
              }}
            >
              Join our community of eco-conscious individuals
            </Typography>
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                maxWidth: '600px',
                mx: 'auto',
                '& .MuiTextField-root': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                  },
                },
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search for items to swap..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" color="primary">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Featured Listings Section */}
      <Container maxWidth={false} sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 4, sm: 6 },
            px: { xs: 2, sm: 0 },
          }}
        >
          Featured Listings
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {featuredListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={listing.image}
                  alt={listing.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h3">
                    {listing.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {listing.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {listing.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {listing.category}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small">
                    <FavoriteIcon />
                  </IconButton>
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box
        sx={{
          width: '100%',
          py: { xs: 6, sm: 8, md: 10 },
          backgroundColor: 'grey.100',
          textAlign: 'center',
          mt: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '1400px' }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              mb: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 0 },
            }}
          >
            Ready to Start Swapping?
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph
            sx={{ 
              mb: { xs: 3, sm: 4 },
              px: { xs: 2, sm: 0 },
            }}
          >
            Join our community and start making a difference today
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ 
              mt: 2,
              px: { xs: 4, sm: 6 },
              py: { xs: 1, sm: 1.5 },
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 