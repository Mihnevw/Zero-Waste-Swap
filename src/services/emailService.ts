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
      throw new Error('Грешка при изпращане на приветствен имейл');
    }

    console.log('Приветственият имейл е изпратен успешно');
  } catch (error) {
    console.error('Грешка при изпращане на приветствен имейл:', error);
    throw error;
  }
}; 