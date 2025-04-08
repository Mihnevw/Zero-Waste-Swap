import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import AnimatedPage from '../components/AnimatedPage';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateEmail(email)) {
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error is already handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage animation="fade">
      <Box sx={{ pt: 8 }}>
        <Container maxWidth="sm">
          <AnimatedPage animation="slide" delay={0.2}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Вход
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Влезте в системата, за да продължите
              </Typography>
            </Box>
          </AnimatedPage>

          <AnimatedPage animation="scale" delay={0.4}>
            <Paper sx={{ p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Имейл"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      error={!!error && !validateEmail(email)}
                      helperText={!!error && !validateEmail(email) ? 'Моля, въведете валиден имейл адрес' : ''}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Парола"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      error={!!error}
                      helperText={error}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <AnimatedPage animation="slide" delay={0.6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Вход'}
                        </Button>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Link component={RouterLink} to="/register" variant="body2">
                            Нямате акаунт? Регистрирайте се
                          </Link>
                          <Link component={RouterLink} to="/forgot-password" variant="body2">
                            Забравена парола?
                          </Link>
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
    </AnimatedPage>
  );
};

export default Login; 