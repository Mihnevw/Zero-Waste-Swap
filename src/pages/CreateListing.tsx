import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const categories = [
  'Clothing',
  'Electronics',
  'Books',
  'Furniture',
  'Sports Equipment',
  'Other',
];

const conditions = ['new', 'like-new', 'good', 'fair', 'poor'] as const;

const CreateListing = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    images: [] as File[],
    location: {
      latitude: 51.505,
      longitude: -0.09,
      address: ''
    }
  });

  useEffect(() => {
    console.log('Auth state:', { user, authLoading });
    if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log(`Selected ${e.target.files.length} images`);
      setFormData(prev => ({
        ...prev,
        images: [...Array.from(e.target.files || [])]
      }));
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    console.log('Starting image upload process');
    try {
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('You must be logged in to upload images');
      }

      const uploadPromises = files.map(async (file: File) => {
        try {
          // Basic validation
          if (!file.type.startsWith('image/')) {
            throw new Error(`Invalid file type: ${file.type}`);
          }

          // Create a unique filename with proper formatting
          const timestamp = Date.now();
          const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `${timestamp}-${safeFileName}`;
          
          // Ensure the path is correctly structured for the storage bucket
          const storagePath = `listings/${user.uid}/${filename}`;
          console.log('Uploading to path:', storagePath);

          // Create storage reference with the correct path
          const storageRef = ref(storage, storagePath);
          console.log('Storage reference created:', storageRef);

          try {
            // Upload file directly without metadata to minimize CORS issues
            console.log('Starting upload...');
            const snapshot = await uploadBytes(storageRef, file);
            console.log('Upload successful, snapshot:', snapshot.metadata);

            // Get download URL using the Firebase SDK
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('Download URL obtained:', downloadURL);

            return downloadURL;
          } catch (uploadError: any) {
            console.error('Upload error details:', {
              code: uploadError.code,
              message: uploadError.message,
              serverResponse: uploadError.serverResponse,
              ref: uploadError.ref
            });
            
            if (uploadError.code === 'storage/unauthorized') {
              throw new Error('Unauthorized: Please check your authentication status');
            } else if (uploadError.code === 'storage/canceled') {
              throw new Error('Upload was canceled');
            } else if (uploadError.code === 'storage/unknown') {
              throw new Error('An unknown error occurred during upload');
            }
            
            throw new Error(`Upload failed: ${uploadError.message}`);
          }
        } catch (error: any) {
          console.error('Error processing file:', {
            fileName: file.name,
            error: error.message
          });
          throw error;
        }
      });

      console.log('Processing all uploads...');
      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter((url): url is string => typeof url === 'string' && url.length > 0);
      console.log('All uploads completed successfully:', validUrls);
      return validUrls;
    } catch (error: any) {
      console.error('Fatal upload error:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started with data:', {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      condition: formData.condition,
      imageCount: formData.images.length,
      location: formData.location
    });
    
    if (!user) {
      console.error('No authenticated user found');
      setError('You must be logged in to create a listing');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Validate form data
      console.log('Validating form data...');
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (!formData.images.length) {
        throw new Error('At least one image is required');
      }
      console.log('Form validation passed');

      // Upload images first
      console.log('Starting image upload process...');
      const imageUrls = await uploadImages(formData.images);
      console.log('Image upload completed, URLs:', imageUrls);

      if (!imageUrls.length) {
        throw new Error('Failed to upload images');
      }

      // Create listing with image URLs
      console.log('Preparing listing data...');
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        condition: formData.condition,
        images: imageUrls,
        userEmail: user.email,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        location: formData.location,
        status: 'available' as const
      };
      console.log('Listing data prepared:', listingData);

      // Use a try-catch block specifically for the Firestore operation
      try {
        console.log('Creating Firestore document...');
        const listingsRef = collection(db, 'listings');
        console.log('Collection reference created:', listingsRef);
        
        const docRef = await addDoc(listingsRef, listingData);
        console.log('Document reference created:', docRef);
        
        if (!docRef.id) {
          throw new Error('Failed to create listing');
        }

        console.log('Listing created successfully with ID:', docRef.id);
        setSuccess(true);
        
        // Navigate to home after showing success message
        setTimeout(() => {
          console.log('Navigating to home page...');
          navigate('/');
        }, 2000);
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        throw new Error('Failed to save listing to database. Please try again.');
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to create listing. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    console.log('Component not rendered: authLoading or no user');
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Listing
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                disabled={loading}
              >
                {conditions.map((condition) => (
                  <MenuItem key={condition} value={condition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                disabled={loading}
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
              {formData.images.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {formData.images.length} image(s) selected
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Listing'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={2000}
        message="Listing created successfully!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default CreateListing; 