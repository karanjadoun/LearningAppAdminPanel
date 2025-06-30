import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  TextField,
  Divider,
  Alert,
  Snackbar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  CloudUpload as CloudIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Storage as DatabaseIcon,
  CloudDownload as BackupIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useSetup } from '../contexts/SetupContext';
import { useAppConfig } from '../contexts/AppConfigContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`advanced-tabpanel-${index}`}
      aria-labelledby={`advanced-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdvancedSettings: React.FC = () => {
  const { setupState, resetSetup, saveFirebaseConfig } = useSetup();
  const { config, resetConfig } = useAppConfig();
  const [tabValue, setTabValue] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  });

  // Load existing Firebase config on component mount
  React.useEffect(() => {
    if (setupState.firebaseConfig) {
      setFirebaseConfig({
        apiKey: setupState.firebaseConfig.apiKey || '',
        authDomain: setupState.firebaseConfig.authDomain || '',
        projectId: setupState.firebaseConfig.projectId || '',
        storageBucket: setupState.firebaseConfig.storageBucket || '',
        messagingSenderId: setupState.firebaseConfig.messagingSenderId || '',
        appId: setupState.firebaseConfig.appId || '',
        measurementId: setupState.firebaseConfig.measurementId || '',
      });
    } else {
      // Try to load from localStorage as fallback
      try {
        const savedConfig = localStorage.getItem('firebaseConfig');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setFirebaseConfig({
            apiKey: parsed.apiKey || '',
            authDomain: parsed.authDomain || '',
            projectId: parsed.projectId || '',
            storageBucket: parsed.storageBucket || '',
            messagingSenderId: parsed.messagingSenderId || '',
            appId: parsed.appId || '',
            measurementId: parsed.measurementId || '',
          });
        }
      } catch (error) {
        console.error('Error loading Firebase config from localStorage:', error);
      }
    }
  }, [setupState.firebaseConfig]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportSettings = () => {
    const settings = {
      appConfig: config,
      setupState: setupState,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `admin-panel-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setShowSuccess(true);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string);
          // Import configurations
          if (settings.appConfig) {
            // updateConfig(settings.appConfig);
          }
          setShowSuccess(true);
        } catch (error) {
          console.error('Error importing settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCompleteReset = () => {
    resetSetup();
    resetConfig();
    setShowResetDialog(false);
    setShowSuccess(true);
  };

  const handleFirebaseUpdate = () => {
    saveFirebaseConfig(firebaseConfig);
    setShowSuccess(true);
  };

  // Utility function to mask sensitive values
  const maskSensitiveValue = (value: string): string => {
    if (!value || showSensitiveData) return value;
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
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
          Advanced Settings
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
          }}
        >
          Manage advanced configurations, database settings, and system maintenance
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="advanced settings tabs">
            <Tab label="Firebase Config" />
            <Tab label="Database Tools" />
            <Tab label="Backup & Restore" />
            <Tab label="System Reset" />
          </Tabs>
        </Box>

        {/* Firebase Configuration Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CloudIcon sx={{ fontSize: 24, mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Firebase Configuration Management
            </Typography>
            <Chip 
              label={setupState.firebaseConfig ? "Connected" : "Not Connected"} 
              color={setupState.firebaseConfig ? "success" : "warning"}
              size="small"
              sx={{ ml: 2 }}
            />
            <Box sx={{ ml: 'auto' }}>
              <Tooltip title={showSensitiveData ? "Hide sensitive data" : "Show sensitive data"}>
                <IconButton
                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  {showSensitiveData ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Update your Firebase configuration here. Changes will take effect after page refresh.
              Make sure to test your configuration before saving.<br />
              <strong>Security:</strong> Sensitive fields are hidden by default. Use the visibility toggle to show/hide values.
            </Typography>
          </Alert>

                      <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Key"
                  type={showSensitiveData ? "text" : "password"}
                  value={showSensitiveData ? firebaseConfig.apiKey : maskSensitiveValue(firebaseConfig.apiKey)}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  helperText="Your Firebase API key (sensitive)"
                  InputProps={{
                    style: { fontFamily: showSensitiveData ? 'inherit' : 'monospace' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Auth Domain"
                  value={firebaseConfig.authDomain}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, authDomain: e.target.value }))}
                  helperText="Authentication domain"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project ID"
                  value={firebaseConfig.projectId}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, projectId: e.target.value }))}
                  helperText="Firebase project ID"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Storage Bucket"
                  value={firebaseConfig.storageBucket}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, storageBucket: e.target.value }))}
                  helperText="Cloud Storage bucket"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Messaging Sender ID"
                  type={showSensitiveData ? "text" : "password"}
                  value={showSensitiveData ? firebaseConfig.messagingSenderId : maskSensitiveValue(firebaseConfig.messagingSenderId)}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, messagingSenderId: e.target.value }))}
                  helperText="FCM sender ID (sensitive)"
                  InputProps={{
                    style: { fontFamily: showSensitiveData ? 'inherit' : 'monospace' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="App ID"
                  type={showSensitiveData ? "text" : "password"}
                  value={showSensitiveData ? firebaseConfig.appId : maskSensitiveValue(firebaseConfig.appId)}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, appId: e.target.value }))}
                  helperText="Firebase app ID (sensitive)"
                  InputProps={{
                    style: { fontFamily: showSensitiveData ? 'inherit' : 'monospace' }
                  }}
                />
              </Grid>
            </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleFirebaseUpdate}
              startIcon={<CloudIcon />}
            >
              Update Configuration
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
            >
              Test Connection
            </Button>
          </Box>
        </TabPanel>

        {/* Database Tools Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <DatabaseIcon sx={{ fontSize: 24, mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Database Management Tools
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <DatabaseIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Initialize Sample Data
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create sample categories and content to get started quickly
                </Typography>
                <Button variant="contained" color="info" startIcon={<PlayIcon />}>
                  Create Sample Data
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <RefreshIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Database Migration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Update database structure to latest version
                </Typography>
                <Button variant="contained" color="warning" startIcon={<RefreshIcon />}>
                  Run Migration
                </Button>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Database Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Collections
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  245
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Documents
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  2.4MB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Storage Used
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  1,234
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reads
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Backup & Restore Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <BackupIcon sx={{ fontSize: 24, mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Backup & Restore System
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Export Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Download your current configuration as a backup file
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleExportSettings}
                  startIcon={<DownloadIcon />}
                  fullWidth
                >
                  Export Configuration
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Import Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Restore configuration from a backup file
                </Typography>
                <input
                  accept=".json"
                  style={{ display: 'none' }}
                  id="import-settings-button"
                  type="file"
                  onChange={handleImportSettings}
                />
                <label htmlFor="import-settings-button">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Import Configuration
                  </Button>
                </label>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Automatic Backups
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Daily Configuration Backup"
                secondary="Automatically backup your settings every day"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label=""
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Weekly Content Backup"
                secondary="Backup your content data weekly"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label=""
              />
            </ListItem>
          </List>
        </TabPanel>

        {/* System Reset Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <RefreshIcon sx={{ fontSize: 24, mr: 2, color: 'error.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              System Reset & Maintenance
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> These actions will reset your admin panel configuration. 
              Make sure to backup your settings before proceeding.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, border: '1px solid', borderColor: 'warning.main' }}>
                <WarningIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Restart Setup Wizard
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Go through the initial setup process again
                </Typography>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => resetSetup()}
                  startIcon={<PlayIcon />}
                >
                  Restart Setup
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
                <DeleteIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Complete Reset
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Reset all settings to factory defaults
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setShowResetDialog(true)}
                  startIcon={<DeleteIcon />}
                >
                  Factory Reset
                </Button>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Complete System Reset</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to reset everything to factory defaults?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action will:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Reset all branding and customization" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Clear Firebase configuration" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Remove all saved preferences" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Restart the setup wizard" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button onClick={handleCompleteReset} color="error" variant="contained">
            Reset Everything
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Operation completed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdvancedSettings; 