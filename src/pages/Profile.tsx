import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useListings } from '../hooks/useListings';
import ListingCard from '../components/ListingCard';
import AnimatedPage from '../components/AnimatedPage';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';

const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { listings, loading: listingsLoading } = useListings();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return null;
  }

  const userListings = listings.filter((listing) => {
    console.log('Listing:', listing);
    return listing.userId === user.uid && listing.status === 'active';
  });
  const activeListingsCount = userListings.length;

  return (
    <AnimatedPage animation="fade">
      <Box sx={{ pt: 8 }}>
        <Container maxWidth="lg">
          <AnimatedPage animation="slide" delay={0.2}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Профил
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Управлявайте вашия профил и обяви.
              </Typography>
            </Box>
          </AnimatedPage>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <AnimatedPage animation="scale" delay={0.4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                      <ProfilePhotoUpload />
                      <Typography variant="h6" gutterBottom>
                        {user?.displayName || 'Потребител'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {activeListingsCount} активни обяви
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/settings')}
                      >
                        Настройки
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/create-listing')}
                      >
                        Нова обява
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </AnimatedPage>
            </Grid>

            <Grid item xs={12} md={8}>
              <AnimatedPage animation="slide" delay={0.6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Моите обяви
                  </Typography>
                  {listingsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : userListings.length === 0 ? (
                    <Alert severity="info">
                      Все още нямате публикувани обяви.
                    </Alert>
                  ) : (
                    <Grid container spacing={3}>
                      {userListings.map((listing, index) => (
                        <Grid item xs={12} sm={6} key={listing.id}>
                          <AnimatedPage animation="scale" delay={0.8 + index * 0.1}>
                            <ListingCard listing={listing} />
                          </AnimatedPage>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </AnimatedPage>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </AnimatedPage>
  );
};

export default Profile; 