import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Divider,
  Avatar,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Storage as DatabaseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAppConfig } from '../contexts/AppConfigContext';
import OneSignalSettings from '../components/Settings/OneSignalSettings';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { config, updateConfig, resetConfig } = useAppConfig();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAppConfig, setEditingAppConfig] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Profile settings state
  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
  });

  // App config state
  const [tempConfig, setTempConfig] = useState(config);

  // Sync tempConfig with config changes (e.g., when loaded from localStorage)
  React.useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleProfileSave = () => {
    // Here you would typically update the user profile
    console.log('Saving profile:', profile);
    setEditingProfile(false);
    setShowSuccess(true);
  };

  const handleAppConfigSave = () => {
    updateConfig(tempConfig);
    setEditingAppConfig(false);
    setShowSuccess(true);
  };

  const handleAppConfigCancel = () => {
    setTempConfig(config);
    setEditingAppConfig(false);
  };

  const handleResetAppConfig = () => {
    resetConfig();
    // Don't use config here as it might be stale, resetConfig will trigger the useEffect above
    setShowSuccess(true);
  };

  return (
    <Box sx={{ maxWidth: 1200, width: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
          }}
        >
          Settings
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
          }}
        >
          Manage your account preferences and admin panel configuration
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* OneSignal Push Notifications Settings */}
        <Grid item xs={12}>
          <OneSignalSettings />
        </Grid>

        {/* Profile Settings */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              height: 'fit-content',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              },
              transition: 'box-shadow 0.3s ease-in-out',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ fontSize: 24, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile Information
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 600,
                    mr: 3,
                  }}
                >
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {user?.displayName || 'Admin User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Administrator
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setEditingProfile(!editingProfile)}
                  >
                    {editingProfile ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>
              </Box>

              {editingProfile ? (
                <Box>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    disabled
                    helperText="Email cannot be changed"
                    sx={{ mb: 3 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleProfileSave}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => setEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Display Name
                    </Typography>
                    <Typography variant="body1">
                      {user?.displayName || 'Not set'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Panel Configuration */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              height: 'fit-content',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              },
              transition: 'box-shadow 0.3s ease-in-out',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaletteIcon sx={{ fontSize: 24, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Admin Panel Configuration
                </Typography>
                <Box sx={{ ml: 'auto' }}>
                  <Chip
                    label="Customizable"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>

              {editingAppConfig ? (
                <Box>
                  <TextField
                    fullWidth
                    label="App Name"
                    value={tempConfig.appName}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, appName: e.target.value }))}
                    helperText="This will appear in the sidebar and page titles"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="App Title"
                    value={tempConfig.appTitle}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, appTitle: e.target.value }))}
                    helperText="Subtitle shown below the app name"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="App Description"
                    value={tempConfig.appDescription}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, appDescription: e.target.value }))}
                    helperText="Brief description of your admin panel"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Logo Text"
                    value={tempConfig.logoText}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, logoText: e.target.value }))}
                    helperText="2-3 characters to display in the logo"
                    inputProps={{ maxLength: 3 }}
                    sx={{ mb: 3 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleAppConfigSave}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleAppConfigCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<RefreshIcon />}
                      onClick={handleResetAppConfig}
                    >
                      Reset to Default
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      App Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {config.appName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      App Title
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {config.appTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {config.appDescription}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Logo Text
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {config.logoText}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditingAppConfig(true)}
                  >
                    Customize Panel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              height: 'fit-content',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              },
              transition: 'box-shadow 0.3s ease-in-out',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ fontSize: 24, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security & Privacy
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    Authentication
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You're signed in with Google OAuth
                  </Typography>
                  <Button variant="outlined" size="small">
                    Manage Account
                  </Button>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    Session Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Last login: {new Date().toLocaleDateString()}
                  </Typography>
                  <Button variant="outlined" size="small" color="error">
                    Sign Out All Devices
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Database Info */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              height: 'fit-content',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              },
              transition: 'box-shadow 0.3s ease-in-out',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DatabaseIcon sx={{ fontSize: 24, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Database Information
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Connected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Database Status
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      Firebase
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Database Type
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'info.main' }}>
                      learningapp-4e692
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Project ID
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Settings updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 