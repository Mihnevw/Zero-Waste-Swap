import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: FirebaseUser;
}

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      message: 'Failed to sign in. Please check your credentials.'
    };
  }
};

export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      message: 'Failed to create account. Email may already be in use.'
    };
  }
};

export const signOut = async (): Promise<AuthResponse> => {
  try {
    await firebaseSignOut(auth);
    return {
      success: true,
      message: 'Successfully signed out'
    };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      message: 'Failed to sign out'
    };
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const getAuthToken = async (): Promise<string | null> => {
  const user = getCurrentUser();
  if (!user) {
    return null;
  }
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}; 