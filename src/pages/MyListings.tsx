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
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }

      try {
        const q = query(
          collection(db, 'listings'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const listingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(listingsData);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to fetch your listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, navigate]);

  const handleEdit = (listingId: string) => {
    navigate(`/edit-listing/${listingId}`);
  };

  const handleDelete = async (listingId: string) => {
    // Implement delete functionality
    console.log('Delete listing:', listingId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 600 }}
          >
            My Listings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/create-listing')}
          >
            Create New Listing
          </Button>
        </Box>

        {listings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You haven't created any listings yet.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Start sharing items with the community!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/create-listing')}
            >
              Create Your First Listing
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {listings.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={listing.images?.[0] || '/placeholder-image.jpg'}
                    alt={listing.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
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
                  <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(listing.id)}
                      title="Edit listing"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(listing.id)}
                      title="Delete listing"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MyListings; 