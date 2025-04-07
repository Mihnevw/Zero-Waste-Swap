import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Recycling as RecyclingIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';

const HowItWorks: React.FC = () => {
  const theme = useTheme();

  const steps = [
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: 'Browse Items',
      description: 'Search through our collection of pre-loved items available for swapping.',
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      title: 'Connect',
      description: 'Contact the item owner and discuss the potential swap.',
    },
    {
      icon: <SwapIcon sx={{ fontSize: 40 }} />,
      title: 'Swap',
      description: 'Meet up and exchange items with other community members.',
    },
    {
      icon: <RecyclingIcon sx={{ fontSize: 40 }} />,
      title: 'Reduce Waste',
      description: 'Help reduce waste by giving items a second life through swapping.',
    },
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            mb: 6,
            fontWeight: 700,
            fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' },
          }}
        >
          How It Works
        </Typography>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'background.paper',
                    transform: 'translateY(-4px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                    color: 'primary.main',
                  }}
                >
                  {step.icon}
                </Box>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  {step.title}
                </Typography>
                <Typography color="text.secondary">
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Join Our Community
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
          >
            Be part of a growing community of eco-conscious individuals who are making
            a difference by choosing to swap instead of shop. Every swap contributes
            to reducing waste and promoting sustainable consumption.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks; 