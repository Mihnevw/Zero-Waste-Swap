import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import { useAnalytics } from '../components/AnalyticsProvider';
import { heroImage, vegetablesImage, shoppingBagsImage, bambooImage, shoesImage, coffeeMakerImage, jacketImage, boardGamesImage, yogaMatImage, blenderImage, childrenBooksImage, gardenToolsImage, laptopStandImage, bicycleImage, artSuppliesImage, deskLampImage } from '../assets/placeholders';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { logPageView } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    logPageView('home');
  }, [logPageView]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleListingClick = (listing: any) => {
    // Format the listing data to match our Listing type
    const formattedListing = {
      ...listing,
      images: [listing.image], // Convert single image to images array
      location: {
        address: listing.location,
        latitude: 0,
        longitude: 0
      },
      userId: 'demo',
      userName: 'Demo User',
      userEmail: 'demo@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      condition: 'good',
      status: 'available' as const
    };

    navigate(`/listing/${listing.id}`, {
      state: { listing: formattedListing }
    });
  };

  const featuredListings = [
    {
      id: 1,
      title: 'Organic Vegetables',
      description: 'Fresh organic vegetables from our garden, including tomatoes, cucumbers, and leafy greens',
      image: vegetablesImage,
      location: 'Sofia, Bulgaria',
      category: 'Food',
    },
    {
      id: 2,
      title: 'Reusable Shopping Bags',
      description: 'Set of 5 eco-friendly shopping bags made from recycled materials, durable and washable',
      image: shoppingBagsImage,
      location: 'Plovdiv, Bulgaria',
      category: 'Accessories',
    },
    {
      id: 3,
      title: 'Bamboo Utensils Set',
      description: 'Complete set of bamboo kitchen utensils including spoons, spatulas, and serving tools',
      image: bambooImage,
      location: 'Varna, Bulgaria',
      category: 'Kitchen',
    },
    {
      id: 4,
      title: 'Running Shoes',
      description: 'Nike running shoes, size EU 42, gently used, perfect for beginners',
      image: shoesImage,
      location: 'Burgas, Bulgaria',
      category: 'Clothing',
    },
    {
      id: 5,
      title: 'Coffee Maker',
      description: 'Philips coffee maker, 1.5L capacity, used for 6 months, works perfectly',
      image: coffeeMakerImage,
      location: 'Ruse, Bulgaria',
      category: 'Appliances',
    },
    {
      id: 6,
      title: 'Winter Jacket',
      description: 'Women\'s winter jacket, size M, water-resistant, excellent condition',
      image: jacketImage,
      location: 'Sofia, Bulgaria',
      category: 'Clothing',
    },
    {
      id: 7,
      title: 'Board Games Collection',
      description: 'Collection of popular board games including Monopoly, Scrabble, and Chess',
      image: boardGamesImage,
      location: 'Plovdiv, Bulgaria',
      category: 'Entertainment',
    },
    {
      id: 8,
      title: 'Yoga Mat',
      description: 'Eco-friendly yoga mat made from natural rubber, 4mm thickness, barely used',
      image: yogaMatImage,
      location: 'Varna, Bulgaria',
      category: 'Sports',
    },
    {
      id: 9,
      title: 'Blender',
      description: 'High-speed blender perfect for smoothies and soups, 800W power',
      image: blenderImage,
      location: 'Burgas, Bulgaria',
      category: 'Appliances',
    },
    {
      id: 10,
      title: 'Children\'s Books',
      description: 'Collection of 15 children\'s books in excellent condition, suitable for ages 5-8',
      image: childrenBooksImage,
      location: 'Sofia, Bulgaria',
      category: 'Books',
    },
    {
      id: 11,
      title: 'Garden Tools Set',
      description: 'Complete set of garden tools including shovel, rake, and pruning shears',
      image: gardenToolsImage,
      location: 'Stara Zagora, Bulgaria',
      category: 'Tools',
    },
    {
      id: 12,
      title: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand, ergonomic design, foldable',
      image: laptopStandImage,
      location: 'Veliko Tarnovo, Bulgaria',
      category: 'Electronics',
    },
    {
      id: 13,
      title: 'Bicycle',
      description: 'Mountain bike in good condition, 26" wheels, recently serviced',
      image: bicycleImage,
      location: 'Sofia, Bulgaria',
      category: 'Sports',
    },
    {
      id: 14,
      title: 'Art Supplies',
      description: 'Set of acrylic paints, brushes, and canvas boards, perfect for beginners',
      image: artSuppliesImage,
      location: 'Plovdiv, Bulgaria',
      category: 'Hobbies',
    },
    {
      id: 15,
      title: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness and color temperature',
      image: deskLampImage,
      location: 'Varna, Bulgaria',
      category: 'Electronics',
    }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh' 
    }}>
      <Box sx={{ flex: 1 }}>
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
                sx={{
                  maxWidth: '600px',
                  mx: 'auto',
                  '& .MuiTextField-root': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 1,
                  },
                }}
              >
                <SearchBar
                  value={searchQuery}
                  onChange={(value) => {
                    setSearchQuery(value);
                    handleSearch(value);
                  }}
                  placeholder="Search for items to swap..."
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
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleListingClick(listing)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={listing.image}
                    alt={listing.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {listing.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listing.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {listing.location}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton 
                      aria-label="add to favorites"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle favorite action
                      }}
                    >
                      <FavoriteIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="share"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle share action
                      }}
                    >
                      <ShareIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home; 