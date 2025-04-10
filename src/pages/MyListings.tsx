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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { db, storage } from '../config/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import AnimatedPage from '../components/AnimatedPage';
import { useTheme } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, 'listings'),
          where('userId', '==', user.uid),
          where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        const listingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(listingsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Грешка при зареждане на вашите обяви. Моля, опитайте отново по-късно.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, navigate]);

  const handleEdit = (listingId: string) => {
    navigate(`/edit-listing/${listingId}`);
  };

  const handleDeleteClick = (listingId: string) => {
    setListingToDelete(listingId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;

    try {
      setIsDeleting(true);
      // Delete the listing document
      const listingRef = doc(db, 'listings', listingToDelete);
      await deleteDoc(listingRef);

      // Delete associated images from storage if they exist
      const listing = listings.find(l => l.id === listingToDelete);
      if (listing?.images && listing.images.length > 0) {
        for (const imageUrl of listing.images) {
          try {
            // Extract the path from the URL
            const imagePath = imageUrl.split('listings/')[1];
            if (imagePath) {
              const imageRef = ref(storage, `listings/${imagePath}`);
              await deleteObject(imageRef);
            }
          } catch (imageError) {
            console.error('Error deleting image:', imageError);
          }
        }
      }

      // Update the local state
      setListings(listings.filter(l => l.id !== listingToDelete));
      setError(null);
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError('Грешка при изтриване на обявата. Моля, опитайте отново.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'неизвестна дата';
    
    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (typeof date === 'object' && 'seconds' in date) {
        dateObj = new Date(date.seconds * 1000);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        return 'неизвестна дата';
      }

      if (isNaN(dateObj.getTime())) {
        return 'неизвестна дата';
      }

      return formatDistanceToNow(dateObj, { addSuffix: true, locale: bg });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'неизвестна дата';
    }
  };

  const renderHeader = () => (
    <AnimatedPage animation="slide" delay={0.2}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Моите обяви
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-listing')}
        >
          Нова обява
        </Button>
      </Box>
    </AnimatedPage>
  );

  if (loading && !isDeleting) {
    return (
      <AnimatedPage animation="fade">
        <Box sx={{ pt: 8 }}>
          <Container maxWidth="lg">
            {renderHeader()}
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          </Container>
        </Box>
      </AnimatedPage>
    );
  }

  if (error) {
    return (
      <AnimatedPage animation="fade">
        <Box sx={{ pt: 8 }}>
          <Container maxWidth="lg">
            {renderHeader()}
            <Alert severity="error" sx={{ mt: 4 }}>
              {error}
            </Alert>
          </Container>
        </Box>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage animation="fade">
      <Box sx={{ pt: 8 }}>
        <Container maxWidth="lg">
          {renderHeader()}

          {listings.length === 0 ? (
            <AnimatedPage animation="fade" delay={0.6}>
              <Alert severity="info" sx={{ mt: 4 }}>
                Все още нямате публикувани обяви.
              </Alert>
            </AnimatedPage>
          ) : (
            <Grid container spacing={4}>
              {listings.map((listing, index) => (
                <Grid item xs={12} sm={6} md={4} key={listing.id}>
                  <AnimatedPage animation="scale" delay={0.4 + index * 0.1}>
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
                      onClick={() => handleEdit(listing.id)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={listing.images?.[0] || '/placeholder-image.jpg'}
                        alt={listing.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(listing.createdAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {listing.city}, {listing.region}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(listing.id);
                          }}
                          title="Изтрий обява"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </AnimatedPage>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Потвърждение за изтриване</DialogTitle>
        <DialogContent>
          <Typography>
            Сигурни ли сте, че искате да изтриете тази обява? Това действие не може да бъде отменено.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Отказ
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Изтриване...' : 'Изтрий'}
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
};

export default MyListings; 