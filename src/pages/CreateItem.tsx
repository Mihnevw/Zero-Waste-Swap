import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { db, storage } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAnalytics } from '../components/AnalyticsProvider';

const categories = [
  'Clothing',
  'Electronics',
  'Books',
  'Furniture',
  'Sports Equipment',
  'Other',
];

const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const CreateItem: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logEvent } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    images: [] as File[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(e.target.files as FileList),
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Title is required');
    }
    if (!formData.description.trim()) {
      throw new Error('Description is required');
    }
    if (!formData.category) {
      throw new Error('Category is required');
    }
    if (!formData.condition) {
      throw new Error('Condition is required');
    }
    if (!formData.location.trim()) {
      throw new Error('Location is required');
    }
    if (formData.images.length === 0) {
      throw new Error('At least one image is required');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('You must be logged in to create an item');
      }

      // Validate form data
      validateForm();

      // Upload images to Firebase Storage
      const imageUrls = await Promise.all(
        formData.images.map(async (image) => {
          try {
            const storageRef = ref(storage, `items/${user.uid}/${Date.now()}-${image.name}`);
            await uploadBytes(storageRef, image);
            return getDownloadURL(storageRef);
          } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload images. Please try again.');
          }
        })
      );

      // Prepare the item data
      const itemData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim(),
        images: imageUrls,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
      };

      // Add item to Firestore
      const docRef = await addDoc(collection(db, 'items'), itemData);
      logEvent('item_created', { itemId: docRef.id });
      
      // Show success message
      setShowSuccess(true);
      
      // Navigate to home page after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating item:', err);
      setError(err.message || 'Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Item
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
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
                      {condition}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  disabled={loading}
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
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
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Item'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        <Snackbar
          open={showSuccess}
          autoHideDuration={2000}
          onClose={() => setShowSuccess(false)}
          message="Item created successfully!"
        />
      </Box>
    </Container>
  );
};

export default CreateItem; 