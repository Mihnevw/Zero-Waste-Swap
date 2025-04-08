import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
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
} from '@mui/icons-material';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ListingDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [shareAnchorEl, setShareAnchorEl] = React.useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const listing = location.state?.listing;

  if (!listing) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>
          Listing not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite(listing.id);
      setSnackbarMessage(isFavorite(listing.id) ? 'Removed from favorites' : 'Added to favorites');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to update favorites');
    }
  };

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShare = (platform: string) => {
    const listingUrl = `${window.location.origin}/listing/${listing.id}`;
    const title = encodeURIComponent(listing.title);
    const text = encodeURIComponent(`Check out this listing: ${listing.title}`);
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${listingUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${listingUrl}&text=${text}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${listingUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${text}%20${listingUrl}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
    handleShareClose();
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

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteDoc(doc(db, 'listings', listing.id));
      navigate('/profile');
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError('Failed to delete listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user?.uid === listing.userId;

  const formatLocation = (location: any) => {
    if (!location) return 'Location not specified';
    if (typeof location === 'string') return location;
    return location.address || 'Location not specified';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Box>
            <IconButton
              onClick={handleFavoriteClick}
              color="primary"
              aria-label={isFavorite(listing.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite(listing.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton
              onClick={handleShareClick}
              color="primary"
              aria-label="Share listing"
            >
              <ShareIcon />
            </IconButton>
            {isOwner && (
              <>
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{ ml: 1 }}
                >
                  Edit
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteClick}
                  color="error"
                  sx={{ ml: 1 }}
                >
                  Delete
                </Button>
              </>
            )}
          </Box>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={4}>
          {/* Left Column - Image */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                position: 'relative',
                cursor: 'zoom-in',
                '&:hover .zoom-icon': {
                  opacity: 1,
                },
              }}
              onClick={() => setImageDialogOpen(true)}
            >
              <Box
                component="img"
                src={listing.images?.[0] || '/placeholder-image.jpg'}
                alt={listing.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  bgcolor: 'background.paper',
                }}
              />
              <Box
                className="zoom-icon"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  p: 1,
                }}
              >
                <ZoomInIcon sx={{ color: 'white', fontSize: 40 }} />
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Details */}
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {listing.title}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<CategoryIcon />}
                  label={listing.category || 'Uncategorized'}
                  sx={{ mr: 1 }}
                />
                <Chip
                  icon={<LocationIcon />}
                  label={formatLocation(listing.location)}
                />
              </Box>

              <Typography variant="body1" paragraph>
                {listing.description}
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleContactClick}
                  fullWidth
                >
                  Contact Seller
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Contact Dialog */}
        <Dialog open={contactDialogOpen} onClose={handleCloseContactDialog}>
          <DialogTitle>Contact Information</DialogTitle>
          <DialogContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Seller"
                  secondary={listing.userName || 'Anonymous'}
                />
              </ListItem>
              {listing.userEmail && (
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email"
                    secondary={listing.userEmail}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Location"
                  secondary={formatLocation(listing.location)}
                />
              </ListItem>
            </List>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Please be respectful and follow our community guidelines when contacting sellers.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContactDialog}>Close</Button>
            {listing.userEmail && (
              <Button
                variant="contained"
                color="primary"
                href={`mailto:${listing.userEmail}?subject=Regarding your listing: ${listing.title}`}
              >
                Send Email
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Image Dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent>
            <Box
              component="img"
              src={listing.images?.[0] || '/placeholder-image.jpg'}
              alt={listing.title}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Listing</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this listing? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Menu
          anchorEl={shareAnchorEl}
          open={Boolean(shareAnchorEl)}
          onClose={handleShareClose}
        >
          <MenuItem onClick={() => handleShare('whatsapp')}>
            <ListItemIcon>
              <WhatsAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>WhatsApp</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleShare('telegram')}>
            <ListItemIcon>
              <TelegramIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Telegram</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleShare('facebook')}>
            <ListItemIcon>
              <FacebookIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Facebook</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleShare('email')}>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Email</ListItemText>
          </MenuItem>
        </Menu>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </Box>
  );
};

export default ListingDetails; 