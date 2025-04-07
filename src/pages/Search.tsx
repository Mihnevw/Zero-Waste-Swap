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
} from '@mui/material';
import { collection, query as firestoreQuery, where, getDocs, orderBy, startAt, endAt, or } from 'firebase/firestore';
import { db } from '../config/firebase';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';

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
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchListings = async (searchText: string) => {
    if (!searchText.trim()) {
      setListings([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const listingsRef = collection(db, 'listings');
      const searchTerms = searchText
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(term => term.length >= 2);

      if (searchTerms.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      // Get all listings and filter in memory
      const querySnapshot = await getDocs(collection(db, 'listings'));
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
          createdAt: data.createdAt,
          location: data.location || { latitude: 0, longitude: 0, address: '' }
        } as Listing;
      });

      // Filter and score listings
      const results = allListings.filter(listing => {
        const titleLower = listing.title.toLowerCase();
        const descriptionLower = listing.description.toLowerCase();
        const categoryLower = listing.category.toLowerCase();
        
        return searchTerms.some(term => 
          titleLower.includes(term) || 
          descriptionLower.includes(term) || 
          categoryLower.includes(term)
        );
      });

      // Score and sort results
      const sortedResults = results
        .map(listing => {
          const score = searchTerms.reduce((acc, term) => {
            const titleMatch = listing.title.toLowerCase().includes(term) ? 3 : 0;
            const descMatch = listing.description.toLowerCase().includes(term) ? 1 : 0;
            const categoryMatch = listing.category.toLowerCase().includes(term) ? 2 : 0;
            return acc + titleMatch + descMatch + categoryMatch;
          }, 0);
          return { ...listing, score };
        })
        .sort((a, b) => {
          // Sort by score first
          if (b.score !== a.score) return b.score - a.score;
          // Then by date
          return b.createdAt?.seconds - a.createdAt?.seconds;
        })
        .map(({ score, ...listing }) => listing);

      setListings(sortedResults);
    } catch (err) {
      console.error('Error searching listings:', err);
      setError('Failed to search listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce the search function
  const debouncedSearch = useCallback(
    debounce((query: string) => searchListings(query), 300),
    []
  );

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      searchListings(query);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchParams]);

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    setSearchParams({ q: newQuery });
    debouncedSearch(newQuery);
  };

  const handleListingClick = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Results
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search listings..."
          />
        </Box>

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
            <Typography variant="subtitle1" gutterBottom>
              Found {listings.length} results for "{searchQuery}"
            </Typography>

            <Grid container spacing={3}>
              {listings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} key={listing.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.2s ease-in-out'
                      }
                    }}
                    onClick={() => handleListingClick(listing.id)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={listing.images[0] || '/placeholder-image.jpg'}
                      alt={listing.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2">
                        {listing.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {listing.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={listing.category} 
                          size="small" 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                        <Chip 
                          label={listing.condition} 
                          size="small" 
                          sx={{ mb: 1 }} 
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        Posted by {listing.userName || 'Anonymous'}
                      </Typography>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {listings.length === 0 && !loading && searchQuery && (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="body1">
                  No listings found. Try different search terms or check your spelling.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Search; 