const admin = require('firebase-admin');
require('dotenv').config({ path: './.env' });

// Initialize Firebase Admin
try {
  console.log('Initializing Firebase Admin...');
  
  // Log environment variables for debugging
  console.log('Environment variables:', {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'Private key exists' : 'Private key is undefined'
  });

  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('FIREBASE_PRIVATE_KEY is not defined in environment variables');
  }

  const serviceAccount = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
  };

  // Validate required fields
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('Missing Firebase Admin credentials. Please check your .env file.');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const auth = async (req, res, next) => {
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
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken) {
      console.log('Invalid token verification result');
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('Token verified for user:', {
      uid: decodedToken.uid,
      email: decodedToken.email
    });

    // Set user information in the request
    req.user = {
      _id: decodedToken.uid,
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || decodedToken.email || '',
      displayName: decodedToken.name || decodedToken.email || ''
    };

    console.log('User set in request:', req.user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = auth; 