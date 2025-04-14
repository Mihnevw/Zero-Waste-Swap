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
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get or create user in database
    const User = require('../models/User');
    let user = await User.findOne({ _id: decodedToken.uid });
    
    if (!user) {
      // Create new user if they don't exist
      user = new User({
        _id: decodedToken.uid,
        email: decodedToken.email,
        username: decodedToken.email.split('@')[0],
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        photoURL: decodedToken.picture || '',
        createdAt: new Date().toISOString()
      });
      await user.save();
      console.log('Created new user:', user._id);
    }
    
    req.user = {
      _id: user._id,
      uid: user._id,
      email: user.email,
      name: user.displayName || user.username
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth; 