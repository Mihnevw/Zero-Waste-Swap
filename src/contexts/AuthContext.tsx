import { createContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      let errorMessage = 'Грешка при влизане. Моля, опитайте отново.';

      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Няма акаунт с този имейл';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Грешна парола';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Невалиден имейл адрес';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Твърде много неуспешни опити. Моля, опитайте по-късно';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      });
    } catch (err: any) {
      let errorMessage = 'Грешка при регистрация. Моля, опитайте отново.';

      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Този имейл вече е регистриран';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Невалиден имейл адрес';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Акаунти с имейл/парола не са разрешени';
          break;
        case 'auth/weak-password':
          errorMessage = 'Паролата трябва да е поне 8 символа';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Грешка при излизане');
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 