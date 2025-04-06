import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager, enableMultiTabIndexedDbPersistence, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Validate and format Firebase configuration
const validateConfig = (config: any) => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required Firebase config field: ${field}`);
    }
  }

  // Ensure authDomain is properly formatted
  if (!config.authDomain.includes('.')) {
    throw new Error('Invalid authDomain format');
  }

  // Log the project ID for debugging
  console.log('Firebase Project ID:', config.projectId);

  return config;
};

const firebaseConfig = validateConfig({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
});

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with local persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error('Error setting auth persistence:', err);
});

// Initialize Firestore with enhanced settings for connection stability
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalForceLongPolling: true, // Use long polling instead of WebSocket
    ignoreUndefinedProperties: true, // Ignore undefined properties to prevent errors
  });

  // Enable multi-tab persistence
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    } else {
      console.error('Error enabling persistence:', err);
    }
  });

  // Test Firestore connection
  console.log('Firestore initialized successfully');
} catch (error) {
  console.error('Error initializing Firestore:', error);
  // If Firestore is already initialized, get the existing instance
  db = getFirestore(app);
}

export { db };

// Initialize Storage
export const storage = getStorage(app);

// Optional: Connect to emulators if needed
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    console.log('Connecting to Firebase emulators...');
    try {
      // Connect to Firestore emulator
      import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
        connectFirestoreEmulator(db, 'localhost', 8080);
      });
      
      // Connect to Auth emulator
      import('firebase/auth').then(({ connectAuthEmulator }) => {
        connectAuthEmulator(auth, 'http://localhost:9099');
      });
      
      // Connect to Storage emulator
      import('firebase/storage').then(({ connectStorageEmulator }) => {
        connectStorageEmulator(storage, 'localhost', 9199);
      });
    } catch (error) {
      console.error('Error setting up emulator connections:', error);
    }
  }
}

// Initialize analytics conditionally
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null); 