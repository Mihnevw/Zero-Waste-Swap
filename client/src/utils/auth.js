import { auth } from './firebase';

let tokenRefreshInterval = null;

export const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    return await user.getIdToken(true); // Force token refresh
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
};

export const isAuthenticated = () => {
  return !!auth.currentUser;
};

export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Start token refresh interval when user is authenticated
      startTokenRefresh();
    } else {
      // Clear token refresh interval when user is not authenticated
      stopTokenRefresh();
    }
    callback(user);
  });
};

const startTokenRefresh = () => {
  // Clear any existing interval
  stopTokenRefresh();
  
  // Refresh token every 50 minutes (Firebase tokens expire after 1 hour)
  tokenRefreshInterval = setInterval(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await user.getIdToken(true);
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }, 50 * 60 * 1000); // 50 minutes
};

const stopTokenRefresh = () => {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
}; 