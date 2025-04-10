import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import {
  Recycling as RecyclingIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import Footer from '../components/Footer';
import AnimatedPage from '../components/AnimatedPage';

const HowItWorks: React.FC = () => {

  const steps = [
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: 'Разгледайте предметите',
      description: 'Търсете сред нашата колекция от използвани предмети, достъпни за размяна.',
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      title: 'Свържете се',
      description: 'Свържете се със собственика на предмета и обсъдете възможната размяна.',
    },
    {
      icon: <SwapIcon sx={{ fontSize: 40 }} />,
      title: 'Разменете',
      description: 'Срещнете се и разменете предмети с други членове на общността.',
    },
    {
      icon: <RecyclingIcon sx={{ fontSize: 40 }} />,
      title: 'Намалете отпадъците',
      description: 'Помогнете за намаляване на отпадъците, като дадете на предметите втори живот чрез размяна.',
    },
  ];

  return (
    <AnimatedPage>
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
            Как работи
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
              Присъединете се към нашата общност
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
            >
              Бъдете част от растящата общност от екологично съзнателни хора, които
              правят разлика, като избират да разменят вместо да пазаруват. Всяка
              размяна допринася за намаляване на отпадъците и насърчаване на
              устойчиво потребление.
            </Typography>
          </Box>
        </Container>
      </Box>
      <Footer />
    </AnimatedPage>
  );
};

export default HowItWorks; 