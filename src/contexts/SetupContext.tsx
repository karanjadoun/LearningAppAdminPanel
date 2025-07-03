import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from './AuthContext';

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

  // Load setup state from both localStorage and Firebase
  useEffect(() => {
    const loadSetupState = async () => {
      try {
        // First, try to load Firebase config from localStorage
        const savedFirebaseConfig = localStorage.getItem('firebaseConfig');
        if (savedFirebaseConfig) {
          const firebaseConfig = JSON.parse(savedFirebaseConfig);
          
          // Initialize Firebase with the saved config
          try {
            const app = initializeApp(firebaseConfig, 'setup-check-app');
            const db = getFirestore(app);
            
            // If user is authenticated, check their specific setup status
            if (user?.email) {
              const emailDocId = getEmailDocId(user.email);
              const userSetupDoc = await getDoc(doc(db, 'admin_users', emailDocId, 'setup', 'status'));
              
              if (userSetupDoc.exists()) {
                const userSetupData = userSetupDoc.data();
                setSetupState({
                  ...defaultSetupState,
                  isSetupComplete: userSetupData.isSetupComplete || false,
                  isFirstTime: !userSetupData.isSetupComplete,
                  firebaseConfig,
                  adminUser: {
                    email: user.email,
                    displayName: user.displayName || user.email,
                  }
                });
              } else {
                // User hasn't completed setup yet
                setSetupState({
                  ...defaultSetupState,
                  firebaseConfig,
                  adminUser: {
                    email: user.email,
                    displayName: user.displayName || user.email,
                  }
                });
              }
            } else {
              // No authenticated user, check for global setup (backward compatibility)
              const globalSetupDoc = await getDoc(doc(db, 'admin_setup', 'status'));
              if (globalSetupDoc.exists()) {
                const globalSetupData = globalSetupDoc.data();
                setSetupState({
                  ...defaultSetupState,
                  isSetupComplete: globalSetupData.isSetupComplete || false,
                  isFirstTime: !globalSetupData.isSetupComplete,
                  firebaseConfig,
                });
              } else {
                // Firebase config exists but no setup doc - partial setup
                setSetupState({
                  ...defaultSetupState,
                  firebaseConfig,
                });
              }
            }
          } catch (firebaseError) {
            console.error('Firebase initialization failed:', firebaseError);
            // Fall back to localStorage only
            const savedSetup = localStorage.getItem('adminPanelSetup');
            if (savedSetup) {
              const parsed = JSON.parse(savedSetup);
              setSetupState({ ...defaultSetupState, ...parsed });
            }
          }
        } else {
          // No Firebase config, check localStorage for partial setup
          const savedSetup = localStorage.getItem('adminPanelSetup');
          if (savedSetup) {
            const parsed = JSON.parse(savedSetup);
            setSetupState({ ...defaultSetupState, ...parsed });
          }
        }
      } catch (error) {
        console.error('Error loading setup state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSetupState();
  }, [user]); // Re-run when user changes

  // Save setup state to localStorage for current session
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('adminPanelSetup', JSON.stringify(setupState));
    }
  }, [setupState, loading]);

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

      // Save completion status to Firebase if config is available
      if (setupState.firebaseConfig) {
        try {
          const app = initializeApp(setupState.firebaseConfig, 'setup-complete-app');
          const db = getFirestore(app);
          
          if (user?.email) {
            // Save user-specific setup completion
            const emailDocId = getEmailDocId(user.email);
            await setDoc(doc(db, 'admin_users', emailDocId, 'setup', 'status'), {
              isSetupComplete: true,
              completedAt: new Date().toISOString(),
              completedBy: user.email,
              version: '1.0.0'
            });
            
            console.log(`Setup completion saved for user: ${user.email}`);
          } else {
            // Fallback to global setup (should not happen with new auth flow)
            await setDoc(doc(db, 'admin_setup', 'status'), {
              isSetupComplete: true,
              completedAt: new Date().toISOString(),
              version: '1.0.0'
            });
            
            console.log('Setup completion saved globally');
          }
        } catch (firebaseError) {
          console.error('Failed to save setup status to Firebase:', firebaseError);
        }
      }
    } catch (error) {
      console.error('Error completing setup:', error);
    }
  };

  const resetSetup = () => {
    setSetupState(defaultSetupState);
    localStorage.removeItem('adminPanelSetup');
    localStorage.removeItem('appConfig');
    localStorage.removeItem('firebaseConfig');
  };

  const saveFirebaseConfig = (config: FirebaseConfig) => {
    setSetupState(prev => ({
      ...prev,
      firebaseConfig: config,
    }));
    
    // Also save to separate localStorage for firebase initialization
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
        const db = getFirestore(app);
        
        // Try to read a test document to verify connection
        await getDoc(doc(db, 'test', 'connection'));
        
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

  // Don't render children until setup state is loaded
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#F8FAFC',
        }}
      >
        <CircularProgress 
          size={48} 
          thickness={4}
          sx={{
            color: '#3B82F6',
          }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            mt: 3,
            color: '#374151',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Checking setup status...
        </Typography>
      </Box>
    );
  }

  return (
    <SetupContext.Provider 
      value={{
        setupState,
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