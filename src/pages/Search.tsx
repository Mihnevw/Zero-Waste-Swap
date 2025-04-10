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
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Snackbar
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Category as CategoryIcon,
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
import AnimatedPage from '../components/AnimatedPage';
import { SelectChangeEvent } from '@mui/material';

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
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const { toggleFavorite, isFavorite } = useFavorites();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const defaultCategories = [
    'all',
    'Дрехи',
    'Електроника',
    'Книги',
    'Мебели',
    'Спортни стоки',
    'Други'
  ];

  // Category mapping
  const categoryMap: { [key: string]: string } = {
    'all': 'all',
    'clothing': 'Дрехи',
    'electronics': 'Електроника',
    'books': 'Книги',
    'furniture': 'Мебели',
    'sports': 'Спортни стоки',
    'other': 'Други',
    // Reverse mapping
    'Дрехи': 'Дрехи',
    'Електроника': 'Електроника',
    'Книги': 'Книги',
    'Мебели': 'Мебели',
    'Спортни стоки': 'Спортни стоки',
    'Други': 'Други'
  } as const;

  // Get unique categories from listings
  const categories = [...new Set([...defaultCategories, ...listings.map(listing => listing.category)])];

  // Update category filter when URL changes
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      // Map English category to Bulgarian
      setCategoryFilter(categoryMap[category.toLowerCase()] || 'all');
    }
  }, [searchParams]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const newCategory = event.target.value;
    setCategoryFilter(newCategory);
    
    // Update URL parameters while preserving the search query if it exists
    const query = searchParams.get('q');
    const newParams: { q?: string; category?: string } = {};
    if (query) {
      newParams.q = query;
    }
    if (newCategory !== 'all') {
      newParams.category = newCategory;
    }
    setSearchParams(newParams);
  };

  const searchListings = useCallback((searchText: string) => {
    setLoading(true);
    setError('');

    try {
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

          let results = allListings;

          // Apply search filter if there's a search query
          if (searchText.trim()) {
            const searchTerms = searchText
              .toLowerCase()
              .trim()
              .split(/\s+/)
              .filter(term => term.length >= 2);

            results = allListings.filter(listing => {
              const titleLower = listing.title.toLowerCase();
              const descriptionLower = listing.description.toLowerCase();
              const categoryLower = listing.category.toLowerCase();
              
              return searchTerms.some(term => 
                titleLower.includes(term) || 
                descriptionLower.includes(term) || 
                categoryLower.includes(term)
              );
            });
          }

          // Apply category filter only if it's not 'all'
          if (categoryFilter && categoryFilter !== 'all') {
            results = results.filter(listing => {
              const listingCategory = listing.category.toLowerCase();
              const filterCategory = categoryFilter.toLowerCase();
              return listingCategory === filterCategory || 
                     listingCategory === categoryMap[filterCategory]?.toLowerCase();
            });
          }

          // Score and sort results
          let sortedResults = results.map(listing => {
            const score = searchText.trim() ? searchText.toLowerCase().split(/\s+/).reduce((acc, term) => {
              const titleMatch = listing.title.toLowerCase().includes(term) ? 3 : 0;
              const descMatch = listing.description.toLowerCase().includes(term) ? 1 : 0;
              const categoryMatch = listing.category.toLowerCase().includes(term) ? 2 : 0;
              return acc + titleMatch + descMatch + categoryMatch;
            }, 0) : 0;
            return { ...listing, score };
          });

          // Apply sorting
          sortedResults.sort((a, b) => b.createdAt - a.createdAt);

          setListings(sortedResults.map(({ score, ...listing }) => listing));
          setLoading(false);
        },
        (error) => {
          console.error('Error searching listings:', error);
          setError('Грешка при търсене на обяви. Моля, опитайте отново.');
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up search:', err);
      setError('Грешка при настройка на търсенето. Моля, опитайте отново.');
      setLoading(false);
      return () => {};
    }
  }, [categoryFilter]);

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

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setCategoryFilter(categoryParam);
      // If there's no search query but there's a category, search with empty string to show all items in category
      if (!searchQuery) {
        const unsubscribe = searchListings(' ');
        return () => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      }
    }
  }, [searchParams, searchQuery, searchListings]);

  useEffect(() => {
    if (!searchQuery) return;
    
    const unsubscribe = debouncedSearch(searchQuery);
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [debouncedSearch, searchQuery]);

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    // Update URL parameters while preserving the category if it exists
    const category = searchParams.get('category');
    const newParams: { q?: string; category?: string } = { q: newQuery };
    if (category) {
      newParams.category = category;
    }
    setSearchParams(newParams);
  };

  const handleListingClick = (listing: Listing) => {
    navigate(`/listing/${listing.id}`, {
      state: { listing }
    });
  };

  const handleFavoriteClick = async (e: React.MouseEvent, listing: Listing) => {
    e.stopPropagation();
    try {
      await toggleFavorite(listing.id);
      setSnackbarMessage(isFavorite(listing.id) ? 'Премахнато от любими' : 'Добавено към любими');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbarMessage('Грешка при добавяне към любими');
      setSnackbarOpen(true);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'неизвестна дата';
    
    try {
      if (typeof date === 'string') {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
      } else if (typeof date === 'object' && 'seconds' in date) {
        return formatDistanceToNow(new Date(date.seconds * 1000), { addSuffix: true });
      }
      return 'неизвестна дата';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'неизвестна дата';
    }
  };

  return (
    <AnimatedPage animation="fade">
      <Box sx={{ pt: 8 }}>
        <Container maxWidth="lg">
          <AnimatedPage animation="slide" delay={0.2}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  mb: 3,
                  background: 'linear-gradient(45deg, #2196F3 30%, #4CAF50 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Дайте втори живот на вещите си
              </Typography>
              <Typography 
                variant="subtitle1" 
                gutterBottom 
                sx={{ 
                  textAlign: 'center',
                  mb: 4,
                  color: 'text.secondary'
                }}
              >
                Разменете, споделете, намерете съкровища
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <SearchBar
                    variant="search"
                    placeholder="Намерете подходящият за вас продукт..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </Box>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    label="Категория"
                  >
                    <MenuItem value="all">Всички категории</MenuItem>
                    {categories.filter(cat => cat !== 'all').map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </AnimatedPage>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 4 }}>
              {error}
            </Alert>
          ) : listings.length === 0 ? (
            <AnimatedPage animation="fade" delay={0.6}>
              <Alert severity="info" sx={{ mt: 4 }}>
                Няма намерени обяви, отговарящи на критериите за търсене.
              </Alert>
            </AnimatedPage>
          ) : (
            <Grid container spacing={4}>
              {listings.map((listing, index) => (
                <Grid item xs={12} sm={6} md={4} key={listing.id}>
                  <AnimatedPage animation="scale" delay={0.4 + index * 0.1}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4],
                        },
                      }}
                      onClick={() => handleListingClick(listing)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={listing.images[0] || '/placeholder-image.jpg'}
                        alt={listing.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {listing.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {listing.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip 
                            icon={<CategoryIcon />} 
                            label={listing.category}
                            size="small"
                          />
                          <Chip 
                            label={listing.condition}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {listing.location.address}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(listing.createdAt)}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <IconButton
                          onClick={(e) => handleFavoriteClick(e, listing)}
                          sx={{ ml: 'auto' }}
                        >
                          {isFavorite(listing.id) ? (
                            <FavoriteIcon color="error" />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
                      </CardActions>
                    </Card>
                  </AnimatedPage>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </AnimatedPage>
  );
};

export default Search; 