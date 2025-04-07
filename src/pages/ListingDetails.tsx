import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Listing } from '../types/listing';

// Move defaultLocation to the top level, outside of the component
const DEFAULT_LOCATION = { latitude: 42.7339, longitude: 25.4855 };

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Function to extract username from email
  const getUsernameFromEmail = (email: string | undefined | null) => {
    if (!email) return 'Unknown User';
    return email.split('@')[0];
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Create a properly typed listing object
          const listingData: Listing = {
            id: docSnap.id,
            title: data.title,
            description: data.description,
            category: data.category,
            condition: data.condition,
            images: data.images || [],
            userId: data.userId,
            userName: getUsernameFromEmail(data.userEmail), // Extract username from email
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            location: data.location || DEFAULT_LOCATION,
            status: data.status || 'available'
          };
          
          console.log('Fetched listing data:', listingData);
          setListing(listingData);
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Error fetching listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Function to handle missing images
  const getImageUrl = () => {
    if (listing?.images && listing.images.length > 0) {
      console.log('Using image URL:', listing.images[0]);
      return listing.images[0];
    }
    console.log('No image available, using default');
    return '/book.webp';
  };

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
            <Card>
              <CardMedia
                component="img"
                height="240"
                image={getImageUrl()}
                alt={listing.title}
                sx={{
                  objectFit: 'contain',
                  bgcolor: 'background.paper',
                }}
                onError={(e) => {
                  console.error('Error loading image:', e);
                  e.currentTarget.src = '/book.webp';
                }}
              />
              <CardContent>
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
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Posted by {listing.userName}
                  {listing.createdAt && (
                    <span> on {listing.createdAt.toLocaleDateString('en-GB')}</span>
                  )}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ height: 400, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                <MapContainer
                  center={[listing.location?.latitude || DEFAULT_LOCATION.latitude, listing.location?.longitude || DEFAULT_LOCATION.longitude]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[listing.location?.latitude || DEFAULT_LOCATION.latitude, listing.location?.longitude || DEFAULT_LOCATION.longitude]}>
                    <Popup>{listing.title}</Popup>
                  </Marker>
                </MapContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ListingDetails; 