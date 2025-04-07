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
  Button,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
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

  // Get first letter of display name or email for avatar
  const getAvatarText = () => {
    console.log('User data:', {
      displayName: user.displayName,
      email: user.email,
      uid: user.uid
    });
    
    if (user.displayName && user.displayName.trim().length > 0) {
      return user.displayName.trim()[0].toUpperCase();
    }
    if (user.email && user.email.trim().length > 0) {
      return user.email.trim()[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 4,
            mb: 4,
            borderRadius: 2,
            background: 'linear-gradient(to right, #f5f5f5, #ffffff)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={user.photoURL || undefined}
              alt={user.displayName || user.email || 'User'}
              sx={{ 
                width: 100,
                height: 100,
                mr: 3,
                fontSize: '2.5rem',
                bgcolor: 'primary.main'
              }}
            >
              {getAvatarText()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{ 
                    fontWeight: 600,
                    mr: 2
                  }}
                >
                  {user.displayName || 'User Profile'}
                </Typography>
                <Button
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => navigate('/settings')}
                >
                  Edit Profile
                </Button>
              </Box>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            My Listings ({userListings.length})
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/create-listing')}
          >
            Create New Listing
          </Button>
        </Box>
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
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: 'background.default'
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              You haven't created any listings yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/create-listing')}
              sx={{ mt: 2 }}
            >
              Create Your First Listing
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Profile; 