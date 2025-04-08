import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAnalytics } from '../components/AnalyticsProvider';
import { heroImage, vegetablesImage, shoppingBagsImage, bambooImage, shoesImage, coffeeMakerImage, jacketImage, boardGamesImage, yogaMatImage, blenderImage, childrenBooksImage, gardenToolsImage, laptopStandImage, bicycleImage, artSuppliesImage, deskLampImage, laptopImage } from '../assets/placeholders';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  userEmail: string;
  userName: string;
  createdAt: Date;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { logPageView } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    logPageView('home');
    fetchRecentListings();
  }, [logPageView]);

  const fetchRecentListings = async () => {
    try {
      const q = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc'),
        limit(8)
      );
      const querySnapshot = await getDocs(q);
      const listings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Listing[];
      setRecentListings(listings);
    } catch (error) {
      console.error('Error fetching recent listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleListingClick = (listing: any, isDemoListing: boolean = false) => {
    const listingId = isDemoListing ? `demo_${listing.id}` : listing.id;
    const formattedListing = isDemoListing ? {
      id: listingId,
      ...listing,
      images: [listing.image],
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
    } : listing;

    navigate(`/listing/${listingId}`, {
      state: { listing: formattedListing }
    });
  };

  const handleFavoriteClick = async (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    if (user) {
      await toggleFavorite(listingId);
    } else {
      navigate('/login');
    }
  };

  const renderListingCard = (listing: any, isDemoListing: boolean = false) => {
    const listingId = isDemoListing ? `demo_${listing.id}` : listing.id;
    const isFavorite = favorites.includes(listingId);
    const images = isDemoListing ? [listing.image] : listing.images;
    
    // Safely handle location data
    let locationText = 'Location not specified';
    if (isDemoListing && listing.location) {
      locationText = listing.location;
    } else if (listing.location) {
      locationText = typeof listing.location === 'string' 
        ? listing.location 
        : listing.location.address || 'Location not specified';
    }

    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4]
          }
        }}
        onClick={() => handleListingClick(listing, isDemoListing)}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={images?.[0] || '/placeholder-image.jpg'}
            alt={listing.title}
            sx={{ objectFit: 'cover' }}
          />
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
            onClick={(e) => handleFavoriteClick(e, listingId)}
          >
            {isFavorite ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
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
              mb: 2
            }}
          >
            {listing.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {locationText}
            </Typography>
          </Box>
          {!isDemoListing && listing.category && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label={listing.category} size="small" color="primary" variant="outlined" />
              {listing.condition && (
                <Chip label={listing.condition} size="small" color="secondary" variant="outlined" />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
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
    },
  ];

  return (
    <>
      <Box
        sx={{
          background: `url(${heroImage}) no-repeat center center`,
          backgroundSize: 'cover',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          mb: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            textAlign: 'center',
            color: 'white',
            px: 2,
          }}
        >
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Zero Waste Swap Platform
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Give your items a second life and help reduce waste
          </Typography>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search for items..."
            />
          </Box>
        </Box>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Recent Listings" />
            <Tab label="Featured Items" />
          </Tabs>

          {activeTab === 0 && (
            <>
              <Grid container spacing={3}>
                {recentListings.map((listing) => (
                  <Grid item xs={12} sm={6} md={3} key={listing.id}>
                    {renderListingCard(listing)}
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/search')}
                >
                  View All Listings
                </Button>
              </Box>
            </>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              {featuredListings.map((listing) => (
                <Grid item xs={12} sm={6} md={3} key={listing.id}>
                  {renderListingCard(listing, true)}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default Home; 