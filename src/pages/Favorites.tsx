import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useFavorites } from '../hooks/useFavorites';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

// Import the demo listings data
import { featuredListings } from '../data/featuredListings';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  userEmail: string;
  userName: string;
  createdAt: any;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const Favorites = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteListings = async () => {
      if (!user || favorites.length === 0) {
        console.log('No user or no favorites:', { user: !!user, favoritesLength: favorites.length });
        setFavoriteListings([]);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching favorites:', favorites);
        const validFavorites = favorites.map(id => String(id)).filter(id => id.length > 0);
        console.log('Valid favorites:', validFavorites);
        
        if (validFavorites.length === 0) {
          setFavoriteListings([]);
          setLoading(false);
          return;
        }

        const listingPromises = validFavorites.map(async (listingId) => {
          try {
            // Check if it's a demo listing
            if (listingId.startsWith('demo_')) {
              const demoId = parseInt(listingId.replace('demo_', ''));
              const demoListing = featuredListings.find(l => l.id === demoId);
              
              if (demoListing) {
                // Create a new object without the original id to avoid duplication
                const { id: _, ...demoListingWithoutId } = demoListing;
                return {
                  id: listingId, // Use the demo_ prefixed ID
                  ...demoListingWithoutId,
                  images: [demoListing.image],
                  location: {
                    address: demoListing.location,
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
              }
              return null;
            }
            
            // Handle regular listings
            console.log('Fetching listing:', listingId);
            const docRef = doc(db, 'listings', listingId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              console.log('Found listing:', { id: docSnap.id, ...data });
              return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
              };
            }
            
            console.log(`Listing ${listingId} not found, removing from favorites`);
            // Clean up the invalid favorite
            const favoriteId = `${user.uid}_${listingId}`;
            const favoriteRef = doc(db, 'favorites', favoriteId);
            await deleteDoc(favoriteRef);
            return null;
          } catch (err) {
            console.error(`Error fetching listing ${listingId}:`, err);
            return null;
          }
        });

        const listingDocs = await Promise.all(listingPromises);
        const listings = listingDocs
          .filter((doc): doc is Listing => doc !== null)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log('Final listings:', listings);
        setFavoriteListings(listings);
      } catch (err) {
        console.error('Error fetching favorite listings:', err);
        setError('Грешка при зареждане на любими обяви');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteListings();
  }, [user, favorites]);

  const handleListingClick = (listing: Listing) => {
    navigate(`/listing/${listing.id}`, { state: { listing } });
  };

  const handleRemoveFavorite = async (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    await toggleFavorite(listingId);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Моля, влезте в системата, за да видите вашите любими обяви.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Моите любими
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {favoriteListings.length === 0 ? (
        <Alert severity="info">
          Все още нямате добавени обяви в любими.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {favoriteListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
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
                onClick={() => handleListingClick(listing)}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={listing.images?.[0] || '/placeholder-image.jpg'}
                    alt={listing.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                    onClick={(e) => handleRemoveFavorite(e, listing.id)}
                  >
                    <FavoriteIcon color="error" />
                  </IconButton>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {listing.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {listing.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      icon={<LocationIcon />}
                      label={listing.location?.address || 'Местоположението не е посочено'}
                      size="small"
                    />
                    <Chip
                      icon={<TimeIcon />}
                      label={formatDistanceToNow(listing.createdAt, { addSuffix: true })}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Favorites; 