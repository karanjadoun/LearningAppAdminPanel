import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Google, School as SchoolIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signIn();
    } catch (error) {
      setError('Failed to sign in. Please try again.');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Card 
          sx={{ 
            maxWidth: 480,
            margin: '0 auto',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #F3F4F6',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
              p: 4,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              LearningApp
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                opacity: 0.9,
                fontWeight: 500,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              Admin Panel
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                }}
              >
                Welcome Back
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                Sign in to access your admin dashboard and manage your learning content.
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Google />}
              onClick={handleSignIn}
              disabled={loading}
              sx={{ 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <Box 
              sx={{ 
                mt: 3, 
                pt: 3, 
                borderTop: '1px solid #f1f5f9',
                textAlign: 'center',
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                Secure authentication powered by Google OAuth.
                <br />
                Your data is protected and encrypted.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage; 