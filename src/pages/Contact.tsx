import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
  CircularProgress
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import AnimatedPage from '../components/AnimatedPage';
import Footer from '../components/Footer';
const Contact = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Моля, въведете вашето име');
      }
      if (!formData.email.trim() || !validateEmail(formData.email)) {
        throw new Error('Моля, въведете валиден имейл адрес');
      }
      if (!formData.subject.trim()) {
        throw new Error('Моля, въведете тема');
      }
      if (!formData.message.trim()) {
        throw new Error('Моля, въведете вашето съобщение');
      }

      const messageData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        createdAt: new Date(),
        status: 'new'
      };

      // Save to Firestore
      await addDoc(collection(db, 'contact_messages'), messageData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);  

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Грешка при изпращане на съобщението. Моля, опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Свържете се с нас
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Вашето съобщение беше изпратено успешно! Пренасочване към началната страница...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Име"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading || success}
                  error={Boolean(error && !formData.name.trim())}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Имейл"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || success}
                  error={Boolean(error && (!formData.email.trim() || !validateEmail(formData.email)))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Тема"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={loading || success}
                  error={Boolean(error && !formData.subject.trim())}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Съобщение"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={loading || success}
                  error={Boolean(error && !formData.message.trim())}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading || success}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Изпрати съобщение'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
    <Footer />
    </AnimatedPage>
  );
};

export default Contact; 