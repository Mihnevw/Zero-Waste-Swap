import React, { useState, useEffect } from 'react';
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
  Paper,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  IconButton,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AnimatedPage from '../components/AnimatedPage';

const categories = [
  'Дрехи',
  'Електроника',
  'Книги',
  'Мебели',
  'Спортни стоки',
  'Други',
];

const conditions = ['ново', 'като ново', 'добро', 'задоволително', 'лошо'] as const;

const CreateListing: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'добро',
    images: [] as File[],
    imagePreviews: [] as string[],
    location: {
      latitude: 0,
      longitude: 0,
      address: ''
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Заглавието е задължително');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Описанието е задължително');
      return false;
    }
    if (!formData.category) {
      setError('Категорията е задължителна');
      return false;
    }
    if (!formData.condition) {
      setError('Състоянието е задължително');
      return false;
    }
    if (formData.images.length === 0) {
      setError('Необходима е поне една снимка');
      return false;
    }
    return true;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
        imagePreviews: [...prev.imagePreviews, ...newPreviews]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!user) return [];
    
    try {
      setUploadingImages(true);
      const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeFileName}`;
        const storagePath = `listings/${user.uid}/${filename}`;
        const storageRef = ref(storage, storagePath);
        
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      });
      
      return await Promise.all(uploadPromises);
    } catch (err) {
      throw new Error('Грешка при качване на снимките');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError('Трябва да сте влезли в системата, за да създадете обява');
      return;
    }

    try {
      setLoading(true);

      // Upload images first
      const imageUrls = await uploadImages(formData.images);

      if (!imageUrls.length) {
        throw new Error('Грешка при качване на снимките');
      }

      // Create listing document
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        condition: formData.condition,
        images: imageUrls,
        location: formData.location,
        userEmail: user.email,
        userName: user.displayName || 'Анонимен потребител',
        userId: user.uid,
        createdAt: serverTimestamp(),
        status: 'налично'
      };

      const docRef = await addDoc(collection(db, 'listings'), listingData);
      setSuccess(true);
      
      // Wait for the listing to be fully saved and indexed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to the listing details page
      navigate(`/listing/${docRef.id}`);
    } catch (error: any) {
      setError(error.message || 'Грешка при създаване на обявата. Моля, опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AnimatedPage animation="fade">
      <Box sx={{ pt: 8 }}>
        <Container maxWidth="md">
          <AnimatedPage animation="slide" delay={0.2}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Създай нова обява
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Споделете предмети, които вече не използвате, и помогнете на други хора да ги намерят.
              </Typography>
            </Box>
          </AnimatedPage>

          <AnimatedPage animation="scale" delay={0.4}>
            <Paper sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Заглавие"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      error={!!error && !formData.title.trim()}
                      helperText={!!error && !formData.title.trim() ? 'Заглавието е задължително' : ''}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Описание"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      multiline
                      rows={4}
                      required
                      error={!!error && !formData.description.trim()}
                      helperText={!!error && !formData.description.trim() ? 'Описанието е задължително' : ''}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!error && !formData.category}>
                      <InputLabel>Категория</InputLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        label="Категория"
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && !formData.category && (
                        <FormHelperText>{error}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!error && !formData.condition}>
                      <InputLabel>Състояние</InputLabel>
                      <Select
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        label="Състояние"
                      >
                        {conditions.map((condition) => (
                          <MenuItem key={condition} value={condition}>
                            {condition}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && !formData.condition && (
                        <FormHelperText>{error}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <AnimatedPage animation="slide" delay={0.6}>
                      <Box sx={{ mb: 2 }}>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          fullWidth
                        >
                          Качи снимки
                          <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                          />
                        </Button>
                      </Box>
                      {formData.imagePreviews.length > 0 && (
                        <Grid container spacing={2}>
                          {formData.imagePreviews.map((preview, index) => (
                            <Grid item xs={6} sm={4} md={3} key={index}>
                              <Box sx={{ position: 'relative' }}>
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 0, 0, 0.7)'
                                    }
                                  }}
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <DeleteIcon sx={{ color: 'white' }} />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                      {!!error && !formData.images.length && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                          Необходима е поне една снимка
                        </Typography>
                      )}
                    </AnimatedPage>
                  </Grid>

                  <Grid item xs={12}>
                    <AnimatedPage animation="slide" delay={0.8}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate('/')}
                        >
                          Отказ
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading || uploadingImages}
                        >
                          {loading || uploadingImages ? (
                            <CircularProgress size={24} />
                          ) : (
                            'Публикувай'
                          )}
                        </Button>
                      </Box>
                    </AnimatedPage>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </AnimatedPage>
        </Container>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          Обявата беше създадена успешно!
        </Alert>
      </Snackbar>
    </AnimatedPage>
  );
};

export default CreateListing; 