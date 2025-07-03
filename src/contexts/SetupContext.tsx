import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from './AuthContext';
// Import the main Firebase db instance
import { db } from '../config/firebase';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

interface SetupState {
  isFirstTime: boolean;
  currentStep: number;
  isSetupComplete: boolean;
  firebaseConfig: FirebaseConfig | null;
  adminUser: {
    email: string;
    displayName: string;
  } | null;
}

interface SetupContextType {
  setupState: SetupState;
  loading: boolean;
  updateSetupState: (updates: Partial<SetupState>) => void;
  completeSetup: () => void;
  resetSetup: () => void;
  saveFirebaseConfig: (config: FirebaseConfig) => void;
  testFirebaseConnection: (config: FirebaseConfig) => Promise<boolean>;
}

const defaultSetupState: SetupState = {
  isFirstTime: true,
  currentStep: 0,
  isSetupComplete: false,
  firebaseConfig: null,
  adminUser: null,
};

const SetupContext = createContext<SetupContextType | undefined>(undefined);

interface SetupProviderProps {
  children: ReactNode;
}

export const SetupProvider: React.FC<SetupProviderProps> = ({ children }) => {
  const [setupState, setSetupState] = useState<SetupState>(defaultSetupState);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Helper function to create safe document ID from email
  const getEmailDocId = (email: string) => {
    return email.replace(/[/.#$[\]]/g, '_');
  };

  // Load setup state using the main Firebase instance
  useEffect(() => {
    const loadSetupState = async () => {
      try {
        console.log('🔄 SetupContext: Starting setup check, user:', user?.email);
        
        // Wait for user to be available
        if (!user?.email) {
          console.log('👤 SetupContext: No user available, waiting...');
          setSetupState(defaultSetupState);
          setLoading(false);
          return;
        }

        console.log('🔍 SetupContext: Checking setup status for user:', user.email);
        
        const emailDocId = getEmailDocId(user.email);
        const userSetupDoc = await getDoc(doc(db, 'admin_users', emailDocId, 'setup', 'status'));
        
        if (userSetupDoc.exists()) {
          const userSetupData = userSetupDoc.data();
          console.log('✅ SetupContext: User setup status found:', userSetupData);
          
          const newState = {
            ...defaultSetupState,
            isSetupComplete: userSetupData.isSetupComplete || false,
            isFirstTime: !userSetupData.isSetupComplete,
            adminUser: {
              email: user.email,
              displayName: user.displayName || user.email,
            }
          };
          
          console.log('📋 SetupContext: Setting new state:', newState);
          setSetupState(newState);
        } else {
          console.log('📝 SetupContext: No setup status found for user, setup required');
          // User hasn't completed setup yet
          const newState = {
            ...defaultSetupState,
            adminUser: {
              email: user.email,
              displayName: user.displayName || user.email,
            }
          };
          
          console.log('📋 SetupContext: Setting new state (no setup):', newState);
          setSetupState(newState);
        }
      } catch (error) {
        console.error('❌ SetupContext: Error loading setup state:', error);
        // On error, assume setup is needed
        setSetupState(defaultSetupState);
      } finally {
        console.log('🏁 SetupContext: Setup check complete, setting loading to false');
        setLoading(false);
      }
    };

    // Only run setup check if we have authentication info
    if (user !== undefined) {
      console.log('🚀 SetupContext: User state changed, running setup check');
      setLoading(true);
      loadSetupState();
    }
  }, [user]); // Re-run when user changes

  const updateSetupState = (updates: Partial<SetupState>) => {
    setSetupState(prev => ({ ...prev, ...updates }));
  };

  const completeSetup = async () => {
    try {
      const updatedState = {
        ...setupState,
        isSetupComplete: true,
        isFirstTime: false,
      };
      
      setSetupState(updatedState);

      // Save completion status to Firebase using the main db instance
      if (user?.email) {
        try {
          const emailDocId = getEmailDocId(user.email);
          await setDoc(doc(db, 'admin_users', emailDocId, 'setup', 'status'), {
            isSetupComplete: true,
            completedAt: new Date().toISOString(),
            completedBy: user.email,
            version: '1.0.0'
          });
          
          console.log(`✅ Setup completion saved for user: ${user.email}`);
        } catch (firebaseError) {
          console.error('❌ Failed to save setup status to Firebase:', firebaseError);
        }
      }
    } catch (error) {
      console.error('❌ Error completing setup:', error);
    }
  };

  const resetSetup = async () => {
    try {
      setSetupState(defaultSetupState);
      
      // Also remove setup status from Firebase
      if (user?.email) {
        const emailDocId = getEmailDocId(user.email);
        await setDoc(doc(db, 'admin_users', emailDocId, 'setup', 'status'), {
          isSetupComplete: false,
          resetAt: new Date().toISOString(),
          resetBy: user.email,
        });
        console.log('🔄 Setup status reset for user:', user.email);
      }
      
      // Clear localStorage items
      localStorage.removeItem('adminPanelSetup');
      localStorage.removeItem('appConfig');
      localStorage.removeItem('firebaseConfig');
    } catch (error) {
      console.error('❌ Error resetting setup:', error);
    }
  };

  const saveFirebaseConfig = (config: FirebaseConfig) => {
    setSetupState(prev => ({
      ...prev,
      firebaseConfig: config,
    }));
    
    // Save to localStorage for setup wizard reference
    localStorage.setItem('firebaseConfig', JSON.stringify(config));
  };

  const testFirebaseConnection = async (config: FirebaseConfig): Promise<boolean> => {
    try {
      // This is a basic validation - in a real app, you'd want to test actual Firebase connection
      const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
      const isValid = requiredFields.every(field => {
        const value = config[field as keyof FirebaseConfig];
        return value !== undefined && value.trim().length > 0;
      });
      
      if (!isValid) {
        throw new Error('Missing required Firebase configuration fields');
      }

      // Test actual Firebase connection
      try {
        const app = initializeApp(config, 'test-app');
        const testDb = getFirestore(app);
        
        // Try to read a test document to verify connection
        await getDoc(doc(testDb, 'test', 'connection'));
        
        // If we get here, connection is working
        return true;
      } catch (connectionError) {
        console.error('Firebase connection test failed:', connectionError);
        return false;
      }
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  };

  return (
    <SetupContext.Provider 
      value={{
        setupState,
        loading,
        updateSetupState,
        completeSetup,
        resetSetup,
        saveFirebaseConfig,
        testFirebaseConnection,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
};

export const useSetup = () => {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error('useSetup must be used within a SetupProvider');
  }
  return context;
}; 