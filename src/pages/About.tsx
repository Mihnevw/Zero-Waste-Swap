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
import Footer from '../components/Footer';
import AnimatedPage from '../components/AnimatedPage';

const About: React.FC = () => {
  const values = [
    {
      icon: <RecyclingIcon />,
      title: 'Устойчивост',
      description: 'Вярваме в намаляване на отпадъците и насърчаване на кръговата икономика чрез размяна на предмети.',
    },
    {
      icon: <PeopleIcon />,
      title: 'Общност',
      description: 'Изграждане на общност от екологично съзнателни хора, които споделят общи ценности.',
    },
    {
      icon: <PublicIcon />,
      title: 'Глобален ефект',
      description: 'Постигане на положителен екологичен ефект чрез удължаване на жизнения цикъл на предметите.',
    },
  ];

  return (
    <AnimatedPage>
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
              За Zero-Waste Swap
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
              Нашата мисия е да създадем по-устойчиво бъдеще, като улесним хората да разменят предмети вместо да купуват нови.
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
              Нашата история
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
              Zero-Waste Swap започна с проста идея: какво ще стане, ако можем да намалим отпадъците,
              като помогнем на хората да разменят предмети, от които вече не се нуждаят, с други, които
              могат да ги използват? Тази платформа е резултат от тази визия, създавайки пространство,
              където устойчивостта се среща с общността.
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
              Днес с гордост улесняваме хиляди размени, помагайки за намаляване на отпадъците
              и изграждане на връзки между екологично съзнателни хора. Всяка размяна
              представлява крачка към по-устойчиво бъдеще.
            </Typography>
          </Box>
        </Container>
      </Box>
      <Footer />
    </AnimatedPage>
  );
};

export default About; 