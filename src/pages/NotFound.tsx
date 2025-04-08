import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Страницата не е намерена
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Съжаляваме, но страницата, която търсите, не съществува или е била преместена.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Обратно към началната страница
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 