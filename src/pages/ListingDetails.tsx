import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  ZoomIn as ZoomInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Facebook as FacebookIcon,
  AccessTime as TimeIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import AnimatedPage from '../components/AnimatedPage';
import { formatDistanceToNow } from 'date-fns';
import { useFavorites } from '../hooks/useFavorites';
import { Listing } from '../types/listing';

const ListingDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const { favorites, toggleFavorite, isFavorite: checkIsFavorite } = useFavorites();
  
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [shareAnchorEl, setShareAnchorEl] = React.useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [listing, setListing] = React.useState<Listing | null>(null);
  const [isFavorite, setIsFavorite] = React.useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError('ID на обявата не е намерен');
        setLoading(false);
        return;
      }

      try {
        const listingDoc = await getDoc(doc(db, 'listings', id));
        if (!listingDoc.exists()) {
          setError('Обявата не е намерена');
          setLoading(false);
          return;
        }
        setListing({ id: listingDoc.id, ...listingDoc.data() } as Listing);
        if (listingDoc.id) {
          setIsFavorite(checkIsFavorite(listingDoc.id));
        }
      } catch (err) {
        setError('Грешка при зареждане на обявата');
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    // Try to get listing from location state first
    const locationListing = location.state?.listing;
    if (locationListing) {
      setListing(locationListing);
      setLoading(false);
    } else {
      fetchListing();
    }
  }, [id, location.state, favorites, checkIsFavorite]);

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShare = async () => {
    if (!listing) return;
    
    try {
      await navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } catch (err) {
      // Share API not supported or user cancelled
      console.log('Share failed:', err);
    }
  };

  const handleContactClick = () => {
    setContactDialogOpen(true);
  };

  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
  };

  const handleEditClick = () => {
    navigate(`/edit-listing/${listing.id}`, { state: { listing } });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!listing) return;
    
    try {
      setLoading(true);
      const listingRef = doc(db, 'listings', listing.id);
      await deleteDoc(listingRef);
      navigate('/my-listings');
    } catch (err) {
      setError('Грешка при изтриване на обявата');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!id || !listing) return;
    
    try {
      await toggleFavorite(id);
      setIsFavorite(!isFavorite);
    } catch (err) {
      setError('Грешка при управление на любими обяви');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!listing) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            Обявата не е намерена
          </Alert>
        </Box>
      </Container>
    );
  }

  const isOwner = user?.uid === listing?.userId;

  const formatLocation = (location: any) => {
    if (!location) return 'Местоположението не е посочено';
    if (typeof location === 'string') return location;
    return location.address || 'Местоположението не е посочено';
  };

  return (
    <AnimatedPage animation="fade">
      <Box sx={{ py: 4 }}>
        <Container>
          <AnimatedPage animation="slide">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" component="h1">
                    {listing.title}
                  </Typography>
                  {user?.uid === listing.userId && (
                    <Box>
                      <IconButton
                        onClick={() => navigate(`/edit-listing/${listing.id}`)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteDialogOpen(true)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      {listing.images?.map((image: string, index: number) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <img
                            src={image}
                            alt={`${listing.title} - Снимка ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '300px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Typography variant="body1" paragraph>
                    {listing.description}
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {listing.category && <Chip label={listing.category} color="primary" />}
                    {listing.condition && <Chip label={listing.condition} color="secondary" />}
                    {listing.status && (
                      <Chip 
                        label={listing.status} 
                        color={listing.status === 'налично' ? 'success' : 'default'} 
                      />
                    )}
                  </Box>

                  {listing.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationIcon color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {formatLocation(listing.location)}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <AnimatedPage animation="slide" delay={0.4}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Информация за продавача
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {listing.userName || 'Неизвестен потребител'}
                    </Typography>
                    {listing.userEmail && (
                      <>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {listing.userEmail}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => window.location.href = `mailto:${listing.userEmail}`}
                        >
                          Свържи се
                        </Button>
                      </>
                    )}
                  </Paper>
                </AnimatedPage>
              </Grid>
            </Grid>
          </AnimatedPage>
        </Container>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <AnimatedPage animation="fade">
          <DialogTitle>Потвърди изтриване</DialogTitle>
          <DialogContent>
            Сигурни ли сте, че искате да изтриете тази обява? Това действие не може да бъде отменено.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Отказ</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Изтрий'}
            </Button>
          </DialogActions>
        </AnimatedPage>
      </Dialog>
    </AnimatedPage>
  );
};

export default ListingDetails;