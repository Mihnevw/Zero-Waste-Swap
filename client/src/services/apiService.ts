import { getAuthToken } from '../utils/auth';

// Get the API URL from environment variables with type assertion
const API_URL = (import.meta as any).env.VITE_API_URL;

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiService {
  fetchWithAuth<T>(url: string, options?: ApiOptions): Promise<T>;
  getChats(): Promise<any>;
  getUnreadCounts(): Promise<any>;
  getChatMessages(chatId: string): Promise<any>;
  sendMessage(chatId: string, message: { text: string }): Promise<any>;
  markMessagesAsRead(chatId: string): Promise<any>;
}

const apiService: ApiService = {
  async fetchWithAuth<T>(url: string, options: ApiOptions = {}): Promise<T> {
    const token = await getAuthToken();
    if (!token) {
      console.error('User is not authenticated');
      throw new Error('User is not authenticated');
    }

    try {
      console.log('Making API request:', {
        url: `${API_URL}${url}`,
        method: options.method || 'GET',
        timestamp: new Date().toISOString()
      });

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Accept': 'application/json',
        'Origin': window.location.origin
      };

      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        },
        credentials: 'include',
        mode: 'cors'
      });

      console.log('API response:', {
        url: `${API_URL}${url}`,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString()
      });

      if (response.status === 401) {
        console.log('Token expired, attempting refresh');
        // Token might be expired, try to refresh
        const newToken = await getAuthToken(); // Get a fresh token
        headers.Authorization = `Bearer ${newToken}`;
        
        console.log('Retrying request with new token');
        // Retry the request with new token
        const retryResponse = await fetch(`${API_URL}${url}`, {
          ...options,
          headers: {
            ...headers,
            ...options.headers
          },
          credentials: 'include',
          mode: 'cors'
        });

        console.log('Retry response:', {
          url: `${API_URL}${url}`,
          status: retryResponse.status,
          statusText: retryResponse.statusText,
          headers: Object.fromEntries(retryResponse.headers.entries()),
          timestamp: new Date().toISOString()
        });

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }

        return retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API request successful:', {
        url: `${API_URL}${url}`,
        dataSize: JSON.stringify(data).length,
        timestamp: new Date().toISOString()
      });
      return data;
    } catch (error) {
      console.error('API request error:', {
        url: `${API_URL}${url}`,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  // Chat-related API calls
  async getChats() {
    return this.fetchWithAuth('/api/chats');
  },

  async getUnreadCounts() {
    return this.fetchWithAuth('/api/chats/unread');
  },

  async getChatMessages(chatId: string) {
    return this.fetchWithAuth(`/api/chats/${chatId}`);
  },

  async sendMessage(chatId: string, message: { text: string }) {
    return this.fetchWithAuth(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message)
    });
  },

  async markMessagesAsRead(chatId: string) {
    return this.fetchWithAuth(`/api/chats/${chatId}/read`, {
      method: 'PUT'
    });
  }
};

export default apiService; 