import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Paper,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  Snackbar
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import debounce from 'lodash/debounce';
import { formatDistanceToNow } from 'date-fns';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  userEmail: string;
  userName: string;
  createdAt: any;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toggleFavorite, isFavorite } = useFavorites();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get unique categories from listings
  const categories = ['all', ...new Set(listings.map(listing => listing.category))];

  const searchListings = useCallback((searchText: string) => {
    if (!searchText.trim()) {
      setListings([]);
      return () => {};
    }

    setLoading(true);
    setError('');

    try {
      const searchTerms = searchText
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(term => term.length >= 2);

      if (searchTerms.length === 0) {
        setListings([]);
        setLoading(false);
        return () => {};
      }

      const listingsRef = collection(db, 'listings');
      const q = query(listingsRef);

      // Create real-time subscription
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const allListings = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              category: data.category || '',
              condition: data.condition || '',
              images: data.images || [],
              userEmail: data.userEmail || '',
              userName: data.userName || '',
              createdAt: data.createdAt?.toDate() || new Date(),
              location: data.location || { latitude: 0, longitude: 0, address: '' }
            } as Listing;
          });

          // Filter and score listings
          let results = allListings.filter(listing => {
            const titleLower = listing.title.toLowerCase();
            const descriptionLower = listing.description.toLowerCase();
            const categoryLower = listing.category.toLowerCase();
            
            return searchTerms.some(term => 
              titleLower.includes(term) || 
              descriptionLower.includes(term) || 
              categoryLower.includes(term)
            );
          });

          // Apply category filter
          if (categoryFilter !== 'all') {
            results = results.filter(listing => listing.category === categoryFilter);
          }

          // Score and sort results
          let sortedResults = results
            .map(listing => {
              const score = searchTerms.reduce((acc, term) => {
                const titleMatch = listing.title.toLowerCase().includes(term) ? 3 : 0;
                const descMatch = listing.description.toLowerCase().includes(term) ? 1 : 0;
                const categoryMatch = listing.category.toLowerCase().includes(term) ? 2 : 0;
                return acc + titleMatch + descMatch + categoryMatch;
              }, 0);
              return { ...listing, score };
            });

          // Apply sorting
          switch (sortBy) {
            case 'newest':
              sortedResults.sort((a, b) => b.createdAt - a.createdAt);
              break;
            case 'oldest':
              sortedResults.sort((a, b) => a.createdAt - b.createdAt);
              break;
            case 'relevance':
            default:
              sortedResults.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return b.createdAt - a.createdAt;
              });
          }

          setListings(sortedResults.map(({ score, ...listing }) => listing));
          setLoading(false);
        },
        (error) => {
          console.error('Error searching listings:', error);
          setError('Failed to search listings. Please try again.');
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up search:', err);
      setError('Failed to set up search. Please try again.');
      setLoading(false);
      return () => {};
    }
  }, [categoryFilter, sortBy]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      const unsubscribe = searchListings(query);
      return () => {
        unsubscribe();
      };
    }, 300),
    [searchListings]
  );

  useEffect(() => {
    const query = searchParams.get('q');
    let unsubscribe: () => void;
    
    if (query) {
      setSearchQuery(query);
      unsubscribe = searchListings(query);
    }
    
    return () => {
      debouncedSearch.cancel();
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [searchParams, searchListings]);

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    setSearchParams({ q: newQuery });
    debouncedSearch(newQuery);
  };

  const handleListingClick = (listing: Listing) => {
    navigate(`/listing/${listing.id}`, {
      state: { listing }
    });
  };

  const handleFavoriteClick = async (e: React.MouseEvent, listing: Listing) => {
    e.stopPropagation(); // Prevent card click when clicking favorite
    try {
      await toggleFavorite(listing.id);
      setSnackbarMessage(isFavorite(listing.id) ? 'Removed from favorites' : 'Added to favorites');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to update favorites');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 4, 
            background: theme.palette.background.default 
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main 
            }}
          >
            Search Results
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search listings..."
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center'
          }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
                startAdornment={<CategoryIcon sx={{ mr: 1 }} />}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={<SortIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3 
            }}>
              <Typography variant="subtitle1">
                <Badge 
                  badgeContent={listings.length} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.9rem' } }}
                >
                  <Typography component="span" sx={{ mr: 3 }}>Results</Typography>
                </Badge>
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {listings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} key={listing.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                    onClick={() => handleListingClick(listing)}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={listing.images[0] || '/placeholder-image.jpg'}
                        alt={listing.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                        onClick={(e) => handleFavoriteClick(e, listing)}
                      >
                        {isFavorite(listing.id) ? (
                          <FavoriteIcon color="primary" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {listing.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 2
                        }}
                      >
                        {listing.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {listing.location.address}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDistanceToNow(listing.createdAt, { addSuffix: true })}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                      <Chip 
                        label={listing.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={listing.condition}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {listings.length === 0 && !loading && searchQuery && (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 1
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No results found for "{searchQuery}"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search terms or filters
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

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
  );
};

export default Search; 