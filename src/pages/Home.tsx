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
import { heroImage, vegetablesImage, shoppingBagsImage, bambooImage, shoesImage, coffeeMakerImage, jacketImage, boardGamesImage, yogaMatImage, blenderImage, childrenBooksImage, gardenToolsImage, laptopStandImage, bicycleImage, artSuppliesImage, deskLampImage, laptopImage  } from '../assets/placeholders';
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
    },
    {
      id: 16,
      title: 'Laptop',
      description: 'Apple MacBook Pro 16" M3 Pro 512GB Space Black',
      image: laptopImage,
      location: 'Sliven, Bulgaria',
      category: 'Electronics',
    }
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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
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
        
        {/* Hero Content */}
        <Container 
          maxWidth={false}
          sx={{ 
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: 'white',
              textAlign: 'center',
              mb: 3,
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Swap, Share, Sustain
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              textAlign: 'center',
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            Join our community of eco-conscious individuals sharing and swapping items
          </Typography>
          <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search for items to swap..."
              fullWidth
            />
          </Box>
        </Container>
      </Box>

      {/* Featured Listings */}
      <Box sx={{ width: '100%', bgcolor: 'background.default' }}>
        <Container 
          maxWidth={false}
          sx={{ 
            py: { xs: 4, sm: 6 },
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 4,
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            Featured Items
          </Typography>
          <Grid container spacing={3}>
            {featuredListings.map((listing) => (
              <Grid item key={listing.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      transition: 'all 0.2s ease-in-out',
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {listing.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {listing.location}
                    </Typography>
                    <Box>
                      <IconButton size="small">
                        <FavoriteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Box>
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