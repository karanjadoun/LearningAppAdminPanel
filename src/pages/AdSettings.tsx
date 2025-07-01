import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  FormGroup,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  MonetizationOn as AdIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  BugReport as TestIcon,
  TrendingUp as RevenueIcon,
  ViewModule as NativeIcon,
  CropFree as BannerIcon,
  Fullscreen as InterstitialIcon,
  CardGiftcard as RewardedIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AdSettings {
  // Global Ad Controls
  adsEnabled: boolean;
  adFreeMode: boolean;
  
  // Native Ads
  nativeAdsEnabled: boolean;
  nativeAdFrequency: number;
  nativeAdsOnHomePage: boolean;
  
  // Rewarded Ads
  rewardedAdsEnabled: boolean;
  rewardedAdButton: string;
  rewardedAdReward: string;
  rewardedAdValue: number;
  
  // Banner Ads
  bannerAdsEnabled: boolean;
  bannerAdPosition: string;
  bannerAdSize: string;
  
  // Interstitial Ads
  interstitialAdsEnabled: boolean;
  interstitialFrequency: number;
  interstitialCooldown: number;
  
  // Ad Timing & Frequency
  firstAdDelay: number;
  maxAdsPerSession: number;
  maxAdsPerHour: number;
  
  // Content Filtering
  childSafeAdsOnly: boolean;
  blockGameAds: boolean;
  
  // Testing
  testAdsEnabled: boolean;
  
  lastUpdated?: string;
}

const defaultAdSettings: AdSettings = {
  // Global Ad Controls
  adsEnabled: true,
  adFreeMode: false,
  
  // Native Ads
  nativeAdsEnabled: true,
  nativeAdFrequency: 3,
  nativeAdsOnHomePage: true,
  
  // Rewarded Ads
  rewardedAdsEnabled: true,
  rewardedAdButton: 'Remove Ads for 24h',
  rewardedAdReward: '24 hours ad-free',
  rewardedAdValue: 24,
  
  // Banner Ads
  bannerAdsEnabled: true,
  bannerAdPosition: 'bottom',
  bannerAdSize: 'standard',
  
  // Interstitial Ads
  interstitialAdsEnabled: false,
  interstitialFrequency: 5,
  interstitialCooldown: 180,
  
  // Ad Timing & Frequency
  firstAdDelay: 300,
  maxAdsPerSession: 8,
  maxAdsPerHour: 3,
  
  // Content Filtering
  childSafeAdsOnly: true,
  blockGameAds: true,
  
  // Testing
  testAdsEnabled: false,
};

const AdSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdSettings>(defaultAdSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const settingsRef = doc(db, 'app_settings', 'ads');

  useEffect(() => {
    loadSettings();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar(prev => ({ ...prev, open: false })), 5000);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as AdSettings;
        setSettings(data);
        showSnackbar('Ad settings loaded successfully!', 'success');
      } else {
        setSettings(defaultAdSettings);
        showSnackbar('No ad settings found. Using default values.', 'info');
      }
    } catch (error) {
      console.error('Error loading ad settings:', error);
      showSnackbar('Error loading ad settings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(settingsRef, updatedSettings, { merge: true });
      setSettings(updatedSettings);
      
      showSnackbar(
        'Ad settings updated successfully! Changes will be applied in the app immediately.',
        'success'
      );
    } catch (error: any) {
      console.error('Error saving ad settings:', error);
      showSnackbar(`Error saving ad settings: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchChange = (field: keyof AdSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSettings(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleInputChange = (field: keyof AdSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'number' ? 
      parseInt(event.target.value) || 0 : 
      event.target.value;
    
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: keyof AdSettings) => (
    event: any
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
          <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdIcon color="primary" />
            Ads Settings
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
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Control your app's advertisement settings and revenue optimization
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>💰 Ad Revenue Control:</strong> These settings control all advertisements in your app. 
          Enable specific ad types for revenue while maintaining good user experience. Changes apply instantly without app updates.
        </Typography>
      </Alert>

      {/* Snackbar Alert */}
      {snackbar.open && (
        <Alert severity={snackbar.severity} sx={{ mb: 3 }}>
          {snackbar.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Master Controls */}
        <Grid item xs={12}>
          <Card sx={{ border: '2px solid', borderColor: settings.adsEnabled ? 'success.main' : 'error.main' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AdIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Master Controls
                </Typography>
                {settings.adsEnabled ? (
                  <>
                    <LockOpenIcon color="success" />
                    <Chip label="Ads Active" color="success" size="small" />
                  </>
                ) : (
                  <>
                    <LockIcon color="error" />
                    <Chip label="Ads Disabled" color="error" size="small" />
                  </>
                )}
              </Box>
              
              <Alert 
                severity={settings.adsEnabled ? "success" : "warning"} 
                sx={{ mb: 3 }}
              >
                <Typography variant="body2">
                  <strong>
                    {settings.adsEnabled 
                      ? "💰 Ads Enabled: Your app is generating ad revenue"
                      : "🚫 Ads Disabled: No advertisements will be shown"
                    }
                  </strong>
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.adsEnabled}
                          onChange={handleSwitchChange('adsEnabled')}
                          color={settings.adsEnabled ? "success" : "error"}
                          size="medium"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Enable Advertisements
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Master switch to enable/disable all ads in the app
                          </Typography>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.adFreeMode}
                          onChange={handleSwitchChange('adFreeMode')}
                          color="warning"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Ad-Free Mode
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Temporarily disable all ads (for premium users or testing)
                          </Typography>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Native Ads */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <NativeIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Native Ads (Recommended)
                </Typography>
                <Chip 
                  label="Best UX" 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ads that blend seamlessly with your app content for better user experience
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.nativeAdsEnabled}
                          onChange={handleSwitchChange('nativeAdsEnabled')}
                          color="primary"
                        />
                      }
                      label="Enable Native Ads"
                    />
                  </FormGroup>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Show Native Ad Every</InputLabel>
                    <Select
                      value={settings.nativeAdFrequency}
                      onChange={handleSelectChange('nativeAdFrequency')}
                      label="Show Native Ad Every"
                    >
                      <MenuItem value={2}>2nd item</MenuItem>
                      <MenuItem value={3}>3rd item</MenuItem>
                      <MenuItem value={4}>4th item</MenuItem>
                      <MenuItem value={5}>5th item</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.nativeAdsOnHomePage}
                          onChange={handleSwitchChange('nativeAdsOnHomePage')}
                        />
                      }
                      label="Native Ads on Home Page"
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Rewarded Ads */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <RewardedIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Rewarded Ads (Best User Experience)
                </Typography>
                <Chip 
                  label="User Choice" 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Users watch ads voluntarily to earn rewards - highest user satisfaction
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.rewardedAdsEnabled}
                          onChange={handleSwitchChange('rewardedAdsEnabled')}
                        />
                      }
                      label="Enable Rewarded Ads"
                    />
                  </FormGroup>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ad-Free Hours Granted</InputLabel>
                    <Select
                      value={settings.rewardedAdValue}
                      onChange={handleSelectChange('rewardedAdValue')}
                      label="Ad-Free Hours Granted"
                    >
                      <MenuItem value={1}>1 hour</MenuItem>
                      <MenuItem value={6}>6 hours</MenuItem>
                      <MenuItem value={12}>12 hours</MenuItem>
                      <MenuItem value={24}>24 hours</MenuItem>
                      <MenuItem value={48}>48 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Rewarded Ad Button Text"
                    value={settings.rewardedAdButton}
                    onChange={handleInputChange('rewardedAdButton')}
                    placeholder="Watch ad to remove ads"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Reward Description"
                    value={settings.rewardedAdReward}
                    onChange={handleInputChange('rewardedAdReward')}
                    placeholder="What users get for watching"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Banner Ads */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BannerIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Banner Ads
                </Typography>
                <Chip 
                  label="Consistent Revenue" 
                  color="primary" 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Small ads shown at top or bottom of screen for continuous revenue
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.bannerAdsEnabled}
                          onChange={handleSwitchChange('bannerAdsEnabled')}
                        />
                      }
                      label="Enable Banner Ads"
                    />
                  </FormGroup>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Banner Position</InputLabel>
                    <Select
                      value={settings.bannerAdPosition}
                      onChange={handleSelectChange('bannerAdPosition')}
                      label="Banner Position"
                    >
                      <MenuItem value="top">Top of screen</MenuItem>
                      <MenuItem value="bottom">Bottom of screen</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Banner Size</InputLabel>
                    <Select
                      value={settings.bannerAdSize}
                      onChange={handleSelectChange('bannerAdSize')}
                      label="Banner Size"
                    >
                      <MenuItem value="standard">Standard (320x50)</MenuItem>
                      <MenuItem value="large">Large Banner (320x100)</MenuItem>
                      <MenuItem value="smart">Smart Banner (adaptive)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Interstitial Ads */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <InterstitialIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Interstitial Ads (Use Carefully)
                </Typography>
                <Chip 
                  label="High Revenue" 
                  color="warning" 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
              
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Caution:</strong> Full-screen ads can impact user experience. 
                  Use sparingly at natural break points to maintain user satisfaction.
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.interstitialAdsEnabled}
                          onChange={handleSwitchChange('interstitialAdsEnabled')}
                        />
                      }
                      label="Enable Interstitial Ads"
                    />
                  </FormGroup>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Show Every X Actions</InputLabel>
                    <Select
                      value={settings.interstitialFrequency}
                      onChange={handleSelectChange('interstitialFrequency')}
                      label="Show Every X Actions"
                    >
                      <MenuItem value={3}>3 actions</MenuItem>
                      <MenuItem value={5}>5 actions</MenuItem>
                      <MenuItem value={7}>7 actions</MenuItem>
                      <MenuItem value={10}>10 actions</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Cooldown Between Ads</InputLabel>
                    <Select
                      value={settings.interstitialCooldown}
                      onChange={handleSelectChange('interstitialCooldown')}
                      label="Cooldown Between Ads"
                    >
                      <MenuItem value={120}>2 minutes</MenuItem>
                      <MenuItem value={180}>3 minutes</MenuItem>
                      <MenuItem value={300}>5 minutes</MenuItem>
                      <MenuItem value={600}>10 minutes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Frequency & Limits */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Frequency & Limits
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>First Ad Delay</InputLabel>
                    <Select
                      value={settings.firstAdDelay}
                      onChange={handleSelectChange('firstAdDelay')}
                      label="First Ad Delay"
                    >
                      <MenuItem value={0}>Immediate</MenuItem>
                      <MenuItem value={60}>1 minute</MenuItem>
                      <MenuItem value={300}>5 minutes</MenuItem>
                      <MenuItem value={600}>10 minutes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Max Ads Per Hour</InputLabel>
                    <Select
                      value={settings.maxAdsPerHour}
                      onChange={handleSelectChange('maxAdsPerHour')}
                      label="Max Ads Per Hour"
                    >
                      <MenuItem value={2}>2 ads</MenuItem>
                      <MenuItem value={3}>3 ads</MenuItem>
                      <MenuItem value={5}>5 ads</MenuItem>
                      <MenuItem value={8}>8 ads</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Max Ads Per Session</InputLabel>
                    <Select
                      value={settings.maxAdsPerSession}
                      onChange={handleSelectChange('maxAdsPerSession')}
                      label="Max Ads Per Session"
                    >
                      <MenuItem value={5}>5 ads</MenuItem>
                      <MenuItem value={8}>8 ads</MenuItem>
                      <MenuItem value={12}>12 ads</MenuItem>
                      <MenuItem value={20}>20 ads</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Content Filtering */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <FilterIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Content Filtering
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.childSafeAdsOnly}
                          onChange={handleSwitchChange('childSafeAdsOnly')}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Child-Safe Ads Only
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Only show family-friendly advertisements
                          </Typography>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.blockGameAds}
                          onChange={handleSwitchChange('blockGameAds')}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Block Gaming Ads
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Prevent gaming/entertainment ads in educational app
                          </Typography>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Development & Testing */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TestIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Development & Testing
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Enable Test Mode during development, disable for production. 
                  Test ads don't generate real revenue.
                </Typography>
              </Alert>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.testAdsEnabled}
                      onChange={handleSwitchChange('testAdsEnabled')}
                      color="warning"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Test Ads Mode
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Use test ads during development (no real revenue)
                      </Typography>
                    </Box>
                  }
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Tips */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RevenueIcon />
              💡 Revenue Optimization Tips
            </Typography>
            <Typography variant="body2" component="div">
              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>Start with <strong>Native + Rewarded ads</strong> for best user experience</li>
                <li>Enable <strong>Banner ads</strong> for consistent revenue stream</li>
                <li>Use <strong>Interstitial ads sparingly</strong> to avoid user frustration</li>
                <li>Monitor <strong>user retention</strong> when adjusting ad frequency</li>
                <li>Enable <strong>Test Mode</strong> during development, disable for production</li>
                <li>Keep <strong>Child-Safe filtering</strong> enabled for educational content</li>
              </Box>
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdSettings; 