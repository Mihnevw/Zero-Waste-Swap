import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const Privacy: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Политика за поверителност
          </Typography>
          
          <Typography variant="body1" paragraph>
            Последна актуализация: {new Date().toLocaleDateString('bg-BG')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            1. Информация, която събираме
          </Typography>
          <Typography variant="body1" paragraph>
            Събираме информация, която вие предоставяте директно на нас, включително име, имейл адрес и всяка друга информация, която изберете да предоставите при използване на нашата платформа Zero-Waste Swap.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. Как използваме вашата информация
          </Typography>
          <Typography variant="body1" paragraph>
            Използваме събраната информация, за да:
            • Предоставяме и поддържаме нашите услуги
            • Обработваме вашите транзакции
            • Изпращаме ви технически известия и съобщения за поддръжка
            • Комуникираме с вас за продукти, услуги и събития
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. Споделяне на информация
          </Typography>
          <Typography variant="body1" paragraph>
            Ние не продаваме или споделяме вашата лична информация с трети страни, освен когато е необходимо за предоставяне на нашите услуги или когато се изисква по закон.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. Сигурност на данните
          </Typography>
          <Typography variant="body1" paragraph>
            Прилагаме подходящи мерки за сигурност, за да защитим вашата лична информация от неоторизиран достъп, промяна или унищожаване.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. Вашите права
          </Typography>
          <Typography variant="body1" paragraph>
            Имате право да достъпвате, актуализирате или изтривате вашата лична информация. Можете да упражните тези права, като се свържете с нас чрез нашата платформа.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. Промени в тази политика
          </Typography>
          <Typography variant="body1" paragraph>
            Може да актуализираме тази политика за поверителност от време на време. Ще ви уведомим за всички промени, като публикуваме новата политика на тази страница.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            7. Свържете се с нас
          </Typography>
          <Typography variant="body1" paragraph>
            Ако имате въпроси относно тази Политика за поверителност, моля, свържете се с нас чрез контактната форма на нашата платформа.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Privacy; 