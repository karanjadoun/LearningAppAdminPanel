import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  InputAdornment,
  Tooltip,
  IconButton,
  Switch,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  Info as InfoIcon,
  Share as ShareIcon,
  Star as StarIcon,
  Policy as PolicyIcon,
  Person as PersonIcon,
  Apps as AppsIcon,
  Home as HomeIcon,
  Campaign as PromoIcon,
  Search as SearchIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Visibility as PreviewIcon,
  Security as SecurityIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AppSettings {
  // Authentication Control
  authEnabled: boolean;
  
  // App Identity
  appName: string;
  
  // Home Screen Content
  homeGreeting: string;
  homeSubtitle: string;
  homeCategoriesTitle: string;
  
  // Promo Card
  promoCardTitle: string;
  promoCardSubtitle: string;
  promoCardBackgroundColor: string;
  promoCardTitleColor: string;
  promoCardSubtitleColor: string;
  
  // Loading Animation Colors
  loadingAnimationColor: string;
  loadingTextColor: string;
  
  // Bottom Navigation Colors
  bottomNavHomeColor: string;
  bottomNavHeartColor: string;
  bottomNavGridColor: string;
  bottomNavSettingsColor: string;
  bottomNavUnselectedColor: string;
  
  // Search Settings
  searchPlaceholder1: string;
  searchPlaceholder2: string;
  searchPlaceholder3: string;
  
  // User Messages
  searchingText: string;
  noResultsText: string;
  noCategoriesText: string;
  pullToRefreshText: string;
  failedToLoadText: string;
  lessonsCountText: string;
  
  // Settings Screen
  privacyPolicyUrl: string;
  aboutDeveloperText: string;
  shareAppText: string;
  rateAppText: string;
  moreAppsUrl: string;
  
  lastUpdated?: string;
}

const defaultSettings: AppSettings = {
  // Authentication Control
  authEnabled: false,
  
  // App Identity
  appName: 'LearningApp',
  
  // Home Screen Content
  homeGreeting: 'Hi, %1$s',
  homeSubtitle: 'What would you like to learn today?',
  homeCategoriesTitle: 'Categories',
  
  // Promo Card
  promoCardTitle: 'Study App',
  promoCardSubtitle: 'Every Books Solutions\nAvailable for Free',
  promoCardBackgroundColor: '#fe4a49',
  promoCardTitleColor: '#FFFFFF',
  promoCardSubtitleColor: '#FFFFFF',
  
  // Loading Animation Colors
  loadingAnimationColor: '#FF156D',
  loadingTextColor: '#666666',
  
  // Bottom Navigation Colors
  bottomNavHomeColor: '#3B82F6',     // Modern Blue
  bottomNavHeartColor: '#EF4444',    // Modern Red
  bottomNavGridColor: '#F59E0B',     // Modern Amber
  bottomNavSettingsColor: '#8B5CF6', // Modern Purple
  bottomNavUnselectedColor: '#9CA3AF', // Gray
  
  // Search Settings
  searchPlaceholder1: 'Search Mathematics...',
  searchPlaceholder2: 'Search Science...',
  searchPlaceholder3: 'Search Economics...',
  
  // User Messages
  searchingText: 'Searching...',
  noResultsText: 'No results found for "%1$s"',
  noCategoriesText: 'No categories available',
  pullToRefreshText: 'Pull down to refresh',
  failedToLoadText: 'Failed to load categories',
  lessonsCountText: '%1$d Lessons',
  
  // Settings Screen
  privacyPolicyUrl: 'https://sites.google.com/view/privacypolicy-awesomeeducation',
  aboutDeveloperText: 'Developed by Karan Singh Jadoun',
  shareAppText: 'Check out this amazing study app! %1$s',
  rateAppText: 'If you enjoy using this app, please rate us!',
  moreAppsUrl: 'https://play.google.com/store/apps/developer?id=YourDeveloperName',
};

const AppSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const settingsRef = doc(db, 'app_settings', 'general');

  useEffect(() => {
    loadSettings();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        setSettings(data);
        showSnackbar('Settings loaded successfully!', 'success');
      } else {
        setSettings(defaultSettings);
        showSnackbar('No settings found. Using default values.', 'info');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showSnackbar('Error loading settings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Validate URLs
      if (!isValidUrl(settings.privacyPolicyUrl)) {
        throw new Error('Privacy Policy URL is not valid');
      }
      if (!isValidUrl(settings.moreAppsUrl)) {
        throw new Error('More Apps URL is not valid');
      }

      // Validate required fields
      if (!settings.appName.trim()) {
        throw new Error('App Name is required');
      }
      if (!settings.homeGreeting.trim()) {
        throw new Error('Home Greeting is required');
      }
      if (!settings.homeSubtitle.trim()) {
        throw new Error('Home Subtitle is required');
      }
      if (!settings.aboutDeveloperText.trim()) {
        throw new Error('About Developer text is required');
      }

      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(settingsRef, updatedSettings, { merge: true });
      setSettings(updatedSettings);
      
      showSnackbar(
        'Settings updated successfully! Changes will appear in the app within 24 hours or on next app restart.',
        'success'
      );
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showSnackbar(`Error saving settings: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field: keyof AppSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSettings(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange = (field: keyof AppSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSettings(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4,
        position: 'fixed',
        top: 0,
        left: {
          xs: 0, // Mobile: full width
          lg: '280px' // Desktop: start after sidebar (280px width)
        },
        right: 0,
        backgroundColor: '#fff',
        zIndex: 1000,
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        p: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            App Settings
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Settings">
              <IconButton onClick={loadSettings} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Control your app's dynamic settings that users see in the mobile app
        </Typography>
      </Box>

      {/* Spacer to prevent content from being hidden behind fixed header */}
      <Box sx={{ height: 120, mb: 3 }} />

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> Changes made here will be reflected in your mobile app within 24 hours or immediately after an app restart. 
          Settings are cached locally in the app for better performance.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Authentication Control */}
        <Grid item xs={12}>
          <Card sx={{ border: '2px solid', borderColor: settings.authEnabled ? 'error.main' : 'success.main' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Authentication Control
                </Typography>
                {settings.authEnabled ? (
                  <LockIcon color="error" />
                ) : (
                  <LockOpenIcon color="success" />
                )}
              </Box>
              
              <Alert 
                severity={settings.authEnabled ? "warning" : "info"} 
                sx={{ mb: 3 }}
              >
                <Typography variant="body2">
                  <strong>
                    {settings.authEnabled 
                      ? "⚠️ Authentication Required: Users must sign in with Google to access the app"
                      : "🔓 Free Access: Users can access all content without signing in"
                    }
                  </strong>
                </Typography>
              </Alert>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.authEnabled}
                      onChange={handleSwitchChange('authEnabled')}
                      color={settings.authEnabled ? "error" : "success"}
                      size="medium"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        Google Authentication Required
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({settings.authEnabled ? 'ON' : 'OFF'})
                      </Typography>
                    </Box>
                  }
                />
              </FormGroup>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {settings.authEnabled 
                  ? "🔐 When enabled, users must sign in with Google before accessing any app content. Perfect for premium or restricted content."
                  : "🆓 When disabled, users can access all app content freely without authentication. Ideal for public educational content."
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* App Identity */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AppsIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  App Identity
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                label="App Name"
                value={settings.appName}
                onChange={handleInputChange('appName')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AppsIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="The display name of your learning app"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Home Screen Content */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <HomeIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Home Screen Content
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Home Greeting"
                    value={settings.homeGreeting}
                    onChange={handleInputChange('homeGreeting')}
                    required
                    helperText="Use %1$s for username placeholder (e.g., 'Hi, %1$s')"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Home Subtitle"
                    value={settings.homeSubtitle}
                    onChange={handleInputChange('homeSubtitle')}
                    required
                    helperText="Subtitle text below the greeting"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Categories Title"
                    value={settings.homeCategoriesTitle}
                    onChange={handleInputChange('homeCategoriesTitle')}
                    required
                    helperText="Title for the categories section"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Promo Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PromoIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Promo Card Content
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Promo Card Title"
                    value={settings.promoCardTitle}
                    onChange={handleInputChange('promoCardTitle')}
                    required
                    helperText="Main title for the promotional card"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Promo Card Subtitle"
                    value={settings.promoCardSubtitle}
                    onChange={handleInputChange('promoCardSubtitle')}
                    required
                    multiline
                    rows={2}
                    helperText="Subtitle text. Use \n for line breaks"
                  />
                </Grid>
              </Grid>

              {/* Promo Card Color Controls */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎨 Promo Card Colors
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Customize the colors of your promo card. Changes will be applied instantly in the mobile app.
                  </Typography>
                </Alert>
                
                <Grid container spacing={3}>
                  {/* Promo Card Background Color */}
                  <Grid item xs={12} md={6} lg={4}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        🎨 Background Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <input
                          type="color"
                          value={settings.promoCardBackgroundColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, promoCardBackgroundColor: e.target.value }))}
                          style={{ 
                            width: 50, 
                            height: 40, 
                            border: 'none', 
                            borderRadius: 8, 
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <TextField
                          size="small"
                          value={settings.promoCardBackgroundColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, promoCardBackgroundColor: e.target.value }))}
                          sx={{ flexGrow: 1 }}
                          InputProps={{
                            style: { fontFamily: 'monospace' }
                          }}
                        />
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 20, 
                        backgroundColor: settings.promoCardBackgroundColor,
                        borderRadius: 1,
                        border: '1px solid #E5E7EB'
                      }} />
                    </Box>
                  </Grid>

                  {/* Promo Card Title Color */}
                  <Grid item xs={12} md={6} lg={4}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        📝 Title Text Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <input
                          type="color"
                          value={settings.promoCardTitleColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, promoCardTitleColor: e.target.value }))}
                          style={{ 
                            width: 50, 
                            height: 40, 
                            border: 'none', 
                            borderRadius: 8, 
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <TextField
                          size="small"
                          value={settings.promoCardTitleColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, promoCardTitleColor: e.target.value }))}
                          sx={{ flexGrow: 1 }}
                          InputProps={{
                            style: { fontFamily: 'monospace' }
                          }}
                        />
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 20, 
                        backgroundColor: settings.promoCardTitleColor,
                        borderRadius: 1,
                        border: '1px solid #E5E7EB'
                      }} />
                    </Box>
                  </Grid>

                  {/* Promo Card Subtitle Color */}
                  <Grid item xs={12} md={6} lg={4}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        📄 Subtitle Text Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <input
                          type="color"
                          value={settings.promoCardSubtitleColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, promoCardSubtitleColor: e.target.value }))}
                          style={{ 
                            width: 50, 
                            height: 40, 
                            border: 'none', 
                            borderRadius: 8, 
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <TextField
                          size="small"
                          value={settings.promoCardSubtitleColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, promoCardSubtitleColor: e.target.value }))}
                          sx={{ flexGrow: 1 }}
                          InputProps={{
                            style: { fontFamily: 'monospace' }
                          }}
                        />
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 20, 
                        backgroundColor: settings.promoCardSubtitleColor,
                        borderRadius: 1,
                        border: '1px solid #E5E7EB'
                      }} />
                    </Box>
                  </Grid>

                  {/* Promo Card Preview */}
                  <Grid item xs={12}>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Live Preview:
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        p: 3,
                        backgroundColor: '#F9FAFB',
                        borderRadius: 2,
                        border: '1px solid #E5E7EB'
                      }}>
                        <Box sx={{ 
                          backgroundColor: settings.promoCardBackgroundColor,
                          p: 3,
                          borderRadius: 3,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          minWidth: 280,
                          textAlign: 'center'
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: settings.promoCardTitleColor,
                              fontWeight: 700,
                              mb: 1,
                              fontSize: '1.1rem'
                            }}
                          >
                            {settings.promoCardTitle}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: settings.promoCardSubtitleColor,
                              fontWeight: 500,
                              whiteSpace: 'pre-line',
                              lineHeight: 1.4
                            }}
                          >
                            {settings.promoCardSubtitle}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        Preview shows how the promo card will appear in your mobile app with the selected colors.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Loading Animation Colors */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  backgroundColor: settings.loadingAnimationColor,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  🔄
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Loading Animation Colors
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>🔄 Loading Colors:</strong> These colors control the loading animations (bouncing squares and text) that appear when content is loading throughout the app. Changes will appear instantly.
                </Typography>
              </Alert>
              
              <Grid container spacing={3}>
                {/* Loading Animation Color */}
                <Grid item xs={12} md={6} lg={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      🔳 Loading Squares Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <input
                        type="color"
                        value={settings.loadingAnimationColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, loadingAnimationColor: e.target.value }))}
                        style={{ 
                          width: 50, 
                          height: 40, 
                          border: 'none', 
                          borderRadius: 8, 
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <TextField
                        size="small"
                        value={settings.loadingAnimationColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, loadingAnimationColor: e.target.value }))}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                          style: { fontFamily: 'monospace' }
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 20, 
                      backgroundColor: settings.loadingAnimationColor,
                      borderRadius: 1,
                      border: '1px solid #E5E7EB'
                    }} />
                  </Box>
                </Grid>

                {/* Loading Text Color */}
                <Grid item xs={12} md={6} lg={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      📝 Loading Text Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <input
                        type="color"
                        value={settings.loadingTextColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, loadingTextColor: e.target.value }))}
                        style={{ 
                          width: 50, 
                          height: 40, 
                          border: 'none', 
                          borderRadius: 8, 
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <TextField
                        size="small"
                        value={settings.loadingTextColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, loadingTextColor: e.target.value }))}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                          style: { fontFamily: 'monospace' }
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 20, 
                      backgroundColor: settings.loadingTextColor,
                      borderRadius: 1,
                      border: '1px solid #E5E7EB'
                    }} />
                  </Box>
                </Grid>

                {/* Loading Animation Preview */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Live Preview:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center', 
                      alignItems: 'center',
                      p: 4,
                      backgroundColor: '#F9FAFB',
                      borderRadius: 2,
                      border: '1px solid #E5E7EB',
                      gap: 2
                    }}>
                      {/* Animated Loading Squares */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        alignItems: 'center'
                      }}>
                        {[0, 1, 2].map((index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: settings.loadingAnimationColor,
                              borderRadius: 1,
                              animation: 'bounce 1.4s ease-in-out infinite both',
                              animationDelay: `${index * 0.16}s`,
                              '@keyframes bounce': {
                                '0%, 80%, 100%': {
                                  transform: 'scale(0)',
                                },
                                '40%': {
                                  transform: 'scale(1.0)',
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                      
                      {/* Loading Text */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: settings.loadingTextColor,
                          fontWeight: 500
                        }}
                      >
                        Loading content...
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                      Preview shows the loading animation with your selected colors as it appears in the mobile app.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Bottom Navigation Colors */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 24, 
                    height: 24, 
                    background: 'linear-gradient(45deg, #3B82F6, #EF4444, #F59E0B, #8B5CF6)', 
                    borderRadius: 1 
                  }} />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Bottom Navigation Colors
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Customize the colors of your app's bottom navigation icons. Changes will be applied instantly in the mobile app.
                </Typography>
              </Alert>
              
              <Grid container spacing={3}>
                {/* Home Icon Color */}
                <Grid item xs={12} md={6} lg={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      🏠 Home Icon Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <input
                        type="color"
                        value={settings.bottomNavHomeColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavHomeColor: e.target.value }))}
                        style={{ 
                          width: 50, 
                          height: 40, 
                          border: 'none', 
                          borderRadius: 8, 
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <TextField
                        size="small"
                        value={settings.bottomNavHomeColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavHomeColor: e.target.value }))}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                          style: { fontFamily: 'monospace' }
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 20, 
                      backgroundColor: settings.bottomNavHomeColor,
                      borderRadius: 1,
                      border: '1px solid #E5E7EB'
                    }} />
                  </Box>
                </Grid>

                {/* Heart Icon Color */}
                <Grid item xs={12} md={6} lg={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      ❤️ Favorites Icon Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <input
                        type="color"
                        value={settings.bottomNavHeartColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavHeartColor: e.target.value }))}
                        style={{ 
                          width: 50, 
                          height: 40, 
                          border: 'none', 
                          borderRadius: 8, 
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <TextField
                        size="small"
                        value={settings.bottomNavHeartColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavHeartColor: e.target.value }))}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                          style: { fontFamily: 'monospace' }
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 20, 
                      backgroundColor: settings.bottomNavHeartColor,
                      borderRadius: 1,
                      border: '1px solid #E5E7EB'
                    }} />
                  </Box>
                </Grid>

                {/* Grid Icon Color */}
                <Grid item xs={12} md={6} lg={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      📊 Categories Icon Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <input
                        type="color"
                        value={settings.bottomNavGridColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavGridColor: e.target.value }))}
                        style={{ 
                          width: 50, 
                          height: 40, 
                          border: 'none', 
                          borderRadius: 8, 
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <TextField
                        size="small"
                        value={settings.bottomNavGridColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavGridColor: e.target.value }))}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                          style: { fontFamily: 'monospace' }
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 20, 
                      backgroundColor: settings.bottomNavGridColor,
                      borderRadius: 1,
                      border: '1px solid #E5E7EB'
                    }} />
                  </Box>
                </Grid>

                {/* Settings Icon Color */}
                <Grid item xs={12} md={6} lg={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      ⚙️ Settings Icon Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <input
                        type="color"
                        value={settings.bottomNavSettingsColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavSettingsColor: e.target.value }))}
                        style={{ 
                          width: 50, 
                          height: 40, 
                          border: 'none', 
                          borderRadius: 8, 
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <TextField
                        size="small"
                        value={settings.bottomNavSettingsColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavSettingsColor: e.target.value }))}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                          style: { fontFamily: 'monospace' }
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 20, 
                      backgroundColor: settings.bottomNavSettingsColor,
                      borderRadius: 1,
                      border: '1px solid #E5E7EB'
                    }} />
                  </Box>
                </Grid>

                {/* Unselected Icon Color */}
                <Grid item xs={12} md={6} lg={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      ⚪ Unselected Icons Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <input
                        type="color"
                        value={settings.bottomNavUnselectedColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavUnselectedColor: e.target.value }))}
                        style={{ 
                          width: 50, 
                          height: 40, 
                          border: 'none', 
                          borderRadius: 8, 
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <TextField
                        size="small"
                        value={settings.bottomNavUnselectedColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, bottomNavUnselectedColor: e.target.value }))}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                          style: { fontFamily: 'monospace' }
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 20, 
                      backgroundColor: settings.bottomNavUnselectedColor,
                      borderRadius: 1,
                      border: '1px solid #E5E7EB'
                    }} />
                  </Box>
                </Grid>

                {/* Bottom Navigation Preview */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Live Preview:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      p: 3,
                      backgroundColor: '#F9FAFB',
                      borderRadius: 2,
                      border: '1px solid #E5E7EB'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6,
                        backgroundColor: 'white',
                        p: 2,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #E5E7EB'
                      }}>
                        {/* Home Icon */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            backgroundColor: settings.bottomNavHomeColor,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px'
                          }}>
                            🏠
                          </Box>
                          <Box sx={{ 
                            width: 20, 
                            height: 2, 
                            backgroundColor: settings.bottomNavHomeColor,
                            borderRadius: 1
                          }} />
                        </Box>

                        {/* Heart Icon */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            backgroundColor: settings.bottomNavUnselectedColor,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px'
                          }}>
                            ❤️
                          </Box>
                        </Box>

                        {/* Grid Icon */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            backgroundColor: settings.bottomNavUnselectedColor,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px'
                          }}>
                            📊
                          </Box>
                        </Box>

                        {/* Settings Icon */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            backgroundColor: settings.bottomNavUnselectedColor,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px'
                          }}>
                            ⚙️
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                      Preview shows the Home tab selected (with underline). Other tabs use the unselected color.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Search Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SearchIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Search Placeholders
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Search Placeholder 1"
                    value={settings.searchPlaceholder1}
                    onChange={handleInputChange('searchPlaceholder1')}
                    required
                    helperText="First rotating search placeholder"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Search Placeholder 2"
                    value={settings.searchPlaceholder2}
                    onChange={handleInputChange('searchPlaceholder2')}
                    required
                    helperText="Second rotating search placeholder"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Search Placeholder 3"
                    value={settings.searchPlaceholder3}
                    onChange={handleInputChange('searchPlaceholder3')}
                    required
                    helperText="Third rotating search placeholder"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* User Messages */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MessageIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  User Messages & States
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Searching Text"
                    value={settings.searchingText}
                    onChange={handleInputChange('searchingText')}
                    required
                    helperText="Message shown while searching"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="No Results Text"
                    value={settings.noResultsText}
                    onChange={handleInputChange('noResultsText')}
                    required
                    helperText="Use %1$s for search query placeholder"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="No Categories Text"
                    value={settings.noCategoriesText}
                    onChange={handleInputChange('noCategoriesText')}
                    required
                    helperText="Message when no categories are available"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Pull to Refresh Text"
                    value={settings.pullToRefreshText}
                    onChange={handleInputChange('pullToRefreshText')}
                    required
                    helperText="Message for pull-to-refresh action"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Failed to Load Text"
                    value={settings.failedToLoadText}
                    onChange={handleInputChange('failedToLoadText')}
                    required
                    helperText="Error message when loading fails"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lessons Count Text"
                    value={settings.lessonsCountText}
                    onChange={handleInputChange('lessonsCountText')}
                    required
                    helperText="Use %1$d for lesson count placeholder"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Screen */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Settings Screen
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Privacy Policy URL"
                    value={settings.privacyPolicyUrl}
                    onChange={handleInputChange('privacyPolicyUrl')}
                    required
                    type="url"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PolicyIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Link to your app's privacy policy"
                    error={Boolean(settings.privacyPolicyUrl && !isValidUrl(settings.privacyPolicyUrl))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="More Apps URL"
                    value={settings.moreAppsUrl}
                    onChange={handleInputChange('moreAppsUrl')}
                    required
                    type="url"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AppsIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Link to your other apps on Play Store"
                    error={Boolean(settings.moreAppsUrl && !isValidUrl(settings.moreAppsUrl))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="About Developer"
                    value={settings.aboutDeveloperText}
                    onChange={handleInputChange('aboutDeveloperText')}
                    required
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Text shown in 'About Developer' section"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Share App Message"
                    value={settings.shareAppText}
                    onChange={handleInputChange('shareAppText')}
                    required
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ShareIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Use %1$s for Play Store URL placeholder"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rate App Message"
                    value={settings.rateAppText}
                    onChange={handleInputChange('rateAppText')}
                    required
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StarIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Message shown when asking users to rate your app"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview */}
        {showPreview && (
          <Grid item xs={12}>
            <Card sx={{ border: '2px dashed', borderColor: 'primary.main' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <PreviewIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Live Preview
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  maxWidth: 350, 
                  mx: 'auto', 
                  bgcolor: '#000', 
                  borderRadius: 4, 
                  p: 2,
                  boxShadow: 3
                }}>
                  <Box sx={{ 
                    bgcolor: 'white', 
                    borderRadius: 2, 
                    p: 3, 
                    minHeight: 400 
                  }}>
                    {/* Home Screen Preview */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {settings.homeGreeting.replace('%1$s', 'Admin')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {settings.homeSubtitle}
                      </Typography>
                    </Box>
                    
                    {/* Promo Card Preview */}
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                      color: 'white',
                      p: 2,
                      borderRadius: 2,
                      mb: 3
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {settings.promoCardTitle}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {settings.promoCardSubtitle}
                      </Typography>
                    </Box>
                    
                    {/* Categories Preview */}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {settings.homeCategoriesTitle}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1,
                        fontSize: '0.75rem',
                        color: 'text.secondary'
                      }}>
                        <Box sx={{ 
                          bgcolor: 'grey.100', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1 
                        }}>
                          {settings.searchPlaceholder1}
                        </Box>
                        <Box sx={{ 
                          bgcolor: 'grey.100', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1 
                        }}>
                          {settings.searchPlaceholder2}
                        </Box>
                        <Box sx={{ 
                          bgcolor: 'grey.100', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1 
                        }}>
                          {settings.searchPlaceholder3}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Settings Status */}
        {settings.lastUpdated && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Last Updated:</strong> {new Date(settings.lastUpdated).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppSettings; 