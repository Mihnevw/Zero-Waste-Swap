import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Recycling as RecyclingIcon,
  People as PeopleIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

const About: React.FC = () => {
  const values = [
    {
      icon: <RecyclingIcon />,
      title: 'Sustainability',
      description: 'We believe in reducing waste and promoting a circular economy through item swapping.',
    },
    {
      icon: <PeopleIcon />,
      title: 'Community',
      description: 'Building a supportive community of eco-conscious individuals who share common values.',
    },
    {
      icon: <PublicIcon />,
      title: 'Global Impact',
      description: 'Making a positive environmental impact by extending the lifecycle of items.',
    },
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Mission Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              mb: 3,
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' },
            }}
          >
            About Zero-Waste Swap
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              mb: 4,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            We're on a mission to create a more sustainable future by making it easy
            for people to swap items instead of buying new ones.
          </Typography>
        </Box>

        {/* Values Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {values.map((value, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
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
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'primary.main',
                    mb: 2,
                    mx: 'auto',
                  }}
                >
                  {value.icon}
                </Avatar>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  {value.title}
                </Typography>
                <Typography color="text.secondary">
                  {value.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Story Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Our Story
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              mb: 2,
              fontSize: '1.1rem',
              lineHeight: 1.8,
            }}
          >
            Zero-Waste Swap started with a simple idea: what if we could reduce waste
            by helping people swap items they no longer need with others who could
            use them? This platform is the result of that vision, creating a space
            where sustainability meets community.
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.8,
            }}
          >
            Today, we're proud to facilitate thousands of swaps, helping reduce waste
            and build connections between eco-conscious individuals. Every swap
            represents a step towards a more sustainable future.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default About; 