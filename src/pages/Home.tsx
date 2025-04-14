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
  IconButton,
  useTheme,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ChatIcon from '@mui/icons-material/Chat';
import { useAnalytics } from '../components/AnalyticsProvider';
import {
  heroImage,
  vegetablesImage,
  shoppingBagsImage,
  shoesImage,
  coffeeMakerImage,
  jacketImage,
  boardGamesImage,
  yogaMatImage,
  blenderImage,
  childrenBooksImage,
  gardenToolsImage,
  laptopStandImage,
  bicycleImage,
  artSuppliesImage,
  deskLampImage,
  laptopImage,
  clothesImage,
  electronicsImage,
  booksImage,
  furnitureImage,
  toysImage,
  sportsImage,
} from '../assets/placeholders';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import AnimatedPage from '../components/AnimatedPage';
import { useChat } from '../contexts/ChatContext';

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
  userId: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { logPageView } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite } = useFavorites();
  const { user, token } = useAuth();
  const { setCurrentChat } = useChat();
  const [error, setError] = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  const categories = [
    { id: 'clothing', name: 'Дрехи', image: clothesImage },
    { id: 'electronics', name: 'Електроника', image: electronicsImage },
    { id: 'books', name: 'Книги', image: booksImage },
    { id: 'furniture', name: 'Мебели', image: furnitureImage },
    { id: 'toys', name: 'Играчки', image: toysImage },
    { id: 'sports', name: 'Спорт', image: sportsImage },
  ];

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
      const listings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Get the user ID from the document path or data
        const userId = data.userId || doc.ref.parent.parent?.id;
        
        if (!userId) {
          console.warn('Listing missing userId:', doc.id);
          console.log('Listing data:', data);
          // If no userId is found, we can't create a chat, so skip this listing
          return null;
        }

        return {
          id: doc.id,
          ...data,
          userId: userId,
          user: {
            _id: userId,
            username: data.userName || data.firstName || 'Anonymous',
            email: data.userEmail || data.email
          },
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Listing;
      }).filter(listing => listing !== null); // Filter out listings without userId

      console.log('Fetched listings:', listings); // Debug log
      setRecentListings(listings);
    } catch (error) {
      console.error('Error fetching recent listings:', error);
      setError('Възникна грешка при зареждане на обявите');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search?category=${categoryId}`);
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
      status: 'active' as const
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

  const handleStartChat = async (e: React.MouseEvent, listing: any) => {
    e.stopPropagation();
    if (!user || !token) {
      navigate('/login');
      return;
    }

    try {
      setStartingChat(listing.id);
      const apiUrl = process.env.VITE_API_URL || 'http://localhost:3001';
      console.log('Starting chat with API URL:', apiUrl);
      console.log('Listing data:', listing);
      
      // Get the participant's Firebase UID
      const participantId = listing.userId || listing.user?._id;
      console.log('Participant ID:', participantId);
      console.log('Current user ID:', user.uid);
      
      if (!participantId) {
        console.error('Missing participant ID in listing:', listing);
        throw new Error('Cannot start chat: User ID not found in listing data');
      }

      if (participantId === user.uid) {
        throw new Error('Cannot start chat with yourself');
      }

      const response = await fetch(`${apiUrl}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participantId })
      });

      console.log('Chat creation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Chat creation error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const chat = await response.json();
      console.log('Chat created successfully:', chat);
      setCurrentChat(chat);
      navigate('/chat');
    } catch (error) {
      console.error('Error starting chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to start chat. Please try again.');
    } finally {
      setStartingChat(null);
    }
  };

  const renderListingCard = (listing: any, isDemoListing: boolean = false) => {
    const listingId = isDemoListing ? `demo_${listing.id}` : listing.id;
    const isFavorite = favorites.includes(listingId);
    const images = isDemoListing ? [listing.image] : listing.images;
    const isStartingChat = startingChat === listingId;

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
        key={`card-${listingId}`}
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
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
            <IconButton
              key={`favorite-${listingId}`}
              size="small"
              sx={{
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
            {!isDemoListing && (
              <IconButton
                key={`chat-${listingId}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
                onClick={(e) => handleStartChat(e, listing)}
                disabled={isStartingChat || !user}
              >
                {isStartingChat ? (
                  <CircularProgress size={20} />
                ) : (
                  <ChatIcon color={user ? 'primary' : 'disabled'} />
                )}
              </IconButton>
            )}
          </Box>
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
              <Chip key={`category-${listingId}`} label={listing.category} size="small" color="primary" variant="outlined" />
              {listing.condition && (
                <Chip key={`condition-${listingId}`} label={listing.condition} size="small" color="secondary" variant="outlined" />
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
      title: 'Kitchen Set',
      description: 'Complete kitchen set including pots, pans, and utensils, lightly used',
      image: blenderImage,
      location: 'Varna, Bulgaria',
      category: 'Other',
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
      category: 'Electronics',
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
    <AnimatedPage animation="fade">
      <Box>
        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            height: '100vh',
            minHeight: 600,
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
            },
          }}
        >
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <AnimatedPage animation="fade" delay={0.2}>
              <Typography
                variant="h2"
                component="h1"
                align="center"
                color="white"
                sx={{
                  mb: 2,
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                Споделете. Обновете. Пазете природата.
              </Typography>
              <Typography
                variant="h4"
                align="center"
                color="white"
                sx={{
                  mb: 4,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                  fontWeight: 300,
                }}
              >
                Вашите вещи заслужават втори шанс
              </Typography>
            </AnimatedPage>
            <AnimatedPage animation="fade" delay={0.4}>
              <SearchBar
                value={searchQuery}
                onChange={handleSearchQueryChange}
                onSearch={handleSearch}
                placeholder="Намерете подходящият за вас продукт..."
              />
            </AnimatedPage>
          </Container>
        </Box>

        {/* Rest of the content */}
        <Box sx={{ mt: -8, position: 'relative', zIndex: 2, bgcolor: 'background.paper' }}>
          {/* Categories Section */}
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <AnimatedPage animation="slide" delay={0.6}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                align="center"
                sx={{
                  mb: 6,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 60,
                    height: 4,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                  },
                }}
              >
                Категории
              </Typography>
            </AnimatedPage>
            <Grid container spacing={4}>
              {categories.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <AnimatedPage animation="scale" delay={0.8 + index * 0.1}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4],
                        },
                      }}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={category.image}
                        alt={category.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" align="center">
                          {category.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </AnimatedPage>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Featured Listings */}
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <AnimatedPage animation="slide" delay={0.6}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                align="center"
                sx={{
                  mb: 6,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 60,
                    height: 4,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                  },
                }}
              >
                Представени обяви
              </Typography>
            </AnimatedPage>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {featuredListings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} key={`featured-${listing.id}`}>
                  {renderListingCard(listing, true)}
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Recent Listings */}
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <AnimatedPage animation="slide" delay={0.6}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                align="center"
                sx={{
                  mb: 6,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 60,
                    height: 4,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                  },
                }}
              >
                Последни обяви
              </Typography>
            </AnimatedPage>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            ) : recentListings.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Все още няма обяви
              </Alert>
            ) : (
              <Grid container spacing={4} sx={{ mt: 2 }}>
                {recentListings.map((listing) => (
                  <Grid item xs={12} sm={6} md={4} key={`recent-${listing.id}`}>
                    {renderListingCard(listing)}
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>

          {/* How It Works Section */}
          <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
            <Container maxWidth="lg">
              <AnimatedPage animation="slide" delay={0.6}>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  align="center"
                  sx={{
                    mb: 6,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 60,
                      height: 4,
                      bgcolor: 'primary.main',
                      borderRadius: 2,
                    },
                  }}
                >
                  Как работи?
                </Typography>
              </AnimatedPage>
              <Grid container spacing={4} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                  <AnimatedPage animation="scale" delay={0.8}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        1. Създайте обява
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Качете снимки и описание на предмета, който искате да обменяте
                      </Typography>
                    </Box>
                  </AnimatedPage>
                </Grid>
                <Grid item xs={12} md={4}>
                  <AnimatedPage animation="scale" delay={1.0}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        2. Намерете подходящ обмен
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Разгледайте обявите и намерете нещо, което ви интересува
                      </Typography>
                    </Box>
                  </AnimatedPage>
                </Grid>
                <Grid item xs={12} md={4}>
                  <AnimatedPage animation="scale" delay={1.2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        3. Договорете обмен
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Свържете се с продавача и договорете детайлите на обмена
                      </Typography>
                    </Box>
                  </AnimatedPage>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </Box>
      <Footer />
    </AnimatedPage>
  );
};

export default Home; 