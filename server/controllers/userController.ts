import { Request, Response } from 'express';
import User from '../models/User';
import { auth } from '../config/firebase-admin';

// Sync Firebase user to MongoDB
export const syncFirebaseUser = async (firebaseUser: any) => {
  try {
    // Check if user already exists in MongoDB
    let user = await User.findOne({ uid: firebaseUser.uid });
    
    if (!user) {
      // Create new user in MongoDB
      user = new User({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL,
        isVerified: firebaseUser.emailVerified
      });
      
      await user.save();
      console.log('Created new user in MongoDB:', user.uid);
    } else {
      // Update existing user
      user.email = firebaseUser.email;
      user.username = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || user.username;
      user.displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || user.displayName;
      user.photoURL = firebaseUser.photoURL;
      user.isVerified = firebaseUser.emailVerified;
      
      await user.save();
      console.log('Updated existing user in MongoDB:', user.uid);
    }
    
    return user;
  } catch (error) {
    console.error('Error syncing Firebase user to MongoDB:', error);
    throw error;
  }
};

// Get user by Firebase UID
export const getUserByUid = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    
    // First try to get user from MongoDB
    let user = await User.findOne({ uid });
    
    if (!user) {
      // If not found in MongoDB, get from Firebase and sync
      const firebaseUser = await auth.getUser(uid);
      user = await syncFirebaseUser(firebaseUser);
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Error getting user' });
  }
}; 