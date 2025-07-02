import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, useMediaQuery, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { SetupProvider, useSetup } from './contexts/SetupContext';
import { SearchProvider } from './contexts/SearchContext';
import AppBar from './components/Layout/AppBar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ContentManagement from './pages/ContentManagement';
import Settings from './pages/Settings';
import AdvancedSettings from './pages/AdvancedSettings';
import AppSettings from './pages/AppSettings';
import LoginPage from './components/Auth/LoginPage';
import SetupWizard from './components/Setup/SetupWizard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Clean modern theme inspired by professional admin panels
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3B82F6', // Beautiful modern blue
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#EC4899', // Modern pink
      light: '#F472B6',
      dark: '#DB2777',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC', // Very light gray background
      paper: '#ffffff',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
    success: {
      main: '#10B981', // Clean green
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Clean amber
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Clean red
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#06B6D4', // Clean cyan-blue
      light: '#22D3EE',
      dark: '#0891B2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      color: '#111827',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      color: '#111827',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.33,
      color: '#111827',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#111827',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.44,
      color: '#111827',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#111827',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.625,
      fontWeight: 400,
      color: '#374151',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      fontWeight: 400,
      color: '#6B7280',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@import': 'url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap")',
        body: {
          backgroundColor: '#F8FAFC',
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          scrollbarColor: '#E5E7EB transparent',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#E5E7EB',
            borderRadius: 3,
            '&:hover': {
              background: '#D1D5DB',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          },
        },
        outlined: {
          borderColor: '#E5E7EB',
          color: '#374151',
          '&:hover': {
            borderColor: '#D1D5DB',
            backgroundColor: '#F9FAFB',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
          border: '1px solid #F3F4F6',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px !important',
          '&:last-child': {
            paddingBottom: '24px !important',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
          borderRadius: 6,
          height: 24,
        },
        colorPrimary: {
          backgroundColor: '#EFF6FF',
          color: '#2563EB',
        },
        colorSecondary: {
          backgroundColor: '#FDF2F8',
          color: '#EC4899',
        },
        colorSuccess: {
          backgroundColor: '#ECFDF5',
          color: '#059669',
        },
        colorError: {
          backgroundColor: '#FEF2F2',
          color: '#DC2626',
        },
        colorWarning: {
          backgroundColor: '#FFFBEB',
          color: '#D97706',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #F3F4F6',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#D1D5DB',
            },
            '&.Mui-focused': {
              borderColor: '#3B82F6',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: '0.875rem',
          fontWeight: 500,
          border: '1px solid',
        },
        standardInfo: {
          backgroundColor: '#ECFEFF',
          borderColor: '#A5F3FC',
          color: '#155E75',
        },
        standardSuccess: {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
          color: '#166534',
        },
        standardWarning: {
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA',
          color: '#92400E',
        },
        standardError: {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          color: '#991B1B',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 8,
          padding: 4,
          border: '1px solid #F3F4F6',
        },
        indicator: {
          backgroundColor: '#3B82F6',
          height: 2,
          borderRadius: 1,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          color: '#6B7280',
          borderRadius: 6,
          margin: '0 2px',
          minHeight: 40,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#F9FAFB',
            color: '#374151',
          },
          '&.Mui-selected': {
            color: '#3B82F6',
            backgroundColor: '#EFF6FF',
          },
        },
      },
    },
  },
});

// Main authenticated app content
const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width:1024px)');
  const isTablet = useMediaQuery('(max-width:1200px)');
  
  // Sidebar width based on screen size
  const sidebarWidth = isTablet ? 260 : 280;
  
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#F8FAFC',
    }}>
      <Sidebar 
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
        width={sidebarWidth}
        isMobile={isMobile}
      />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'hidden',
        marginLeft: {
          xs: 0,
          lg: sidebarOpen ? `${sidebarWidth}px` : 0,
        },
        transition: 'margin-left 0.3s ease-in-out',
      }}>
        <AppBar 
          onMenuClick={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
        />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
          backgroundColor: 'transparent',
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/content" element={<ContentManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/advanced-settings" element={<AdvancedSettings />} />
            <Route path="/app-settings" element={<AppSettings />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

// Authentication wrapper component
const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();
  const { setupState } = useSetup();

  // Show loading spinner while checking authentication
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
          Loading your admin panel...
        </Typography>
      </Box>
    );
  }

  // If user is not authenticated, show login page
  if (!user) {
    return <LoginPage />;
  }

  // If setup is not complete, show setup wizard
  if (!setupState.isSetupComplete) {
    return <SetupWizard />;
  }

  // If user is authenticated and setup is complete, show the main app
  return <AppContent />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SetupProvider>
          <AppConfigProvider>
            <AuthProvider>
              <SearchProvider>
                <Router>
                  <AuthenticatedApp />
                </Router>
              </SearchProvider>
            </AuthProvider>
          </AppConfigProvider>
        </SetupProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;