const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const response = await fetch(`${API_URL}/api/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      throw new Error('Failed to send welcome email');
    }

    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}; 