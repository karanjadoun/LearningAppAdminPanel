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

// Modern vibrant theme with colorful design
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B35', // Vibrant orange
      light: '#FF8C69',
      dark: '#E55B2B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00D9FF', // Bright cyan
      light: '#33E1FF',
      dark: '#00C4E6',
      contrastText: '#ffffff',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: '#ffffff',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096',
    },
    success: {
      main: '#48BB78', // Vibrant green
      light: '#68D391',
      dark: '#38A169',
    },
    warning: {
      main: '#ED8936', // Vibrant orange
      light: '#F6AD55',
      dark: '#DD6B20',
    },
    error: {
      main: '#F56565', // Vibrant red
      light: '#FC8181',
      dark: '#E53E3E',
    },
    info: {
      main: '#4299E1', // Vibrant blue
      light: '#63B3ED',
      dark: '#3182CE',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #FF6B35 0%, #F093FB 50%, #F5576C 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@import': 'url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap")',
        body: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          scrollbarColor: '#FF6B35 #f5f5f5',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: '#f5f5f5',
            borderRadius: 10,
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #FF6B35, #00D9FF)',
            borderRadius: 10,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(135deg, #E55B2B, #00C4E6)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px rgba(255, 107, 53, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #FF6B35 0%, #F093FB 50%, #F5576C 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #E55B2B 0%, #D084EB 50%, #E5475C 100%)',
            boxShadow: '0 15px 35px rgba(255, 107, 53, 0.4)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: 'transparent',
          background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B35, #00D9FF) border-box',
          '&:hover': {
            borderWidth: 2,
            background: 'linear-gradient(rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.1)) padding-box, linear-gradient(135deg, #FF6B35, #00D9FF) border-box',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            background: 'rgba(255, 255, 255, 0.98)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '32px !important',
          '&:last-child': {
            paddingBottom: '32px !important',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8rem',
          borderRadius: 12,
          padding: '8px 4px',
          height: 'auto',
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #FF6B35, #F093FB)',
          color: '#ffffff',
        },
        colorSecondary: {
          background: 'linear-gradient(135deg, #00D9FF, #48BB78)',
          color: '#ffffff',
        },
        colorSuccess: {
          background: 'linear-gradient(135deg, #48BB78, #68D391)',
          color: '#ffffff',
        },
        colorError: {
          background: 'linear-gradient(135deg, #F56565, #FC8181)',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.9)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 1)',
              boxShadow: '0 0 0 3px rgba(255, 107, 53, 0.1)',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '16px 24px',
          fontSize: '0.95rem',
          fontWeight: 500,
        },
        standardInfo: {
          background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.1), rgba(99, 179, 237, 0.1))',
          border: '1px solid rgba(66, 153, 225, 0.3)',
        },
        standardSuccess: {
          background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(104, 211, 145, 0.1))',
          border: '1px solid rgba(72, 187, 120, 0.3)',
        },
        standardWarning: {
          background: 'linear-gradient(135deg, rgba(237, 137, 54, 0.1), rgba(246, 173, 85, 0.1))',
          border: '1px solid rgba(237, 137, 54, 0.3)',
        },
        standardError: {
          background: 'linear-gradient(135deg, rgba(245, 101, 101, 0.1), rgba(252, 129, 129, 0.1))',
          border: '1px solid rgba(245, 101, 101, 0.3)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          padding: '8px',
          backdropFilter: 'blur(10px)',
        },
        indicator: {
          background: 'linear-gradient(135deg, #FF6B35, #00D9FF)',
          height: 3,
          borderRadius: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          borderRadius: 12,
          margin: '0 4px',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(255, 107, 53, 0.1)',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(0, 217, 255, 0.1))',
            color: '#FF6B35',
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundAttachment: 'fixed',
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
          p: { xs: 3, sm: 4 },
          background: 'transparent',
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed',
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{
            color: '#FF6B35',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            mt: 3,
            color: 'white',
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