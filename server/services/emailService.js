const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });

// Log environment variables for debugging
console.log('Email service environment:', {
  hasEmailUser: !!process.env.EMAIL_USER,
  hasEmailPassword: !!process.env.EMAIL_PASSWORD,
  clientUrl: process.env.CLIENT_URL
});

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('Missing email credentials. Please check your .env file.');
  process.exit(1);
}

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
    process.exit(1);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

const sendMessageNotification = async (recipientEmail, senderName, messagePreview, chatId) => {
  try {
    if (!recipientEmail) {
      throw new Error('Recipient email is required');
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `New message from ${senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">You have a new message!</h2>
          <p><strong>From:</strong> ${senderName}</p>
          <p><strong>Message:</strong> ${messagePreview}</p>
          <p>Click the button below to view the message:</p>
          <a href="${process.env.CLIENT_URL}/chat/${chatId}" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            View Message
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipient: recipientEmail,
      preview: messagePreview
    });
  } catch (error) {
    console.error('Error sending email notification:', {
      error: error.message,
      recipient: recipientEmail,
      chatId,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  sendMessageNotification
}; 