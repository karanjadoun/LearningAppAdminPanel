import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  PlayArrow as TestIcon,
  ExpandMore as ExpandMoreIcon,
  Launch as LaunchIcon,
  Key as KeyIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { appConfigService } from '../../services/appConfigService';
import { OneSignalConfig, TestNotification } from '../../types';

const OneSignalSettings: React.FC = () => {
  const [config, setConfig] = useState<OneSignalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<OneSignalConfig>>({});
  
  // Test notification state
  const [testNotification, setTestNotification] = useState<TestNotification>({
    title: 'Test Notification',
    message: 'This is a test notification from your admin panel!',
    data: { test: true }
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load OneSignal configuration on component mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const oneSignalConfig = await appConfigService.getOneSignalConfig();
      setConfig(oneSignalConfig);
      setFormData(oneSignalConfig || {});
    } catch (error) {
      console.error('Error loading OneSignal config:', error);
      showSnackbar('Error loading OneSignal configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await appConfigService.saveOneSignalConfig(formData);
      
      if (response.success) {
        setConfig({ ...config, ...formData } as OneSignalConfig);
        showSnackbar('OneSignal configuration saved successfully!', 'success');
      } else {
        showSnackbar(response.message || 'Error saving configuration', 'error');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showSnackbar('Error saving configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!formData.oneSignalAppId || !formData.oneSignalRestApiKey) {
      showSnackbar('Please enter both App ID and REST API Key', 'error');
      return;
    }

    try {
      setValidating(true);
      const response = await appConfigService.validateOneSignalConfig(
        formData.oneSignalAppId,
        formData.oneSignalRestApiKey
      );
      
      if (response.success) {
        showSnackbar(response.message || 'OneSignal configuration is valid!', 'success');
      } else {
        showSnackbar(response.message || 'Invalid OneSignal configuration', 'error');
      }
    } catch (error) {
      showSnackbar('Error validating configuration', 'error');
    } finally {
      setValidating(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setSendingTest(true);
      const response = await appConfigService.sendTestNotification(testNotification);
      
      if (response.success) {
        showSnackbar(response.message || 'Test notification sent successfully!', 'success');
        setShowTestDialog(false);
      } else {
        showSnackbar(response.message || 'Failed to send test notification', 'error');
      }
    } catch (error) {
      showSnackbar('Error sending test notification', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleInputChange = (field: keyof OneSignalConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* OneSignal Configuration Card */}
      <Card
        sx={{
          mb: 3,
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          },
          transition: 'box-shadow 0.3s ease-in-out',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <NotificationsIcon sx={{ fontSize: 24, mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              OneSignal Push Notifications
            </Typography>
            <Chip
              label={config?.notificationsEnabled ? "Enabled" : "Disabled"}
              color={config?.notificationsEnabled ? "success" : "default"}
              size="small"
            />
          </Box>

          <Grid container spacing={3}>
            {/* App ID Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="OneSignal App ID"
                value={formData.oneSignalAppId || ''}
                onChange={(e) => handleInputChange('oneSignalAppId', e.target.value)}
                placeholder="e.g., 12345678-1234-1234-1234-123456789012"
                helperText="Find this in your OneSignal dashboard → Settings → Keys & IDs"
                InputProps={{
                  startAdornment: <KeyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            {/* REST API Key Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="OneSignal REST API Key"
                type="password"
                value={formData.oneSignalRestApiKey || ''}
                onChange={(e) => handleInputChange('oneSignalRestApiKey', e.target.value)}
                placeholder="Your REST API Key"
                helperText="Find this in your OneSignal dashboard → Settings → Keys & IDs"
                InputProps={{
                  startAdornment: <KeyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            {/* App Name Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="App Name"
                value={formData.appName || ''}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                placeholder="Learning App"
                helperText="Name that appears in notifications"
              />
            </Grid>

            {/* Notifications Toggle */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notificationsEnabled !== false}
                      onChange={(e) => handleInputChange('notificationsEnabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable Push Notifications"
                />
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={validating ? <CircularProgress size={16} /> : <CheckCircleIcon />}
              onClick={handleValidate}
              disabled={validating || !formData.oneSignalAppId || !formData.oneSignalRestApiKey}
            >
              {validating ? 'Validating...' : 'Validate Keys'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<TestIcon />}
              onClick={() => setShowTestDialog(true)}
              disabled={!config?.oneSignalAppId || !config?.oneSignalRestApiKey}
            >
              Send Test Notification
            </Button>

            <Button
              variant="text"
              startIcon={<InfoIcon />}
              onClick={() => setShowInstructions(true)}
            >
              Setup Instructions
            </Button>
          </Box>

          {/* Configuration Status */}
          {config && (
            <Box sx={{ mt: 3 }}>
              <Alert 
                severity={config.oneSignalAppId && config.oneSignalRestApiKey ? "success" : "warning"}
                sx={{ mb: 2 }}
              >
                {config.oneSignalAppId && config.oneSignalRestApiKey 
                  ? "OneSignal is configured and ready to send notifications"
                  : "OneSignal configuration is incomplete. Please enter your App ID and REST API Key."
                }
              </Alert>
              
              {config.updatedAt && (
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date(config.updatedAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Test Notification Dialog */}
      <Dialog 
        open={showTestDialog} 
        onClose={() => setShowTestDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SendIcon sx={{ mr: 2 }} />
            Send Test Notification
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notification Title"
                value={testNotification.title}
                onChange={(e) => setTestNotification(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notification Message"
                value={testNotification.message}
                onChange={(e) => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
              />
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            This will send a notification to all users who have your app installed and have notifications enabled.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTestDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={sendingTest ? <CircularProgress size={16} /> : <SendIcon />}
            onClick={handleSendTest}
            disabled={sendingTest || !testNotification.title || !testNotification.message}
          >
            {sendingTest ? 'Sending...' : 'Send Test'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Setup Instructions Dialog */}
      <Dialog 
        open={showInstructions} 
        onClose={() => setShowInstructions(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 2 }} />
            OneSignal Setup Instructions
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Quick Setup */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Quick Setup Guide
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        1
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Create OneSignal Account" 
                      secondary={
                        <span>
                          Go to{' '}
                          <Link href="https://onesignal.com" target="_blank" rel="noopener">
                            OneSignal.com <LaunchIcon sx={{ fontSize: 12, ml: 0.5 }} />
                          </Link>
                          {' '}and create a free account
                        </span>
                      }
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        2
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Create New App" 
                      secondary="Click 'New App/Website' and select 'Android' platform"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        3
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Configure Android" 
                      secondary="Upload your Firebase Server Key and Sender ID from Firebase Console"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        4
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Get Required Keys" 
                      secondary="Go to Settings → Keys & IDs and copy the App ID and REST API Key"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: 'success.main', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        5
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Configure in Admin Panel" 
                      secondary="Paste the App ID and REST API Key in the form above and save"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Database Structure Info */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Database Structure
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Firestore Collection:</strong> <code>app_config</code><br />
                    <strong>Document:</strong> <code>main_config</code>
                  </Typography>
                </Alert>
                <Typography variant="body2" component="div">
                  The OneSignal configuration is automatically stored in your Firebase Firestore database. 
                  Your mobile app can read this configuration on startup to dynamically configure push notifications 
                  without requiring app updates.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Features */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Features Included
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Dynamic Configuration" secondary="No hardcoded keys" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Test Notifications" secondary="Send test notifications" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Validation" secondary="Verify API keys" />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Firebase Integration" secondary="Stored in Firestore" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Enable/Disable" secondary="Toggle notifications" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Easy Setup" secondary="CodeCanyon ready" />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInstructions(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OneSignalSettings; 