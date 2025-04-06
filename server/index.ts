import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zero-waste-swap';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// API Routes
app.post('/api/send-welcome-email', async (req, res) => {
  const { email, name } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Zero-Waste Swap!',
    html: `
      <h1>Welcome to Zero-Waste Swap, ${name}!</h1>
      <p>Thank you for joining our community. We're excited to have you on board!</p>
      <p>With Zero-Waste Swap, you can:</p>
      <ul>
        <li>List items you want to swap</li>
        <li>Find items from other users</li>
        <li>Connect with like-minded people</li>
        <li>Contribute to a sustainable future</li>
      </ul>
      <p>Happy swapping!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 