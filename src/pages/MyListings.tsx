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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  const theme = useTheme();

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }

      try {
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

  const handleDelete = async (listingId: string) => {
    // Implement delete functionality
    console.log('Delete listing:', listingId);
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

  if (loading) {
    return (
      <AnimatedPage animation="fade">
        <Box sx={{ pt: 8 }}>
          <Container maxWidth="lg">
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
                      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(listing.id);
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
    </AnimatedPage>
  );
};

export default MyListings; 