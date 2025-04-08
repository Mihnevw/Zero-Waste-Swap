import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const Terms: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Общи условия за ползване
          </Typography>
          
          <Typography variant="body1" paragraph>
            Последна актуализация: {new Date().toLocaleDateString('bg-BG')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            1. Приемане на условията
          </Typography>
          <Typography variant="body1" paragraph>
            Чрез достъп и използване на платформата Zero-Waste Swap, вие се съгласявате да се придържате към тези Общи условия за ползване и всички приложими закони и разпоредби.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. Потребителски акаунти
          </Typography>
          <Typography variant="body1" paragraph>
            Трябва да създадете акаунт, за да използвате определени функции на нашата платформа. Вие сте отговорни за поддържането на поверителността на информацията за вашия акаунт и за всички действия, извършени под вашия акаунт.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. Насоки за публикуване на обяви
          </Typography>
          <Typography variant="body1" paragraph>
            При създаване на обяви, вие се съгласявате да:
            • Предоставяте точна и пълна информация
            • Публикувате само предмети, които имате право да разменяте или давате
            • Не публикувате забранени предмети
            • Поддържате и актуализирате вашите обяви
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. Потребителско поведение
          </Typography>
          <Typography variant="body1" paragraph>
            Вие се съгласявате да не:
            • Нарушавате закони или разпоредби
            • Нарушавате интелектуалните права на другите
            • Притеснявате или навреждате на други потребители
            • Публикувате невярна или подвеждаща информация
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. Правила на платформата
          </Typography>
          <Typography variant="body1" paragraph>
            Ние си запазваме правото да:
            • Премахваме всяко съдържание, което нарушава тези условия
            • Спираме или прекратяваме акаунти
            • Променяме или прекратяваме услугите
            • Актуализираме тези условия по всяко време
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. Отговорност
          </Typography>
          <Typography variant="body1" paragraph>
            Платформата се предоставя "както е" без никакви гаранции. Ние не носим отговорност за поведението на потребителите или качеството на предметите, разменяни чрез нашата платформа.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            7. Контакт
          </Typography>
          <Typography variant="body1" paragraph>
            За въпроси относно тези Общи условия за ползване, моля, свържете се с нас чрез контактната форма на нашата платформа.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Terms; 