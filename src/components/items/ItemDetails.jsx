import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';

const ItemDetails = ({ item }) => {
  const navigate = useNavigate();
  const { setCurrentChat } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.VITE_API_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ participantId: item.user._id })
      });

      const chat = await response.json();
      setCurrentChat(chat);
      navigate('/chat');
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* ... existing item details ... */}
      <button
        onClick={handleStartChat}
        disabled={isLoading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Starting chat...' : 'Start Chat'}
      </button>
    </div>
  );
};

export default ItemDetails; 