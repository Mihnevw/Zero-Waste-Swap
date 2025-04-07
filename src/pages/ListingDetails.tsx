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
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  ArrowBack as ArrowBackIcon,
  ZoomIn as ZoomInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Footer from '../components/Footer';

const ListingDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);

  const listing = location.state?.listing;

  if (!listing) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>
          Listing not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  const handleContactClick = () => {
    setContactDialogOpen(true);
  };

  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          Back to Home
        </Button>

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
                src={listing.image}
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
                <Box>
                  <IconButton>
                    <FavoriteIcon />
                  </IconButton>
                  <IconButton>
                    <ShareIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<CategoryIcon />}
                  label={listing.category}
                  sx={{ mr: 1 }}
                />
                <Chip
                  icon={<LocationIcon />}
                  label={listing.location}
                />
              </Box>

              <Typography variant="h6" color="primary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {listing.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleContactClick}
                >
                  Contact Seller
                </Button>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Listed in {listing.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {listing.location}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Image Dialog for fullscreen view */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="xl"
          fullScreen={isMobile}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box
              component="img"
              src={listing.image}
              alt={listing.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                bgcolor: 'background.paper',
              }}
              onClick={() => setImageDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Contact Seller Dialog */}
        <Dialog
          open={contactDialogOpen}
          onClose={handleCloseContactDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Contact Seller</DialogTitle>
          <DialogContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Seller Name" 
                  secondary={listing.sellerName || "Anonymous User"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={listing.sellerEmail || "Not provided"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone" 
                  secondary={listing.sellerPhone || "Not provided"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Location" 
                  secondary={listing.location} 
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Please be respectful when contacting the seller. All communications should be related to the item listed.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContactDialog}>Close</Button>
            {listing.sellerEmail && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => window.location.href = `mailto:${listing.sellerEmail}`}
              >
                Send Email
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>

      <Footer />
    </Box>
  );
};

export default ListingDetails; 