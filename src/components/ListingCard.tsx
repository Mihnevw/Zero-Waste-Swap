import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6,
        },
      }}
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      <CardMedia
        component="img"
        height="140"
        image={listing.images?.[0] || '/book.webp'}
        alt={listing.title}
        sx={{
          objectFit: 'cover',
          backgroundColor: 'grey.100',
          minHeight: '140px',
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder-image.jpg';
        }}
      />
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {listing.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {listing.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={listing.category} size="small" />
          <Chip label={listing.condition} size="small" />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Posted by {listing.userName}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ListingCard; 