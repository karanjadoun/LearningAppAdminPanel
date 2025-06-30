import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  LinearProgress,
  Link,
} from '@mui/material';
import {
  Rocket as RocketIcon,
  CloudUpload as CloudIcon,
  Palette as PaletteIcon,
  Storage as DatabaseIcon,
  CheckCircle as CheckIcon,
  Launch as LaunchIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useSetup } from '../../contexts/SetupContext';
import { useAppConfig } from '../../contexts/AppConfigContext';

const steps = [
  'Welcome',
  'Firebase Setup',
  'Customization',
  'Database Setup',
  'Complete',
];

const SetupWizard: React.FC = () => {
  const { setupState, updateSetupState, completeSetup, saveFirebaseConfig, testFirebaseConnection } = useSetup();
  const { updateConfig } = useAppConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firebaseForm, setFirebaseForm] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  });
  const [customizationForm, setCustomizationForm] = useState({
    appName: 'MyApp',
    appTitle: 'Admin Panel',
    appDescription: 'Manage your content and configurations',
    logoText: 'MA',
  });

  const handleNext = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validate current step
      if (setupState.currentStep === 1) {
        // Firebase setup validation
        const isValid = await testFirebaseConnection(firebaseForm);
        if (!isValid) {
          setError('Firebase configuration is invalid. Please check your credentials.');
          setLoading(false);
          return;
        }
        saveFirebaseConfig(firebaseForm);
      } else if (setupState.currentStep === 2) {
        // Save customization
        updateConfig(customizationForm);
      }

      updateSetupState({ currentStep: setupState.currentStep + 1 });
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    updateSetupState({ currentStep: setupState.currentStep - 1 });
  };

  const handleComplete = () => {
    completeSetup();
  };

  const renderStepContent = () => {
    switch (setupState.currentStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <RocketIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Welcome to Admin Panel Pro
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto', color: 'text.secondary' }}>
              Transform your content management with our professional admin panel. 
              This wizard will help you set up everything in just a few minutes - no coding required!
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <CloudIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Firebase Integration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connect your Firebase project for secure data storage and authentication
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <PaletteIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Custom Branding
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Personalize your admin panel with your brand colors and logo
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <DatabaseIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Auto Database Setup
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automatically configure your database structure for content management
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 4, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Before you start:</strong> Make sure you have a Firebase project ready. 
                Don't have one? <Link href="https://console.firebase.google.com" target="_blank" rel="noopener">
                  Create a Firebase project
                </Link> (it's free!)
              </Typography>
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <CloudIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Firebase Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your Firebase project credentials to connect your database
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Where to find these values?</strong><br />
                1. Go to <Link href="https://console.firebase.google.com" target="_blank">Firebase Console</Link><br />
                2. Select your project → Project Settings → General tab<br />
                3. Scroll down to "Your apps" section and click on Web app<br />
                4. Copy the config values from the Firebase SDK snippet
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Key"
                  value={firebaseForm.apiKey}
                  onChange={(e) => setFirebaseForm(prev => ({ ...prev, apiKey: e.target.value }))}
                  helperText="Your Firebase API key"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Auth Domain"
                  value={firebaseForm.authDomain}
                  onChange={(e) => setFirebaseForm(prev => ({ ...prev, authDomain: e.target.value }))}
                  helperText="Usually projectname.firebaseapp.com"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project ID"
                  value={firebaseForm.projectId}
                  onChange={(e) => setFirebaseForm(prev => ({ ...prev, projectId: e.target.value }))}
                  helperText="Your Firebase project ID"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Storage Bucket"
                  value={firebaseForm.storageBucket}
                  onChange={(e) => setFirebaseForm(prev => ({ ...prev, storageBucket: e.target.value }))}
                  helperText="Usually projectname.appspot.com"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Messaging Sender ID"
                  value={firebaseForm.messagingSenderId}
                  onChange={(e) => setFirebaseForm(prev => ({ ...prev, messagingSenderId: e.target.value }))}
                  helperText="Numeric sender ID"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="App ID"
                  value={firebaseForm.appId}
                  onChange={(e) => setFirebaseForm(prev => ({ ...prev, appId: e.target.value }))}
                  helperText="Your Firebase app ID"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Measurement ID (Optional)"
                  value={firebaseForm.measurementId}
                  onChange={(e) => setFirebaseForm(prev => ({ ...prev, measurementId: e.target.value }))}
                  helperText="Google Analytics measurement ID (optional)"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <PaletteIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Customize Your Admin Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Make it yours! Customize the branding and appearance
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Application Name"
                  value={customizationForm.appName}
                  onChange={(e) => setCustomizationForm(prev => ({ ...prev, appName: e.target.value }))}
                  helperText="Your app/company name (e.g., MyCompany, EduHub)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Panel Title"
                  value={customizationForm.appTitle}
                  onChange={(e) => setCustomizationForm(prev => ({ ...prev, appTitle: e.target.value }))}
                  helperText="Subtitle for your admin panel"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={customizationForm.appDescription}
                  onChange={(e) => setCustomizationForm(prev => ({ ...prev, appDescription: e.target.value }))}
                  helperText="Brief description of your admin panel"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Logo Text"
                  value={customizationForm.logoText}
                  onChange={(e) => setCustomizationForm(prev => ({ ...prev, logoText: e.target.value.substring(0, 3) }))}
                  helperText="2-3 characters for logo (e.g., MC, EH, XY)"
                  inputProps={{ maxLength: 3 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Preview:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    >
                      {customizationForm.logoText}
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {customizationForm.appName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customizationForm.appTitle}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <DatabaseIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Database Initialization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We'll set up your database structure automatically
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>What we'll create for you:</strong><br />
                • Content collections with proper structure<br />
                • Authentication rules for secure access<br />
                • Sample data to get you started<br />
                • Backup and restore functionality
              </Typography>
            </Alert>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Database Structure Preview
              </Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'text.secondary' }}>
                📁 learning_data/<br />
                &nbsp;&nbsp;├── 📄 category1/<br />
                &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── 🏷️ title: "Sample Category"<br />
                &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── 🎨 colorHex: "#6366f1"<br />
                &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── 📁 children/<br />
                &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── 📄 topic1/<br />
                &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── 🏷️ title: "Sample Topic"<br />
                &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── 📄 content: "Your content here"<br />
              </Box>
            </Paper>

            <Box sx={{ mt: 3, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                ✅ Ready to initialize! Click "Next" to create your database structure.
              </Typography>
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              🎉 Setup Complete!
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto', color: 'text.secondary' }}>
              Congratulations! Your admin panel is now ready to use. You can start managing your content right away.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'success.light' }}>
                  <CheckIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Firebase Connected
                  </Typography>
                  <Typography variant="body2">
                    Your database is ready for content
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'info.light' }}>
                  <PaletteIcon sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Brand Customized
                  </Typography>
                  <Typography variant="body2">
                    Your personal branding is applied
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'warning.light' }}>
                  <LaunchIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Ready to Launch
                  </Typography>
                  <Typography variant="body2">
                    Start creating amazing content
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Next Steps:</strong><br />
                1. Explore the Dashboard to see your content overview<br />
                2. Visit Content Management to create your first content<br />
                3. Check Settings to fine-tune your preferences<br />
                4. Visit our documentation for advanced features
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Card sx={{ maxWidth: 900, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Progress Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Setup Progress
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(setupState.currentStep / (steps.length - 1)) * 100} 
              sx={{ mb: 2 }}
            />
            <Stepper activeStep={setupState.currentStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ minHeight: 400 }}>
            {renderStepContent()}
          </Box>

          {/* Navigation Buttons */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={setupState.currentStep === 0 || loading}
            >
              Back
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {setupState.currentStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleComplete}
                  startIcon={<LaunchIcon />}
                  size="large"
                >
                  Launch Admin Panel
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Processing...' : 'Next'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SetupWizard; 