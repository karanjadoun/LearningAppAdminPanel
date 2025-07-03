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
  Slider,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Campaign as AdsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  TrendingUp as FrequencyIcon,
  Smartphone as MobileIcon,
  Settings as SettingsIcon,
  MonetizationOn as MonetizationIcon,
  DisplaySettings as DisplayIcon,
} from '@mui/icons-material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AdsSettings {
  // Global Ad Settings
  adsEnabled: boolean;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  adMobAppId: string;
  
  // Frequency Settings
  interstitialAdFrequencyContent: number;
  interstitialAdFrequencyFavorites: number;
  
  // Banner Ad Placement Settings
  bannerAdsOnHome: boolean;
  bannerAdsOnCategories: boolean;
  bannerAdsOnContent: boolean;
  bannerAdsOnFavorites: boolean;
  bannerAdsOnNotifications: boolean;
  
  // Advanced Settings
  testMode: boolean;
  adLoadTimeout: number;
  
  lastUpdated?: string;
}

const defaultAdsSettings: AdsSettings = {
  // Global Ad Settings
  adsEnabled: true,
  bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
  adMobAppId: 'ca-app-pub-3940256099942544~3347511713',
  
  // Frequency Settings
  interstitialAdFrequencyContent: 3,
  interstitialAdFrequencyFavorites: 5,
  
  // Banner Ad Placement Settings
  bannerAdsOnHome: true,
  bannerAdsOnCategories: true,
  bannerAdsOnContent: true,
  bannerAdsOnFavorites: true,
  bannerAdsOnNotifications: true,
  
  // Advanced Settings
  testMode: false,
  adLoadTimeout: 10000,
};

const AdsSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdsSettings>(defaultAdsSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
        const data = docSnap.data();
        // Extract only ads-related settings
        const adsData = {
          adsEnabled: data.adsEnabled ?? defaultAdsSettings.adsEnabled,
          bannerAdUnitId: data.bannerAdUnitId ?? defaultAdsSettings.bannerAdUnitId,
          interstitialAdUnitId: data.interstitialAdUnitId ?? defaultAdsSettings.interstitialAdUnitId,
          adMobAppId: data.adMobAppId ?? defaultAdsSettings.adMobAppId,
          interstitialAdFrequencyContent: data.interstitialAdFrequencyContent ?? defaultAdsSettings.interstitialAdFrequencyContent,
          interstitialAdFrequencyFavorites: data.interstitialAdFrequencyFavorites ?? defaultAdsSettings.interstitialAdFrequencyFavorites,
          bannerAdsOnHome: data.bannerAdsOnHome ?? defaultAdsSettings.bannerAdsOnHome,
          bannerAdsOnCategories: data.bannerAdsOnCategories ?? defaultAdsSettings.bannerAdsOnCategories,
          bannerAdsOnContent: data.bannerAdsOnContent ?? defaultAdsSettings.bannerAdsOnContent,
          bannerAdsOnFavorites: data.bannerAdsOnFavorites ?? defaultAdsSettings.bannerAdsOnFavorites,
          bannerAdsOnNotifications: data.bannerAdsOnNotifications ?? defaultAdsSettings.bannerAdsOnNotifications,
          testMode: data.testMode ?? defaultAdsSettings.testMode,
          adLoadTimeout: data.adLoadTimeout ?? defaultAdsSettings.adLoadTimeout,
        };
        setSettings(adsData);
        showSnackbar('Ads settings loaded successfully!', 'success');
      } else {
        setSettings(defaultAdsSettings);
        showSnackbar('No ads settings found. Using default values.', 'info');
      }
    } catch (error) {
      console.error('Error loading ads settings:', error);
      showSnackbar('Error loading ads settings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Get existing document to preserve other settings
      const docSnap = await getDoc(settingsRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};
      
      // Merge ads settings with existing data
      const updatedData = {
        ...existingData,
        ...settings,
        lastUpdated: new Date().toISOString()
      };
      
      await setDoc(settingsRef, updatedData);
      showSnackbar('Ads settings saved successfully! Changes will be applied to the app in real-time.', 'success');
    } catch (error) {
      console.error('Error saving ads settings:', error);
      showSnackbar('Error saving ads settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AdsSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSwitchChange = (field: keyof AdsSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSettings(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleSliderChange = (field: keyof AdsSettings) => (
    event: Event,
    newValue: number | number[]
  ) => {
    setSettings(prev => ({
      ...prev,
      [field]: newValue as number,
    }));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <AdsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Ads Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Control ad display, frequency, and monetization settings for your mobile app in real-time.
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Grid container spacing={3}>
          {/* Global Ad Control */}
          <Grid item xs={12}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Global Ad Control
                  </Typography>
                </Box>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.adsEnabled}
                        onChange={handleSwitchChange('adsEnabled')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Enable Ads Globally
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Turn off to disable all ads across the entire app
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>

                {!settings.adsEnabled && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    All ads are currently disabled. Users will not see any advertisements.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Ad Unit Configuration */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <MonetizationIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    AdMob Configuration
                  </Typography>
                  <Tooltip title="Get these IDs from your Google AdMob console">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="AdMob App ID"
                      value={settings.adMobAppId}
                      onChange={handleInputChange('adMobAppId')}
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MobileIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Your AdMob App ID from Google AdMob console"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Banner Ad Unit ID"
                      value={settings.bannerAdUnitId}
                      onChange={handleInputChange('bannerAdUnitId')}
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DisplayIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Banner ads displayed at bottom of screens"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Interstitial Ad Unit ID"
                      value={settings.interstitialAdUnitId}
                      onChange={handleInputChange('interstitialAdUnitId')}
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AdsIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Full-screen ads shown between content"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Frequency Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <FrequencyIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Interstitial Ad Frequency
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" fontWeight={500} gutterBottom>
                      Content Views Frequency
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={settings.interstitialAdFrequencyContent}
                        onChange={handleSliderChange('interstitialAdFrequencyContent')}
                        min={1}
                        max={20}
                        marks={[
                          { value: 1, label: '1' },
                          { value: 5, label: '5' },
                          { value: 10, label: '10' },
                          { value: 20, label: '20' },
                        ]}
                        valueLabelDisplay="on"
                        color="primary"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Show interstitial ad every <strong>{settings.interstitialAdFrequencyContent}</strong> content views
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" fontWeight={500} gutterBottom>
                      Favorite Actions Frequency
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={settings.interstitialAdFrequencyFavorites}
                        onChange={handleSliderChange('interstitialAdFrequencyFavorites')}
                        min={1}
                        max={20}
                        marks={[
                          { value: 1, label: '1' },
                          { value: 5, label: '5' },
                          { value: 10, label: '10' },
                          { value: 20, label: '20' },
                        ]}
                        valueLabelDisplay="on"
                        color="primary"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Show interstitial ad every <strong>{settings.interstitialAdFrequencyFavorites}</strong> favorite actions
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Banner Ad Placement */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <DisplayIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Banner Ad Placement
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Control which screens display banner ads at the bottom
                </Typography>

                <Grid container spacing={2}>
                  {[
                    { key: 'bannerAdsOnHome', label: 'Home Screen', icon: '🏠' },
                    { key: 'bannerAdsOnCategories', label: 'Categories Screen', icon: '📂' },
                    { key: 'bannerAdsOnContent', label: 'Content Detail Screen', icon: '📄' },
                    { key: 'bannerAdsOnFavorites', label: 'Favorites Screen', icon: '❤️' },
                    { key: 'bannerAdsOnNotifications', label: 'Notifications Screen', icon: '🔔' },
                  ].map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.key}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          backgroundColor: settings[item.key as keyof AdsSettings] 
                            ? 'primary.light' 
                            : 'grey.50',
                          borderColor: settings[item.key as keyof AdsSettings] 
                            ? 'primary.main' 
                            : 'grey.300',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings[item.key as keyof AdsSettings] as boolean}
                              onChange={handleSwitchChange(item.key as keyof AdsSettings)}
                              color="primary"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span style={{ fontSize: '1.2em' }}>{item.icon}</span>
                              <Typography variant="body2" fontWeight={500}>
                                {item.label}
                              </Typography>
                            </Box>
                          }
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Advanced Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Advanced Settings
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.testMode}
                          onChange={handleSwitchChange('testMode')}
                          color="warning"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            Test Mode
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Use test ad units for development
                          </Typography>
                        </Box>
                      }
                    />
                    {settings.testMode && (
                      <Chip 
                        label="Test ads will be shown" 
                        color="warning" 
                        size="small" 
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ad Load Timeout (ms)"
                      type="number"
                      value={settings.adLoadTimeout}
                      onChange={handleInputChange('adLoadTimeout')}
                      inputProps={{ min: 5000, max: 30000, step: 1000 }}
                      helperText="Time to wait for ads to load (5-30 seconds)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadSettings}
                disabled={loading || saving}
              >
                Reload Settings
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={saveSettings}
                disabled={loading || saving}
                sx={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  },
                }}
              >
                {saving ? 'Saving...' : 'Save Ads Settings'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdsSettings; 