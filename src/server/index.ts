import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post('/api/send-welcome-email', async (req, res) => {
  const { email, name } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Добре дошли в Zero-Waste Swap!',
    html: `
      <h1>Добре дошли в Zero-Waste Swap, ${name}!</h1>
      <p>Благодарим ви, че се присъединихте към нашата общност. Радваме се, че сте с нас!</p>
      <p>С Zero-Waste Swap можете да:</p>
      <ul>
        <li>Публикувате предмети за размяна</li>
        <li>Намерите предмети от други потребители</li>
        <li>Свържете се с хора със сходни интереси</li>
        <li>Допринесете за устойчиво бъдеще</li>
      </ul>
      <p>Приятно разменяне!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Приветственият имейл е изпратен успешно');
    res.json({ success: true });
  } catch (error) {
    console.error('Грешка при изпращане на приветствен имейл:', error);
    res.status(500).json({ error: 'Грешка при изпращане на приветствен имейл' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Сървърът работи на порт ${PORT}`);
}); 