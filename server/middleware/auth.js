const { auth } = require('../config/firebase-admin');
const { syncFirebaseUser } = require('../utils/firebaseSync');
require('dotenv').config({ path: './.env' });

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided in auth header');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      console.log('Invalid token format in auth header');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken) {
      console.log('Invalid token verification result');
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('Token verified for user:', {
      uid: decodedToken.uid,
      email: decodedToken.email
    });

    // Get the full Firebase user data
    const firebaseUser = await auth.getUser(decodedToken.uid);
    
    // Sync user data with MongoDB
    const syncedUser = await syncFirebaseUser(firebaseUser);
    
    if (!syncedUser) {
      console.error('Failed to sync user data with MongoDB');
      return res.status(500).json({ message: 'Failed to sync user data' });
    }

    // Set complete user information in the request
    req.user = {
      _id: syncedUser.uid,
      uid: syncedUser.uid,
      email: syncedUser.email,
      username: syncedUser.username,
      displayName: syncedUser.displayName,
      photoURL: syncedUser.photoURL
    };

    console.log('User synced and set in request:', req.user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = authMiddleware; 