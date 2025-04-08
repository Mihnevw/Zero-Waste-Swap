import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Listing } from '../types/listing';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnimatedPage from '../components/AnimatedPage';
import { useFavorites } from '../hooks/useFavorites';
import { uploadImage } from '../utils/imageUpload';

const categories = [
  'Дрехи',
  'Електроника',
  'Книги',
  'Мебели',
  'Спортни стоки',
  'Други',
];

const conditions = ['ново', 'като ново', 'добро', 'задоволително', 'лошо'] as const;

const EditListing = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toggleFavorite } = useFavorites();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Listing>>({
    title: '',
    description: '',
    category: '',
    condition: 'добро',
    images: [],
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchListing = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Listing;
          if (data.userId !== user?.uid) {
            navigate('/');
            return;
          }
          setFormData(data);
          setImagePreviews(data.images || []);
        } else {
          setError('Обявата не беше намерена');
        }
      } catch (err) {
        setError('Грешка при зареждане на обявата');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [authLoading, user, navigate, id]);

  const validateForm = () => {
    if (!formData.title?.trim()) {
      setError('Заглавието е задължително');
      return false;
    }
    if (!formData.description?.trim()) {
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
    if ((!formData.images || formData.images.length === 0) && newImages.length === 0) {
      setError('Необходима е поне една снимка');
      return false;
    }
    return true;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      
      setNewImages(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = async (index: number, isNew: boolean) => {
    if (isNew) {
      setNewImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      if (!formData.images) return;
      
      try {
        const imageUrl = formData.images[index];
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        
        setFormData(prev => ({
          ...prev,
          images: prev.images?.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
      } catch (err) {
        setError('Грешка при изтриване на снимката');
      }
    }
  };

  const uploadNewImages = async (files: File[]): Promise<string[]> => {
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
    
    if (!user || !id) return;

    try {
      setLoading(true);
      
      let updatedImages = formData.images || [];
      if (newImages.length > 0) {
        const newImageUrls = await uploadNewImages(newImages);
        updatedImages = [...updatedImages, ...newImageUrls];
      }

      const docRef = doc(db, 'listings', id);
      await updateDoc(docRef, {
        ...formData,
        images: updatedImages,
        updatedAt: new Date(),
      });
      
      navigate(`/listing/${id}`);
    } catch (err) {
      setError('Грешка при актуализиране на обявата. Моля, опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Delete images from storage
      if (formData.images) {
        const deletePromises = formData.images.map(async (imageUrl) => {
          const imageRef = ref(storage, imageUrl);
          try {
            await deleteObject(imageRef);
          } catch (err) {
            console.error('Error deleting image:', err);
          }
        });
        await Promise.all(deletePromises);
      }
      
      // Delete document
      await deleteDoc(doc(db, 'listings', id));
      await toggleFavorite(id);
      navigate('/profile');
    } catch (err) {
      setError('Грешка при изтриване на обявата. Моля, опитайте отново.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading && !formData.title) {
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
                Редактирай обява
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Актуализирайте информацията за вашата обява.
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
                      error={!!error && !formData.title?.trim()}
                      helperText={!!error && !formData.title?.trim() ? 'Заглавието е задължително' : ''}
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
                      error={!!error && !formData.description?.trim()}
                      helperText={!!error && !formData.description?.trim() ? 'Описанието е задължително' : ''}
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
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value as typeof conditions[number] })}
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
                          Качи нови снимки
                          <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </Button>
                      </Box>
                      {imagePreviews.length > 0 && (
                        <Grid container spacing={2}>
                          {imagePreviews.map((preview, index) => (
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
                                  onClick={() => handleRemoveImage(index, index >= (formData.images?.length || 0))}
                                >
                                  <DeleteIcon sx={{ color: 'white' }} />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                      {!!error && (!formData.images || formData.images.length === 0) && newImages.length === 0 && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                          Необходима е поне една снимка
                        </Typography>
                      )}
                    </AnimatedPage>
                  </Grid>

                  <Grid item xs={12}>
                    <AnimatedPage animation="slide" delay={0.8}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          Изтрий обява
                        </Button>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
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
                              'Запази промените'
                            )}
                          </Button>
                        </Box>
                      </Box>
                    </AnimatedPage>
                  </Grid>
                </Grid>
              </form>
            </Paper>
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
    </AnimatedPage>
  );
};

export default EditListing; 