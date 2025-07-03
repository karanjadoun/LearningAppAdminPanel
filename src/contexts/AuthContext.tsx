import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { AuthContextType, User } from '../types';

// Add your allowed admin emails here
const ALLOWED_ADMIN_EMAILS = [
  // Add your email addresses here
  'karanjadoun2000@gmail.com', // Replace with your actual email
  'karanjadoun2018@gmail.com',     // Add more emails as needed
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        // Check if the user's email is in the allowed admin list
        const isAdmin = ALLOWED_ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase());
        
        if (isAdmin) {
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            isAdmin: true,
          };
          setUser(user);
        } else {
          // User is not an admin, sign them out
          firebaseSignOut(auth);
          setUser(null);
          alert('Access denied. This admin panel is restricted to authorized users only.');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 