import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Listing } from '../types/listing';

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setListing({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
            updatedAt: docSnap.data().updatedAt?.toDate(),
          } as Listing);
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        setError('Error fetching listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !listing) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 4 }}>
          {error || 'Listing not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                {listing.title}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label={listing.category} sx={{ mr: 1 }} />
                <Chip label={listing.condition} />
              </Box>
              <Typography variant="body1" paragraph>
                {listing.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Posted by {listing.userName}
              </Typography>
            </Paper>

            <Paper sx={{ height: 400, mb: 3 }}>
              <MapContainer
                center={[listing.location?.latitude || 51.505, listing.location?.longitude || -0.09]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[listing.location?.latitude || 51.505, listing.location?.longitude || -0.09]}>
                  <Popup>{listing.title}</Popup>
                </Marker>
              </MapContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              {user && user.uid === listing.userId ? (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate(`/edit-listing/${listing.id}`)}
                >
                  Edit Listing
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    // Implement contact functionality
                    if (!user) {
                      console.error('No authenticated user');
                      return;
                    }
                    console.log('Contact owner');
                  }}
                >
                  Contact Owner
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ListingDetails; 