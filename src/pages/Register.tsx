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
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import AnimatedPage from '../components/AnimatedPage';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validate email
    if (!validateEmail(formData.email)) {
      return;
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      setLoading(true);
      await register(formData.email, formData.password, formData.name);
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
                Регистрация
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Създайте нов акаунт, за да започнете да споделяте
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      error={!!error && !validateEmail(formData.name)}
                      helperText={!!error && !validateEmail(formData.name) ? 'Моля, въведете валидно име' : ''}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Имейл"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      error={!!error && !validateEmail(formData.email)}
                      helperText={!!error && !validateEmail(formData.email) ? 'Моля, въведете валиден имейл адрес' : ''}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Парола"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      error={!!error && !validatePassword(formData.password)}
                      helperText={!!error && !validatePassword(formData.password) ? 'Паролата трябва да бъде поне 8 символа' : ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Потвърди парола"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      error={!!error && formData.password !== formData.confirmPassword}
                      helperText={!!error && formData.password !== formData.confirmPassword ? 'Паролите не съвпадат' : ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
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
                          {loading ? <CircularProgress size={24} /> : 'Регистрация'}
                        </Button>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Link component={RouterLink} to="/login" variant="body2">
                            Вече имате акаунт? Влезте
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

export default Register; 