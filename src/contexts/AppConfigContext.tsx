import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppConfig {
  appName: string;
  appTitle: string;
  appDescription: string;
  primaryColor: string;
  logoText: string;
}

interface AppConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: AppConfig = {
  appName: 'LearningApp',
  appTitle: 'Admin Panel',
  appDescription: 'Manage your content and configurations',
  primaryColor: '#3B82F6',
  logoText: 'LA',
};

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

interface AppConfigProviderProps {
  children: ReactNode;
}

export const AppConfigProvider: React.FC<AppConfigProviderProps> = ({ children }) => {
  // Initialize config with localStorage data if available
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const savedConfig = localStorage.getItem('appConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        return { ...defaultConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing saved config:', error);
    }
    return defaultConfig;
  });

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appConfig', JSON.stringify(config));
  }, [config]);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('appConfig');
  };

  return (
    <AppConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
}; 