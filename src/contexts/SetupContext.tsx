import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [setupState, setSetupState] = useState<SetupState>(() => {
    try {
      const savedSetup = localStorage.getItem('adminPanelSetup');
      if (savedSetup) {
        const parsed = JSON.parse(savedSetup);
        return { ...defaultSetupState, ...parsed };
      }
    } catch (error) {
      console.error('Error loading setup state:', error);
    }
    return defaultSetupState;
  });

  // Save setup state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminPanelSetup', JSON.stringify(setupState));
  }, [setupState]);

  const updateSetupState = (updates: Partial<SetupState>) => {
    setSetupState(prev => ({ ...prev, ...updates }));
  };

  const completeSetup = () => {
    setSetupState(prev => ({
      ...prev,
      isSetupComplete: true,
      isFirstTime: false,
    }));
  };

  const resetSetup = () => {
    setSetupState(defaultSetupState);
    localStorage.removeItem('adminPanelSetup');
    localStorage.removeItem('appConfig');
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
      const isValid = requiredFields.every(field => config[field as keyof FirebaseConfig]?.trim().length > 0);
      
      if (!isValid) {
        throw new Error('Missing required Firebase configuration fields');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  };

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