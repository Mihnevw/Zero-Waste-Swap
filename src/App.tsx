import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, GlobalStyles } from '@mui/material';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import { AuthProvider } from './contexts/AuthContext';
import { theme } from './theme';
import AppRoutes from './routes';
import Navbar from './components/Navbar';

const globalStyles = {
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  'html, body, #root': {
    width: '100%',
    minHeight: '100vh',
    margin: 0,
    padding: 0,
  },
  body: {
    overflowY: 'auto',
    overflowX: 'hidden',
  },
};

const App: React.FC = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={globalStyles} />
        <AuthProvider>
          <AnalyticsProvider>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Navbar />
              <Box
                component="main"
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  position: 'relative',
                }}
              >
                <AppRoutes />
              </Box>
            </Box>
          </AnalyticsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
