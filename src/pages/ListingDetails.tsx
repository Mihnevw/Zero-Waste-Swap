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
  Avatar,
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
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
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
import { collection, getDocs, query, where } from 'firebase/firestore';

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
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  const [otherListings, setOtherListings] = useState<Listing[]>([]);
  const [loadingOtherListings, setLoadingOtherListings] = useState(false);

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
        const listingData = { id: listingDoc.id, ...listingDoc.data() } as Listing;
        setListing(listingData);
        if (listingDoc.id) {
          setIsFavorite(checkIsFavorite(listingDoc.id));
        }

        // Fetch other listings from the same user
        if (listingData.userId) {
          setLoadingOtherListings(true);
          const q = query(
            collection(db, 'listings'),
            where('userId', '==', listingData.userId),
            where('status', '==', 'active')
          );
          const querySnapshot = await getDocs(q);
          const otherListingsData = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Listing))
            .filter(listing => listing.id !== id);
          setOtherListings(otherListingsData);
        }
      } catch (err) {
        setError('Грешка при зареждане на обявата');
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
        setLoadingOtherListings(false);
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
    if (!listing?.id) return;
    navigate(`/edit-listing/${listing.id}`, { state: { listing } });
  };

  const handleDeleteClick = () => {
    if (!listing?.id) return;
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!listing?.id) return;
    
    try {
      setLoading(true);
      // Delete the listing document
      const listingRef = doc(db, 'listings', listing.id);
      await deleteDoc(listingRef);

      // Delete associated images from storage if they exist
      if (listing.images && listing.images.length > 0) {
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

      setSnackbarMessage('Обявата беше изтрита успешно');
      setSnackbarOpen(true);
      navigate('/my-listings');
    } catch (err) {
      setError('Грешка при изтриване на обявата');
      console.error(err);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
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

  const handleImageClick = (image: string) => {
    setEnlargedImage(image);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setEnlargedImage(null);
  };

  const handleShowPhone = () => {
    setShowPhone(!showPhone);
  };

  const formatDate = (date: Listing['createdAt']) => {
    if (!date) return 'неизвестна дата';
    
    try {
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString('bg-BG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else if (typeof date === 'object' && 'seconds' in date) {
        return new Date(date.seconds * 1000).toLocaleDateString('bg-BG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return 'неизвестна дата';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'неизвестна дата';
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
    
    // Extract city from address if available
    const address = location.address || '';
    const cityMatch = address.match(/([^,]+),/);
    const city = cityMatch ? cityMatch[1].trim() : address;
    
    return city || 'Местоположението не е посочено';
  };

  return (
    <AnimatedPage animation="fade">
      <Box sx={{ py: 4 }}>
        <Container>
          <AnimatedPage animation="slide">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <IconButton 
                    onClick={() => navigate(-1)}
                    sx={{ mr: 2 }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
                    {listing.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {user?.uid === listing.userId && (
                      <>
                        <IconButton
                          onClick={handleEditClick}
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
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      {listing.images?.map((image: string, index: number) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box
                            onClick={() => handleImageClick(image)}
                            sx={{
                              cursor: 'pointer',
                              position: 'relative',
                              '&:hover': {
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                  borderRadius: '8px',
                                },
                                '& .zoom-icon': {
                                  opacity: 1,
                                }
                              }
                            }}
                          >
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
                            <ZoomInIcon
                              className="zoom-icon"
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                fontSize: 40,
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                zIndex: 1
                              }}
                            />
                          </Box>
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
                        color={listing.status === 'active' ? 'success' : 'default'}
                      />
                    )}
                  </Box>

                  {listing.location && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      mb: 3,
                      mt: 2,
                      p: 2.5,
                      bgcolor: 'background.default',
                      borderRadius: 1.5,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <LocationIcon color="primary" sx={{ fontSize: 28 }} />
                      <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                        {formatLocation(listing.location)}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <AnimatedPage animation="slide" delay={0.4}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          width: 64, 
                          height: 64,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem'
                        }}
                      >
                        {listing.userName?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h2">
                          {listing.userName || 'Неизвестен потребител'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Член от {formatDate(listing.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Контактна информация
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon color="action" />
                        <Typography variant="body2">
                          {listing.userName || 'Неизвестен потребител'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmailIcon color="action" />
                        <Typography variant="body2">
                          {listing.userEmail}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon color="action" />
                        {showPhone ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {listing.userPhone || 'Няма телефон'}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={handleShowPhone}
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'transparent'
                                }
                              }}
                            >
                              <VisibilityOffIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Button
                            variant="text"
                            size="small"
                            onClick={handleShowPhone}
                            startIcon={<VisibilityIcon />}
                            sx={{ 
                              textTransform: 'none',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'transparent'
                              }
                            }}
                          >
                            Покажи телефон
                          </Button>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Други обяви от този потребител
                      </Typography>
                      {loadingOtherListings ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Typography variant="body2">
                          {otherListings.length} активни обяви
                        </Typography>
                      )}
                      {otherListings.length > 0 && (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                          {otherListings.map((otherListing) => (
                            <Grid item xs={12} sm={6} key={otherListing.id}>
                              <Card
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': {
                                    boxShadow: theme.shadows[4],
                                  },
                                }}
                                onClick={() => navigate(`/listing/${otherListing.id}`)}
                              >
                                <CardMedia
                                  component="img"
                                  height="140"
                                  image={otherListing.images?.[0] || '/placeholder-image.jpg'}
                                  alt={otherListing.title}
                                  sx={{ objectFit: 'cover' }}
                                />
                                <CardContent>
                                  <Typography variant="subtitle1" noWrap>
                                    {otherListing.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {otherListing.description}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<EmailIcon />}
                      onClick={() => window.location.href = `mailto:${listing.userEmail}`}
                      disabled={!listing.userEmail}
                    >
                      Свържи се
                    </Button>
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

      <Dialog
        open={imageDialogOpen}
        onClose={handleCloseImageDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseImageDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          {enlargedImage && (
            <img
              src={enlargedImage}
              alt="Enlarged product"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
};

export default ListingDetails;