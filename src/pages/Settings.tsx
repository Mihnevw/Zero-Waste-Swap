import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Avatar,
  CircularProgress,
  Grid
} from '@mui/material';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import AnimatedPage from '../components/AnimatedPage';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile(user, {
        displayName: displayName.trim()
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError('Грешка при актуализиране на профила. Моля, опитайте отново.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage animation="fade">
      <Box sx={{ pt: 8 }}>
        <Container maxWidth="md">
          <AnimatedPage animation="slide" delay={0.2}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Настройки
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Управлявайте вашите лични данни и настройки.
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
                      label="Име"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      error={!!error}
                      helperText={error}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Имейл"
                      value={user.email || ''}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <AnimatedPage animation="slide" delay={0.6}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Запази промените'}
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
    </AnimatedPage>
  );
};

export default Settings; 