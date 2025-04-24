const { auth } = require('../config/firebase-admin');
const User = require('../models/User');

const syncFirebaseUser = async (firebaseUser) => {
  try {
    // Try to find existing user
    let user = await User.findOne({ uid: firebaseUser.uid });

    // Prepare user data
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.uid,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.uid,
      photoURL: firebaseUser.photoURL || null,
      lastSyncedAt: new Date()
    };

    if (user) {
      // Update existing user
      Object.assign(user, userData);
      await user.save();
    } else {
      // Create new user
      user = await User.create(userData);
    }

    return user.toObject();
  } catch (error) {
    console.error('Error syncing Firebase user:', error);
    return null;
  }
};

const syncMissingUsers = async (uids) => {
  try {
    const existingUsers = await User.find({ uid: { $in: uids } });
    const existingUids = new Set(existingUsers.map(user => user.uid));
    
    const missingUids = uids.filter(uid => !existingUids.has(uid));
    if (missingUids.length === 0) return existingUsers;

    const syncPromises = missingUids.map(async (uid) => {
      try {
        const firebaseUser = await auth.getUser(uid);
        return await syncFirebaseUser(firebaseUser);
      } catch (error) {
        console.error(`Failed to sync user ${uid}:`, error);
        return null;
      }
    });

    const syncedUsers = await Promise.all(syncPromises);
    return [...existingUsers, ...syncedUsers.filter(Boolean)];
  } catch (error) {
    console.error('Error syncing missing users:', error);
    return [];
  }
};

module.exports = {
  syncFirebaseUser,
  syncMissingUsers
}; 