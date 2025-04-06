import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useListings } from '../hooks/useListings';
import ListingCard from '../components/ListingCard';

const Profile = () => {
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

  const userListings = listings.filter((listing) => listing.userId === user.uid);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={user.photoURL || undefined}
              alt={user.displayName || 'User'}
              sx={{ width: 80, height: 80, mr: 2 }}
            />
            <Box>
              <Typography variant="h5" gutterBottom>
                {user.displayName || 'User Profile'}
              </Typography>
              <Typography color="text.secondary">{user.email}</Typography>
            </Box>
          </Box>
        </Paper>

        <Typography variant="h6" sx={{ mb: 2 }}>
          My Listings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {listingsLoading ? (
          <Typography>Loading listings...</Typography>
        ) : userListings.length > 0 ? (
          <Grid container spacing={3}>
            {userListings.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <ListingCard listing={listing} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            You haven't created any listings yet.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Profile; 