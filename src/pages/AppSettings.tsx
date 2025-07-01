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
} from '@mui/icons-material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AppSettings {
  // App Identity
  appName: string;
  
  // Home Screen Content
  homeGreeting: string;
  homeSubtitle: string;
  homeCategoriesTitle: string;
  
  // Promo Card
  promoCardTitle: string;
  promoCardSubtitle: string;
  
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
  // App Identity
  appName: 'LearningApp',
  
  // Home Screen Content
  homeGreeting: 'Hi, %1$s',
  homeSubtitle: 'What would you like to learn today?',
  homeCategoriesTitle: 'Categories',
  
  // Promo Card
  promoCardTitle: 'Study App',
  promoCardSubtitle: 'Every Books Solutions\nAvailable for Free',
  
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
      <Box sx={{ mb: 4 }}>
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

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> Changes made here will be reflected in your mobile app within 24 hours or immediately after an app restart. 
          Settings are cached locally in the app for better performance.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
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
                    error={settings.privacyPolicyUrl && !isValidUrl(settings.privacyPolicyUrl)}
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
                    error={settings.moreAppsUrl && !isValidUrl(settings.moreAppsUrl)}
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