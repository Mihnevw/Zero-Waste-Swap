import { initializeApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCpDr8QI3d4_7xStw_5agh_nHGX8Agojas",
  authDomain: "zero-waste-swap.firebaseapp.com",
  projectId: "zero-waste-swap",
  storageBucket: "zero-waste-swap.firebasestorage.app",
  messagingSenderId: "32063996385",
  appId: "1:32063996385:web:fcd62891f07e28826092a0",
  measurementId: "G-KBDTETVZ1J"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

export { app, auth }; 