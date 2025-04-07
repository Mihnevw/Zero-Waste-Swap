import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { theme } from './theme';
import Navbar from './components/Navbar';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import { useTheme } from '@mui/material';

const AppContent = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      position: 'relative',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      bgcolor: theme.palette.background.default
    }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'auto',
          py: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            px: { xs: 2, sm: 3, md: 4 },
            '& > *': {
              width: '100%',
              maxWidth: '100%'
            }
          }}
        >
          <AppRoutes />
        </Container>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          height: '100vh',
          width: '100vw',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          bgcolor: theme.palette.background.default
        }}>
          <AuthProvider>
            <AnalyticsProvider>
              <AppContent />
            </AnalyticsProvider>
          </AuthProvider>
        </Box>
      </ThemeProvider>
    </Router>
  );
};

export default App;
