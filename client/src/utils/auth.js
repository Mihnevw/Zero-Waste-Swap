import { auth } from './firebase';

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
  return auth.onAuthStateChanged(callback);
}; 